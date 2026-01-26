import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { getExecutor } from "../workflow/executor-registry";
import { WorkflowContext } from "../workflow/types";

export const executeWorkflow = inngest.createFunction(
    { id: "execute-workflow", name: "Execute Workflow" },
    { event: "workflow/execute" },
    async ({ event, step }) => {
        const { workflowId, trigger = "manual", initialData = {} } = event.data as {
            workflowId: string;
            trigger?: "manual" | "webhook" | "schedule";
            initialData?: Record<string, any>;
        };

        // 1. Fetch workflow
        const workflow = await step.run("fetch-workflow", async () => {
            const wf = await prisma.workflow.findUnique({
                where: { id: workflowId },
            });
            if (!wf) throw new Error("Workflow not found");
            return wf;
        });

        const nodes = workflow.nodes as any[];
        const edges = workflow.edges as any[];

        // 2. Create Execution record
        const execution = await step.run("create-execution", async () => {
            return await prisma.execution.create({
                data: {
                    workflowId: workflow.id,
                    userId: workflow.userId,
                    status: "RUNNING",
                    startedAt: new Date(),
                    input: { trigger, ...initialData },
                }
            });
        });

        try {
            // 3. Dynamic Execution (Edge Following)
            // Initialize context with trigger data from webhook/schedule
            let context: WorkflowContext = { ...initialData };


            // Start with the 'start' node
            let currentNode = nodes.find(n => n.type === "start");

            if (!currentNode) {
                throw new Error("Workflow must have a start node");
            }

            const executedNodes = new Set<string>();
            let iterations = 0;
            const MAX_ITERATIONS = 100; // Safeguard against infinite loops

            while (currentNode && iterations < MAX_ITERATIONS) {
                iterations++;
                const node = currentNode; // Capture for the loop

                await step.run(`log-node-start-${node.id}-${iterations}`, async () => {
                    await prisma.executionLog.create({
                        data: {
                            executionId: execution.id,
                            nodeId: node.id,
                            message: `Starting node: ${node.data?.label || node.id}`,
                            level: "INFO",
                        }
                    });
                });

                // Execute node
                const executor = getExecutor(node.type);
                context = await executor({ node, context, step });

                await step.run(`log-node-success-${node.id}-${iterations}`, async () => {
                    const nodeOutput = context[node.id];
                    await prisma.executionLog.create({
                        data: {
                            executionId: execution.id,
                            nodeId: node.id,
                            message: `Completed node: ${node.data?.label || node.id}`,
                            level: "INFO",
                            data: nodeOutput ? JSON.parse(JSON.stringify(nodeOutput)) : undefined,
                        }
                    });
                });

                // Determine next node
                const nodeEdges = edges.filter(e => e.source === node.id);
                let nextNodeId: string | null = null;

                if (node.type === "ifelse") {
                    const result = context[node.id]?.result;
                    const edge = nodeEdges.find(e => e.sourceHandle === (result ? "true" : "false"));
                    nextNodeId = edge?.target || null;
                } else if (node.type === "loop") {
                    const isFinished = context[node.id]?.isFinished;
                    const edge = nodeEdges.find(e => e.sourceHandle === (isFinished ? "done" : "loop"));
                    nextNodeId = edge?.target || null;
                } else {
                    // Linear flow
                    nextNodeId = nodeEdges[0]?.target || null;
                }

                if (nextNodeId) {
                    currentNode = nodes.find(n => n.id === nextNodeId) || null;
                } else {
                    currentNode = null;
                }
            }

            if (iterations >= MAX_ITERATIONS) {
                throw new Error("Max iterations reached. Possible infinite loop detected.");
            }

            // 4. Finalize Execution
            await step.run("finalize-execution-success", async () => {
                await prisma.execution.update({
                    where: { id: execution.id },
                    data: {
                        status: "COMPLETED",
                        completedAt: new Date(),
                        output: JSON.parse(JSON.stringify(context)),
                    }
                });

                await prisma.workflow.update({
                    where: { id: workflowId },
                    data: {
                        lastRunAt: new Date(),
                        runCount: { increment: 1 },
                    }
                });
            });

            return { success: true, context };

        } catch (error: any) {
            console.error("Workflow execution failed:", error);

            await step.run("finalize-execution-error", async () => {
                await prisma.execution.update({
                    where: { id: execution.id },
                    data: {
                        status: "FAILED",
                        completedAt: new Date(),
                        error: error.message,
                    }
                });

                await prisma.executionLog.create({
                    data: {
                        executionId: execution.id,
                        message: `Workflow failed: ${error.message}`,
                        level: "ERROR",
                    }
                });
            });

            throw error;
        }
    }
);

/**
 * Workflow Scheduler - Runs every minute to check for scheduled workflows
 * Uses Inngest cron to trigger workflows based on their cron expressions
 */
export const workflowScheduler = inngest.createFunction(
    { id: "workflow-scheduler", name: "Workflow Scheduler" },
    { cron: "* * * * *" }, // Run every minute
    async ({ step }) => {
        // Get all workflows with schedules enabled
        const workflows = await step.run("fetch-scheduled-workflows", async () => {
            return await prisma.workflow.findMany({
                where: {
                    scheduleEnabled: true,
                    scheduleCron: { not: null },
                    isActive: true,
                },
                select: {
                    id: true,
                    name: true,
                    scheduleCron: true,
                    scheduleTimezone: true,
                    lastRunAt: true,
                }
            });
        });

        if (workflows.length === 0) {
            return { triggered: 0 };
        }

        // Check each workflow's cron against current time
        const now = new Date();
        const triggeredWorkflows: string[] = [];

        for (const workflow of workflows) {
            const shouldRun = await step.run(`check-schedule-${workflow.id}`, async () => {
                if (!workflow.scheduleCron) return false;

                // Simple cron matching for common patterns
                // Format: minute hour day month weekday
                const parts = workflow.scheduleCron.split(" ");
                if (parts.length !== 5) return false;

                const [cronMin, cronHour, cronDay, cronMonth, cronWeekday] = parts;
                const currentMin = now.getMinutes();
                const currentHour = now.getHours();
                const currentDay = now.getDate();
                const currentMonth = now.getMonth() + 1;
                const currentWeekday = now.getDay();

                const matches = (cronValue: string, current: number): boolean => {
                    if (cronValue === "*") return true;
                    if (cronValue.includes("/")) {
                        const [, step] = cronValue.split("/");
                        return current % parseInt(step) === 0;
                    }
                    if (cronValue.includes(",")) {
                        return cronValue.split(",").map(Number).includes(current);
                    }
                    return parseInt(cronValue) === current;
                };

                return (
                    matches(cronMin, currentMin) &&
                    matches(cronHour, currentHour) &&
                    matches(cronDay, currentDay) &&
                    matches(cronMonth, currentMonth) &&
                    matches(cronWeekday, currentWeekday)
                );
            });

            if (shouldRun) {
                await step.run(`trigger-${workflow.id}`, async () => {
                    await inngest.send({
                        name: "workflow/execute",
                        data: {
                            workflowId: workflow.id,
                            trigger: "schedule",
                            initialData: {
                                schedule: {
                                    cron: workflow.scheduleCron,
                                    triggeredAt: now.toISOString(),
                                }
                            }
                        }
                    });
                });
                triggeredWorkflows.push(workflow.id);
            }
        }

        return { triggered: triggeredWorkflows.length, workflowIds: triggeredWorkflows };
    }
);
