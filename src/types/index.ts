import { Node, Edge } from "@xyflow/react";

// Node types for the agent builder
export type NodeType =
    | "start"
    | "end"
    | "ai"
    | "api"
    | "ifelse"
    | "loop"
    | "approval"
    | "code"
    | "delay"
    | "variable";

// Base node data interface
export interface BaseNodeData {
    label: string;
    [key: string]: unknown;
}

// Start node configuration
export interface StartNodeData extends BaseNodeData {
    trigger: "manual" | "webhook" | "scheduled";
    webhookUrl?: string;
    schedule?: string;
}

// AI node configuration
export interface AINodeData extends BaseNodeData {
    model: string;
    provider: "openai" | "anthropic" | "google";
    systemPrompt: string;
    userPrompt: string;
    temperature: number;
    maxTokens: number;
}

// API node configuration
export interface APINodeData extends BaseNodeData {
    url: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers: Record<string, string>;
    body?: string;
    responseVariable: string;
}

// If-Else node configuration
export interface IfElseNodeData extends BaseNodeData {
    condition: string;
    trueLabel: string;
    falseLabel: string;
}

// Loop node configuration
export interface LoopNodeData extends BaseNodeData {
    iterationType: "count" | "collection";
    count?: number;
    collection?: string;
    itemVariable: string;
    indexVariable: string;
}

// Approval node configuration
export interface ApprovalNodeData extends BaseNodeData {
    message: string;
    timeout: number; // in seconds
    defaultAction: "approve" | "reject";
}

// Code node configuration
export interface CodeNodeData extends BaseNodeData {
    code: string;
    language: "javascript";
    outputVariable: string;
}

// Delay node configuration
export interface DelayNodeData extends BaseNodeData {
    duration: number; // in milliseconds
}

// Variable node configuration
export interface VariableNodeData extends BaseNodeData {
    variableName: string;
    value: string;
    type: "string" | "number" | "boolean" | "json";
}

// End node configuration
export interface EndNodeData extends BaseNodeData {
    responseType: "text" | "json";
    response?: string;
}

// Union type for all node data
export type AgentNodeData =
    | StartNodeData
    | EndNodeData
    | AINodeData
    | APINodeData
    | IfElseNodeData
    | LoopNodeData
    | ApprovalNodeData
    | CodeNodeData
    | DelayNodeData
    | VariableNodeData;

// Typed node for React Flow
export type AgentNode = Node<AgentNodeData, NodeType>;

// Typed edge for React Flow
export type AgentEdge = Edge;

// Workflow definition (previously Agent)
export interface Workflow {
    id: string;
    userId: string;
    workspaceId: string;
    name: string;
    description?: string | null;
    nodes: AgentNode[];
    edges: AgentEdge[];
    isActive: boolean;
    isPublic: boolean;
    runCount: number;
    lastRunAt?: string | Date | null;
    createdAt: string | Date;
    updatedAt: string | Date;
}

// Execution status
export type ExecutionStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

// Execution log entry
export interface ExecutionLog {
    id: string;
    executionId: string;
    nodeId?: string | null;
    level: "INFO" | "WARN" | "ERROR" | "DEBUG";
    message: string;
    timestamp: string | Date;
    data?: any;
}

// Execution definition
export interface Execution {
    id: string;
    workflowId: string;
    userId: string;
    status: ExecutionStatus;
    input?: any;
    output?: any;
    startedAt?: string | Date | null;
    completedAt?: string | Date | null;
    duration?: number | null; // ms
    error?: string | null;
    logs?: ExecutionLog[];
}

// User definition
export interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
}
