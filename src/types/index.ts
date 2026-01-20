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

// Agent definition
export interface Agent {
    _id: string;
    userId: string;
    name: string;
    description?: string;
    icon: string;
    nodes: AgentNode[];
    edges: AgentEdge[];
    isPublished: boolean;
    lastRun?: number;
    runCount: number;
    createdAt: number;
    updatedAt: number;
}

// Execution status
export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

// Execution log entry
export interface ExecutionLog {
    nodeId: string;
    type: "info" | "error" | "success" | "warning";
    message: string;
    timestamp: number;
    data?: unknown;
}

// Execution definition
export interface Execution {
    _id: string;
    agentId: string;
    userId: string;
    status: ExecutionStatus;
    input?: unknown;
    output?: unknown;
    logs: ExecutionLog[];
    tokenUsed: number;
    startedAt: number;
    completedAt?: number;
    error?: string;
}

// Chat message
export interface ChatMessage {
    _id: string;
    executionId: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
    nodeId?: string;
}

// User definition
export interface User {
    _id: string;
    clerkId: string;
    email: string;
    name?: string;
    imageUrl?: string;
    plan: "free" | "pro" | "enterprise";
    tokenUsage: number;
    tokenLimit: number;
    createdAt: number;
    updatedAt: number;
}
