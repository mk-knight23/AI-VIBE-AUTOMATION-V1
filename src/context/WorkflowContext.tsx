"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Node, Edge } from "@xyflow/react";

interface WorkflowContextType {
    nodes: Node[];
    edges: Edge[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    addNode: (node: Node) => void;
    updateNode: (nodeId: string, data: Record<string, unknown>) => void;
    removeNode: (nodeId: string) => void;
    selectedNodeId: string | null;
    setSelectedNodeId: (id: string | null) => void;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

// Default start node
const defaultStartNode: Node = {
    id: "start",
    type: "start",
    position: { x: 250, y: 50 },
    data: { label: "Start", trigger: "manual" },
};

interface WorkflowProviderProps {
    children: ReactNode;
    initialNodes?: Node[];
    initialEdges?: Edge[];
}

export function WorkflowProvider({
    children,
    initialNodes = [defaultStartNode],
    initialEdges = [],
}: WorkflowProviderProps) {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const addNode = useCallback((node: Node) => {
        setNodes((prev) => [...prev, node]);
    }, []);

    const updateNode = useCallback((nodeId: string, data: Record<string, unknown>) => {
        setNodes((prev) =>
            prev.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            )
        );
    }, []);

    const removeNode = useCallback((nodeId: string) => {
        setNodes((prev) => prev.filter((node) => node.id !== nodeId));
        setEdges((prev) =>
            prev.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
        );
    }, []);

    return (
        <WorkflowContext.Provider
            value={{
                nodes,
                edges,
                setNodes,
                setEdges,
                addNode,
                updateNode,
                removeNode,
                selectedNodeId,
                setSelectedNodeId,
            }}
        >
            {children}
        </WorkflowContext.Provider>
    );
}

export function useWorkflow() {
    const context = useContext(WorkflowContext);
    if (!context) {
        throw new Error("useWorkflow must be used within a WorkflowProvider");
    }
    return context;
}

export { WorkflowContext };
