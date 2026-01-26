"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
    // Admin bypass mode
    if (process.env.ADMIN_MODE === "true") {
        return {
            user: {
                id: "admin-bypass",
                email: "admin@admin.com",
                name: "Admin User",
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                image: null // Add image property to match session type
            },
            session: {
                id: "session-bypass",
                expiresAt: new Date(Date.now() + 86400000),
                token: "admin-token",
                createdAt: new Date(),
                updatedAt: new Date(),
                ipAddress: "127.0.0.1",
                userAgent: "Admin Bypass",
                userId: "admin-bypass"
            }
        };
    }

    return await auth.api.getSession({
        headers: await headers(),
    });
}

export async function listWorkflows() {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    return await prisma.workflow.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
    });
}

export async function createWorkflow(name: string, description?: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    // Get or create a default workspace for now
    let workspace = await prisma.workspace.findFirst({
        where: { members: { some: { userId: session.user.id } } }
    });

    if (!workspace) {
        workspace = await prisma.workspace.create({
            data: {
                name: "My Workspace",
                slug: `workspace-${session.user.id.slice(0, 5)}`,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "OWNER"
                    }
                }
            }
        });
    }

    const workflow = await prisma.workflow.create({
        data: {
            name,
            description,
            userId: session.user.id,
            workspaceId: workspace.id,
            nodes: [],
            edges: [],
        }
    });

    revalidatePath("/dashboard");
    return workflow;
}

export async function getWorkflow(id: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    return await prisma.workflow.findUnique({
        where: { id, userId: session.user.id },
    });
}

export async function updateWorkflow(id: string, data: { name?: string; description?: string; nodes?: any; edges?: any; isActive?: boolean }) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const workflow = await prisma.workflow.update({
        where: { id, userId: session.user.id },
        data: {
            ...data,
            updatedAt: new Date(),
        }
    });

    revalidatePath(`/dashboard/workflows/${id}`);
    revalidatePath("/dashboard");
    return workflow;
}

export async function triggerWorkflow(workflowId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId, userId: session.user.id }
    });

    if (!workflow) throw new Error("Workflow not found");

    await inngest.send({
        name: "workflow/execute",
        data: {
            workflowId,
        }
    });

    return { success: true };
}

export async function listExecutions(workflowId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    return await prisma.execution.findMany({
        where: { workflowId, userId: session.user.id },
        orderBy: { startedAt: "desc" },
        include: {
            logs: {
                orderBy: { createdAt: "asc" }
            }
        }
    });
}

export async function getLatestExecution(workflowId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    return await prisma.execution.findFirst({
        where: { workflowId, userId: session.user.id },
        orderBy: { startedAt: "desc" },
        include: {
            logs: {
                orderBy: { createdAt: "asc" }
            }
        }
    });
}

export async function deleteWorkflow(id: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.workflow.delete({
        where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function duplicateWorkflow(id: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const workflow = await prisma.workflow.findUnique({
        where: { id, userId: session.user.id },
    });

    if (!workflow) throw new Error("Workflow not found");

    const duplicated = await prisma.workflow.create({
        data: {
            name: `${workflow.name} (Copy)`,
            description: workflow.description,
            userId: session.user.id,
            workspaceId: workflow.workspaceId,
            nodes: workflow.nodes || [],
            edges: workflow.edges || [],
        }
    });

    revalidatePath("/dashboard");
    return duplicated;
}

export async function listExecutionsByUser() {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    return await prisma.execution.findMany({
        where: { userId: session.user.id },
        orderBy: { startedAt: "desc" },
        include: {
            workflow: {
                select: { name: true }
            }
        }
    });
}

// --- Webhook Management ---

export async function getWebhookInfo(workflowId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId, userId: session.user.id },
        select: {
            id: true,
            webhookToken: true,
            webhookEnabled: true,
        }
    });

    if (!workflow) throw new Error("Workflow not found");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/webhook/${workflowId}?token=${workflow.webhookToken}`;

    return {
        webhookUrl,
        webhookToken: workflow.webhookToken,
        webhookEnabled: workflow.webhookEnabled,
    };
}

export async function toggleWebhook(workflowId: string, enabled: boolean) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const workflow = await prisma.workflow.update({
        where: { id: workflowId, userId: session.user.id },
        data: { webhookEnabled: enabled },
        select: { id: true, webhookEnabled: true }
    });

    revalidatePath(`/dashboard/workflows/${workflowId}`);
    return workflow;
}

export async function regenerateWebhookToken(workflowId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const crypto = await import("crypto");
    const newToken = crypto.randomUUID();

    const workflow = await prisma.workflow.update({
        where: { id: workflowId, userId: session.user.id },
        data: { webhookToken: newToken },
        select: { id: true, webhookToken: true }
    });

    revalidatePath(`/dashboard/workflows/${workflowId}`);
    return workflow;
}

// --- Schedule Management ---

// Common cron presets for UI
export const SCHEDULE_PRESETS = {
    "every-minute": { label: "Every Minute", cron: "* * * * *" },
    "every-5-minutes": { label: "Every 5 Minutes", cron: "*/5 * * * *" },
    "every-15-minutes": { label: "Every 15 Minutes", cron: "*/15 * * * *" },
    "every-hour": { label: "Every Hour", cron: "0 * * * *" },
    "every-day-9am": { label: "Daily at 9 AM", cron: "0 9 * * *" },
    "every-day-midnight": { label: "Daily at Midnight", cron: "0 0 * * *" },
    "every-monday-9am": { label: "Mondays at 9 AM", cron: "0 9 * * 1" },
    "weekdays-9am": { label: "Weekdays at 9 AM", cron: "0 9 * * 1-5" },
} as const;

export async function getScheduleInfo(workflowId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId, userId: session.user.id },
        select: {
            id: true,
            scheduleEnabled: true,
            scheduleCron: true,
            scheduleTimezone: true,
            isActive: true,
        }
    });

    if (!workflow) throw new Error("Workflow not found");

    return workflow;
}

export async function updateSchedule(
    workflowId: string,
    data: {
        enabled?: boolean;
        cron?: string | null;
        timezone?: string;
    }
) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const updateData: Record<string, any> = {};

    if (data.enabled !== undefined) {
        updateData.scheduleEnabled = data.enabled;
    }
    if (data.cron !== undefined) {
        updateData.scheduleCron = data.cron;
    }
    if (data.timezone) {
        updateData.scheduleTimezone = data.timezone;
    }

    const workflow = await prisma.workflow.update({
        where: { id: workflowId, userId: session.user.id },
        data: updateData,
        select: {
            id: true,
            scheduleEnabled: true,
            scheduleCron: true,
            scheduleTimezone: true,
        }
    });

    revalidatePath(`/dashboard/workflows/${workflowId}`);
    return workflow;
}
