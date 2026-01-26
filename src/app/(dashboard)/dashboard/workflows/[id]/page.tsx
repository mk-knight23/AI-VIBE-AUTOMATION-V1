"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getWorkflow, updateWorkflow as updateWorkflowAction, triggerWorkflow, getLatestExecution } from "@/actions/workflows";
import { Node, Edge, ReactFlowProvider } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Save, Play, Settings, Loader2, Clock } from "lucide-react";
import Link from "next/link";

import NodeSidebar from "@/components/agent-builder/NodeSidebar";
import AgentCanvas from "@/components/agent-builder/AgentCanvas";
import SettingsPanel from "@/components/agent-builder/SettingsPanel";

export default function AgentEditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const queryClient = useQueryClient();
    const { data: workflow, isLoading } = useQuery({
        queryKey: ["workflow", id],
        queryFn: () => getWorkflow(id),
    });

    const { data: latestExecution } = useQuery({
        queryKey: ["latestExecution", id],
        queryFn: () => getLatestExecution(id),
        refetchInterval: (query: any) => (query.state.data?.status === "RUNNING" ? 1000 : 5000),
    });

    const { mutateAsync: saveWorkflow } = useMutation({
        mutationFn: (data: any) => updateWorkflowAction(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflow", id] });
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        }
    });

    const { mutateAsync: runWorkflow, isPending: isRunning } = useMutation({
        mutationFn: () => triggerWorkflow(id),
        onSuccess: () => {
            toast.success("Workflow started!");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to start workflow");
        }
    });

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [agentName, setAgentName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Load workflow data
    useEffect(() => {
        if (workflow) {
            let processedNodes = (workflow.nodes as any[]) || [];

            // Inject execution status if available
            if (latestExecution) {
                processedNodes = processedNodes.map(node => {
                    const nodeLogs = latestExecution.logs.filter((log: any) => log.nodeId === node.id);
                    const isSuccess = nodeLogs.some((log: any) => log.message.includes("Completed node"));
                    const isRunning = latestExecution.status === "RUNNING" && !isSuccess && nodeLogs.length > 0;
                    const isError = nodeLogs.some((log: any) => log.level === "ERROR");

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            executionStatus: isRunning ? "running" : isSuccess ? "success" : isError ? "error" : "idle"
                        }
                    };
                });
            }

            setNodes(processedNodes);
            setEdges((workflow.edges as any) || []);
            setAgentName(workflow.name);
        }
    }, [workflow, latestExecution]);

    // Track changes
    const handleNodesChange = useCallback((newNodes: Node[]) => {
        setNodes(newNodes);
        setHasChanges(true);
    }, []);

    const handleEdgesChange = useCallback((newEdges: Edge[]) => {
        setEdges(newEdges);
        setHasChanges(true);
    }, []);

    // Update node data
    const handleNodeUpdate = useCallback((nodeId: string, data: Record<string, unknown>) => {
        setNodes((nds) =>
            nds.map((node) => (node.id === nodeId ? { ...node, data } : node))
        );
        setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data } : prev));
        setHasChanges(true);
    }, []);

    // Save workflow
    const handleSave = async () => {
        if (!workflow) return;

        setIsSaving(true);
        try {
            await saveWorkflow({
                name: agentName,
                nodes: nodes.map((n) => ({
                    id: n.id,
                    type: n.type || "default",
                    position: n.position,
                    data: n.data,
                    width: n.width,
                    height: n.height,
                })),
                edges: edges.map((e) => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    sourceHandle: e.sourceHandle || undefined,
                    targetHandle: e.targetHandle || undefined,
                    animated: e.animated,
                    type: e.type,
                })),
            });

            setHasChanges(false);
            toast.success("Workflow saved successfully!");
        } catch (error) {
            toast.error("Failed to save workflow");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !workflow) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <ReactFlowProvider>
            <div className="h-screen flex flex-col">
                {/* Header */}
                <header className="h-14 border-b border-border/40 bg-card/50 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/workflows">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🤖</span>
                            <Input
                                value={agentName}
                                onChange={(e) => {
                                    setAgentName(e.target.value);
                                    setHasChanges(true);
                                }}
                                className="border-none bg-transparent font-semibold text-lg focus-visible:ring-0 w-auto"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => runWorkflow()}
                            disabled={isRunning}
                        >
                            {isRunning ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4 mr-2" />
                            )}
                            Test
                        </Button>
                        <Link href={`/dashboard/workflows/${id}/runs`}>
                            <Button variant="ghost" size="icon" title="View History">
                                <Clock className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {hasChanges ? "Save" : "Saved"}
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Node Sidebar */}
                    <NodeSidebar />

                    {/* Canvas */}
                    <AgentCanvas
                        initialNodes={nodes}
                        initialEdges={edges}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={handleEdgesChange}
                        onNodeSelect={setSelectedNode}
                    />

                    {/* Settings Panel */}
                    {selectedNode && (
                        <SettingsPanel
                            node={selectedNode}
                            onClose={() => setSelectedNode(null)}
                            onUpdate={handleNodeUpdate}
                        />
                    )}
                </div>
            </div>
        </ReactFlowProvider>
    );
}
