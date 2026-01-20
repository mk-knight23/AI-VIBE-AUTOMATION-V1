"use client";

import { useCallback, useRef, DragEvent, useEffect } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
    Panel,
    NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import StartNode from "./nodes/StartNode";
import EndNode from "./nodes/EndNode";
import AINode from "./nodes/AINode";
import APINode from "./nodes/APINode";
import IfElseNode from "./nodes/IfElseNode";
import { MemoLoopNode, MemoCodeNode, MemoDelayNode, MemoVariableNode } from "./nodes/OtherNodes";

// Register custom node types
const nodeTypes: NodeTypes = {
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

// Default node data for each type
const defaultNodeData: Record<string, Record<string, unknown>> = {
    start: { label: "Start", trigger: "manual" },
    end: { label: "End", responseType: "text" },
    ai: { label: "AI", model: "gpt-4o-mini", provider: "openai", systemPrompt: "", temperature: 0.7 },
    api: { label: "API Call", url: "", method: "GET", headers: {} },
    ifelse: { label: "If/Else", condition: "", trueLabel: "True", falseLabel: "False" },
    loop: { label: "Loop", iterationType: "count", count: 3 },
    code: { label: "Code", code: "", language: "javascript" },
    delay: { label: "Delay", duration: 1000 },
    variable: { label: "Variable", variableName: "", value: "" },
};

interface AgentCanvasProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    onNodesChange?: (nodes: Node[]) => void;
    onEdgesChange?: (edges: Edge[]) => void;
    onNodeSelect?: (node: Node | null) => void;
}

export default function AgentCanvas({
    initialNodes = [],
    initialEdges = [],
    onNodesChange,
    onEdgesChange,
    onNodeSelect,
}: AgentCanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);

    // Sync props with internal state when initialNodes/initialEdges change
    useEffect(() => {
        if (initialNodes.length > 0) {
            setNodes(initialNodes);
        }
    }, [initialNodes, setNodes]);

    useEffect(() => {
        if (initialEdges.length > 0) {
            setEdges(initialEdges);
        }
    }, [initialEdges, setEdges]);

    // Handle edge connections
    const onConnect = useCallback(
        (connection: Connection) => {
            const newEdge: Edge = {
                id: `${connection.source}-${connection.target}-${Date.now()}`,
                source: connection.source,
                target: connection.target,
                sourceHandle: connection.sourceHandle ?? undefined,
                targetHandle: connection.targetHandle ?? undefined,
                animated: true,
                type: "smoothstep",
            };
            setEdges((eds) => addEdge(newEdge, eds));
        },
        [setEdges]
    );

    // Propagate changes to parent
    const onNodesChangeHandler = useCallback(
        (changes: any) => {
            handleNodesChange(changes);
            // Get the updated nodes after the change
            setNodes((nds) => {
                onNodesChange?.(nds);
                return nds;
            });
        },
        [handleNodesChange, onNodesChange, setNodes]
    );

    const onEdgesChangeHandler = useCallback(
        (changes: any) => {
            handleEdgesChange(changes);
            setEdges((eds) => {
                onEdgesChange?.(eds);
                return eds;
            });
        },
        [handleEdgesChange, onEdgesChange, setEdges]
    );

    // Handle node selection
    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            onNodeSelect?.(node);
        },
        [onNodeSelect]
    );

    const onPaneClick = useCallback(() => {
        onNodeSelect?.(null);
    }, [onNodeSelect]);

    // Handle drag and drop from sidebar
    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData("application/reactflow");
            if (!type || !reactFlowWrapper.current) return;

            const bounds = reactFlowWrapper.current.getBoundingClientRect();
            const position = {
                x: event.clientX - bounds.left - 75,
                y: event.clientY - bounds.top - 20,
            };

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { ...defaultNodeData[type] },
            };

            setNodes((nds) => [...nds, newNode]);
        },
        [setNodes]
    );

    return (
        <div ref={reactFlowWrapper} className="flex-1 h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChangeHandler}
                onEdgesChange={onEdgesChangeHandler}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                defaultEdgeOptions={{
                    type: "smoothstep",
                    animated: true,
                }}
                className="bg-background/50"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={2}
                    className="!bg-transparent opacity-20"
                    color="#a78bfa"
                />
                <Controls className="!bg-card/30  !backdrop-blur-xl !border-white/10 !rounded-xl !shadow-lg text-foreground" />
                <MiniMap
                    className="!bg-card/30 !backdrop-blur-xl !border-white/10 !rounded-xl"
                    maskColor="rgba(0, 0, 0, 0.4)"
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
                <Panel position="top-right" className="!m-4">
                    <div className="text-xs font-medium text-foreground bg-card/30 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                        {nodes.length} nodes <span className="text-white/20">|</span> {edges.length} connections
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}
