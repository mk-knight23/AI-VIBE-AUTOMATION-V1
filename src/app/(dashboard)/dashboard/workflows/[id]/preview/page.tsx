"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    Node,
    Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    ArrowLeft,
    RefreshCw,
    Code,
    Copy,
    Check,
    MessageSquare,
    Loader2,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getWorkflow } from "@/actions/workflows";

// Import custom nodes
import StartNode from "@/components/agent-builder/nodes/StartNode";
import EndNode from "@/components/agent-builder/nodes/EndNode";
import AINode from "@/components/agent-builder/nodes/AINode";
import APINode from "@/components/agent-builder/nodes/APINode";
import IfElseNode from "@/components/agent-builder/nodes/IfElseNode";
import {
    MemoLoopNode,
    MemoCodeNode,
    MemoDelayNode,
    MemoVariableNode,
} from "@/components/agent-builder/nodes/OtherNodes";

const nodeTypes = {
    start: StartNode,
    end: EndNode,
    ai: AINode,
    api: APINode,
    ifelse: IfElseNode,
    loop: MemoLoopNode,
    code: MemoCodeNode,
    delay: MemoDelayNode,
    variable: MemoVariableNode,
};

interface PreviewPageProps {
    params: Promise<{ id: string }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
    const { id } = use(params);
    const { data: workflow, isLoading: isWorkflowLoading } = useQuery({
        queryKey: ["workflow", id],
        queryFn: () => getWorkflow(id),
    });

    const [copied, setCopied] = useState(false);
    const [isRebooting, setIsRebooting] = useState(false);

    const generateEmbedCode = () => {
        if (!workflow) return "";
        return `<!-- Agentify Agent Embed -->
<script src="https://agentify.app/embed.js"></script>
<script>
  Agentify.init({
    agentId: "${id}",
    container: "#agentify-container",
    theme: "dark"
  });
</script>
<div id="agentify-container"></div>`;
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        setCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReboot = async () => {
        setIsRebooting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success("Agent rebooted successfully!");
        setIsRebooting(false);
    };

    if (isWorkflowLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <h2 className="text-xl font-bold">Agent not found</h2>
                <Link href="/dashboard/workflows">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const nodes: Node[] = (workflow.nodes as any[]).map((n) => ({
        ...n,
        draggable: false,
        selectable: false,
    }));

    const edges: Edge[] = (workflow.edges as any[]).map((e) => ({
        ...e,
    }));

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden font-sans">
            <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/workflows/${id}`}>
                        <Button variant="ghost" size="sm" className="hover:bg-white/5">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Editor
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-white/5" />
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🤖</span>
                        <h1 className="text-sm font-bold tracking-tight">{workflow.name}</h1>
                    </div>
                    <Badge variant={workflow.isActive ? "default" : "secondary"} className="h-5 text-[10px] bg-white/5 border-white/10">
                        {workflow.isActive ? "Active" : "Draft"}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReboot}
                        disabled={isRebooting}
                        className="hover:bg-white/5 border border-white/5"
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${isRebooting ? "animate-spin" : ""}`}
                        />
                        {isRebooting ? "Rebooting..." : "Reboot"}
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-white/5 border border-white/5">
                                <Code className="h-4 w-4 mr-2" />
                                Get Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl glass-card border-white/10">
                            <DialogHeader>
                                <DialogTitle>Embed Code</DialogTitle>
                                <DialogDescription>
                                    Copy this code to embed the agent in your application.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="relative mt-4">
                                <pre className="bg-black/50 p-6 rounded-2xl overflow-x-auto text-[11px] leading-relaxed border border-white/5">
                                    <code className="text-violet-300">{generateEmbedCode()}</code>
                                </pre>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-4 right-4 hover:bg-white/10"
                                    onClick={handleCopyCode}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Link href={`/dashboard/workflows/${id}/chat`}>
                        <Button
                            size="sm"
                            className="gradient-bg glow hover:opacity-90"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Test Chat
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        fitView
                        nodesDraggable={false}
                        nodesConnectable={false}
                        elementsSelectable={false}
                        panOnDrag
                        zoomOnScroll
                        className="bg-background"
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={20}
                            size={1}
                            color="hsl(var(--muted-foreground) / 0.1)"
                        />
                        <Controls className="!bg-white/5 !border-white/10 !rounded-xl !shadow-2xl" />
                        <MiniMap
                            className="!bg-white/5 !border-white/10 !rounded-xl"
                            nodeColor={(node) => {
                                switch (node.type) {
                                    case "start": return "#10b981";
                                    case "end": return "#ef4444";
                                    case "ai": return "#a855f7";
                                    case "api": return "#3b82f6";
                                    case "ifelse": return "#eab308";
                                    case "loop": return "#6366f1";
                                    case "code": return "#6b7280";
                                    case "delay": return "#06b6d4";
                                    case "variable": return "#ec4899";
                                    default: return "#6b7280";
                                }
                            }}
                        />
                    </ReactFlow>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-card border-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                        Preview Mode
                    </div>
                </div>

                <div className="w-80 border-l border-white/5 bg-background/50 backdrop-blur-xl p-6 overflow-y-auto space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-violet-400/70">Configuration</h2>
                        <p className="text-[11px] text-muted-foreground">Detailed agent settings and stats</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Name</label>
                                <p className="text-sm font-semibold mt-1">{workflow.name}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {workflow.description || "No description provided."}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nodes</label>
                                <p className="text-lg font-bold mt-1">{(workflow.nodes as any[]).length}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Edges</label>
                                <p className="text-lg font-bold mt-1">{(workflow.edges as any[]).length}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Run Frequency</label>
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-lg font-bold">Low</p>
                                <Badge variant="outline" className="text-[10px] border-white/10 uppercase">Stable</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
