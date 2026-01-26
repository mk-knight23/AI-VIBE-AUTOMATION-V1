"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Repeat, Code, Clock, Variable } from "lucide-react";

type ExecutionStatus = "idle" | "running" | "success" | "error";

const statusStyles = {
    idle: "",
    running: "shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse border-violet-500",
    success: "border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
    error: "border-rose-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
};

const StatusBadge = ({ status }: { status?: ExecutionStatus }) => {
    if (status === "success") {
        return (
            <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background shadow-lg z-10">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </div>
        );
    }
    if (status === "error") {
        return (
            <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 flex items-center justify-center border-2 border-background shadow-lg z-10">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
        );
    }
    return null;
};

type LoopNodeData = {
    label: string;
    iterationType?: "count" | "collection";
    count?: number;
    executionStatus?: ExecutionStatus;
};

function LoopNode({ data, selected }: { data: LoopNodeData; selected?: boolean }) {
    return (
        <div className={`relative px-4 py-3 rounded-xl border min-w-[150px] glass-card transition-all duration-200 hover-lift ${selected ? "border-indigo-500 shadow-lg shadow-indigo-500/20" : "border-white/10"} ${statusStyles[data.executionStatus || "idle"]}`}>
            <StatusBadge status={data.executionStatus} />
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background" />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
                    <Repeat className="h-4 w-4 text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm text-indigo-100">{data.label || "Loop"}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{data.iterationType === "count" ? `${data.count || 1} iterations` : "For each item"}</p>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} id="loop" style={{ left: "30%" }} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background" />
            <Handle type="source" position={Position.Bottom} id="done" style={{ left: "70%" }} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background" />
        </div>
    );
}

type CodeNodeData = {
    label: string;
    code?: string;
    executionStatus?: ExecutionStatus;
};

function CodeNode({ data, selected }: { data: CodeNodeData; selected?: boolean }) {
    return (
        <div className={`relative px-4 py-3 rounded-xl border min-w-[150px] glass-card transition-all duration-200 hover-lift ${selected ? "border-slate-500 shadow-lg shadow-slate-500/20" : "border-white/10"} ${statusStyles[data.executionStatus || "idle"]}`}>
            <StatusBadge status={data.executionStatus} />
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-500 !border-2 !border-background" />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                    <Code className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-100">{data.label || "Code"}</p>
                    <p className="text-xs text-muted-foreground">JavaScript</p>
                </div>
            </div>
            {data.code && (
                <div className="mt-2 p-2 rounded-lg bg-black/20 border border-white/5">
                    <code className="text-xs text-muted-foreground font-mono line-clamp-2">{data.code}</code>
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-slate-500 !border-2 !border-background" />
        </div>
    );
}

type DelayNodeData = {
    label: string;
    duration?: number;
    executionStatus?: ExecutionStatus;
};

function DelayNode({ data, selected }: { data: DelayNodeData; selected?: boolean }) {
    const formatDuration = (ms?: number) => {
        if (!ms) return "1s";
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${ms / 1000}s`;
        return `${ms / 60000}m`;
    };

    return (
        <div className={`relative px-4 py-3 rounded-xl border min-w-[150px] glass-card transition-all duration-200 hover-lift ${selected ? "border-cyan-500 shadow-lg shadow-cyan-500/20" : "border-white/10"} ${statusStyles[data.executionStatus || "idle"]}`}>
            <StatusBadge status={data.executionStatus} />
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-background" />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center shadow-lg">
                    <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm text-cyan-100">{data.label || "Delay"}</p>
                    <p className="text-xs text-muted-foreground">Wait {formatDuration(data.duration)}</p>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-background" />
        </div>
    );
}

type VariableNodeData = {
    label: string;
    variableName?: string;
    value?: string;
    executionStatus?: ExecutionStatus;
};

function VariableNode({ data, selected }: { data: VariableNodeData; selected?: boolean }) {
    return (
        <div className={`relative px-4 py-3 rounded-xl border min-w-[150px] glass-card transition-all duration-200 hover-lift ${selected ? "border-pink-500 shadow-lg shadow-pink-500/20" : "border-white/10"} ${statusStyles[data.executionStatus || "idle"]}`}>
            <StatusBadge status={data.executionStatus} />
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-pink-500 !border-2 !border-background" />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                    <Variable className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-pink-100">{data.label || "Variable"}</p>
                    {data.variableName && (
                        <p className="text-xs text-muted-foreground font-mono truncate">${"{"}{data.variableName}{"}"}</p>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-pink-500 !border-2 !border-background" />
        </div>
    );
}

export const MemoLoopNode = memo(LoopNode);
export const MemoCodeNode = memo(CodeNode);
export const MemoDelayNode = memo(DelayNode);
export const MemoVariableNode = memo(VariableNode);
