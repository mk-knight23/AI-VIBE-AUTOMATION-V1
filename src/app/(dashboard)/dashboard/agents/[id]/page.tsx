"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Node, Edge, ReactFlowProvider } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Save, Play, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

import NodeSidebar from "@/components/agent-builder/NodeSidebar";
import AgentCanvas from "@/components/agent-builder/AgentCanvas";
import SettingsPanel from "@/components/agent-builder/SettingsPanel";

export default function AgentEditorPage() {
    const params = useParams();
    const router = useRouter();
    const agentId = params.id as string;

    const agent = useQuery(api.agents.getById, { agentId: agentId as Id<"agents"> });
    const updateWorkflow = useMutation(api.agents.updateWorkflow);
    const updateAgent = useMutation(api.agents.update);

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [agentName, setAgentName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Load agent data
    useEffect(() => {
        if (agent) {
            setNodes(agent.nodes as Node[]);
            setEdges(agent.edges as Edge[]);
            setAgentName(agent.name);
        }
    }, [agent]);

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
        if (!agent) return;

        setIsSaving(true);
        try {
            await updateWorkflow({
                agentId: agentId as Id<"agents">,
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

            if (agentName !== agent.name) {
                await updateAgent({
                    agentId: agentId as Id<"agents">,
                    name: agentName,
                });
            }

            setHasChanges(false);
            toast.success("Agent saved successfully!");
        } catch (error) {
            toast.error("Failed to save agent");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!agent) {
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
                        <Link href="/dashboard/agents">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{agent.icon || "🤖"}</span>
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
                        <Link href={`/dashboard/agents/${agentId}/chat`}>
                            <Button variant="outline">
                                <Play className="h-4 w-4 mr-2" />
                                Test
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
