"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
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
    Play,
    RefreshCw,
    Code,
    Copy,
    Check,
    MessageSquare,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

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
    const agent = useQuery(api.agents.getById, { agentId: id as Id<"agents"> });
    const [copied, setCopied] = useState(false);
    const [isRebooting, setIsRebooting] = useState(false);

    const generateEmbedCode = () => {
        if (!agent) return "";
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
        // Simulate reboot process
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success("Agent rebooted successfully!");
        setIsRebooting(false);
    };

    if (!agent) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const nodes: Node[] = agent.nodes.map((n) => ({
        ...n,
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        draggable: false,
        selectable: false,
    }));

    const edges: Edge[] = agent.edges.map((e) => ({
        ...e,
        id: e.id,
        source: e.source,
        target: e.target,
    }));

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="border-b border-border/40 bg-card/50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/agents/${id}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Editor
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-border" />
                    <h1 className="text-lg font-semibold">{agent.name} - Preview</h1>
                    <Badge variant={agent.isPublished ? "default" : "secondary"}>
                        {agent.isPublished ? "Published" : "Draft"}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReboot}
                        disabled={isRebooting}
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${isRebooting ? "animate-spin" : ""}`}
                        />
                        {isRebooting ? "Rebooting..." : "Reboot Agent"}
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Code className="h-4 w-4 mr-2" />
                                Get Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Embed Code</DialogTitle>
                                <DialogDescription>
                                    Copy this code to embed the agent in your application.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="relative">
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                    <code>{generateEmbedCode()}</code>
                                </pre>
                                <Button
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={handleCopyCode}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Link href={`/dashboard/agents/${id}/chat`}>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Test Chat
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex">
                {/* Canvas - Read Only */}
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
                            className="!bg-background"
                            color="hsl(var(--muted-foreground) / 0.2)"
                        />
                        <Controls className="!bg-card/80 !border-border/50 !rounded-lg !shadow-lg" />
                        <MiniMap
                            className="!bg-card/80 !border-border/50 !rounded-lg"
                            nodeColor={(node) => {
                                switch (node.type) {
                                    case "start":
                                        return "#10b981";
                                    case "end":
                                        return "#ef4444";
                                    case "ai":
                                        return "#a855f7";
                                    case "api":
                                        return "#3b82f6";
                                    case "ifelse":
                                        return "#eab308";
                                    case "loop":
                                        return "#6366f1";
                                    case "code":
                                        return "#6b7280";
                                    case "delay":
                                        return "#06b6d4";
                                    case "variable":
                                        return "#ec4899";
                                    default:
                                        return "#6b7280";
                                }
                            }}
                        />
                    </ReactFlow>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full text-sm font-medium border border-yellow-500/30">
                        Preview Mode - Read Only
                    </div>
                </div>

                {/* Config Panel */}
                <div className="w-80 border-l border-border/40 bg-card/50 p-4 overflow-y-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Agent Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Name
                                </label>
                                <p className="text-sm mt-1">{agent.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Description
                                </label>
                                <p className="text-sm mt-1">
                                    {agent.description || "No description"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Nodes
                                </label>
                                <p className="text-sm mt-1">{agent.nodes.length} nodes</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Connections
                                </label>
                                <p className="text-sm mt-1">{agent.edges.length} edges</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Run Count
                                </label>
                                <p className="text-sm mt-1">{agent.runCount} executions</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Status
                                </label>
                                <Badge
                                    variant={agent.isPublished ? "default" : "outline"}
                                    className="mt-1"
                                >
                                    {agent.isPublished ? "Published" : "Draft"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
