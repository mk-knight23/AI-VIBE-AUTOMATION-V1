"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Repeat, Code, Clock, Variable } from "lucide-react";

type LoopNodeData = {
    label: string;
    iterationType?: "count" | "collection";
    count?: number;
};

type LoopNodeProps = {
    data: LoopNodeData;
    selected?: boolean;
};

function LoopNode({ data, selected }: LoopNodeProps) {
    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl border min-w-[150px]
        glass-card
        ${selected ? "border-indigo-500 shadow-lg shadow-indigo-500/20" : "border-white/10 hover:border-indigo-500/50"}
        transition-all duration-200 hover-lift
      `}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background"
            />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
                    <Repeat className="h-4 w-4 text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm text-indigo-100">{data.label || "Loop"}</p>
                    <p className="text-xs text-muted-foreground">
                        {data.iterationType === "count"
                            ? `${data.count || 1} iterations`
                            : "For each item"}
                    </p>
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="loop"
                style={{ left: "30%" }}
                className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="done"
                style={{ left: "70%" }}
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background"
            />
        </div>
    );
}

type CodeNodeData = {
    label: string;
    code?: string;
};

type CodeNodeProps = {
    data: CodeNodeData;
    selected?: boolean;
};

function CodeNode({ data, selected }: CodeNodeProps) {
    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl border min-w-[150px]
        glass-card
        ${selected ? "border-slate-500 shadow-lg shadow-slate-500/20" : "border-white/10 hover:border-slate-500/50"}
        transition-all duration-200 hover-lift
      `}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-slate-500 !border-2 !border-background"
            />
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
                    <code className="text-xs text-muted-foreground font-mono line-clamp-2">
                        {data.code}
                    </code>
                </div>
            )}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-slate-500 !border-2 !border-background"
            />
        </div>
    );
}

type DelayNodeData = {
    label: string;
    duration?: number;
};

type DelayNodeProps = {
    data: DelayNodeData;
    selected?: boolean;
};

function DelayNode({ data, selected }: DelayNodeProps) {
    const formatDuration = (ms?: number) => {
        if (!ms) return "1s";
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${ms / 1000}s`;
        return `${ms / 60000}m`;
    };

    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl border min-w-[150px]
        glass-card
        ${selected ? "border-cyan-500 shadow-lg shadow-cyan-500/20" : "border-white/10 hover:border-cyan-500/50"}
        transition-all duration-200 hover-lift
      `}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-background"
            />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center shadow-lg">
                    <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm text-cyan-100">{data.label || "Delay"}</p>
                    <p className="text-xs text-muted-foreground">
                        Wait {formatDuration(data.duration)}
                    </p>
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-background"
            />
        </div>
    );
}

type VariableNodeData = {
    label: string;
    variableName?: string;
    value?: string;
};

type VariableNodeProps = {
    data: VariableNodeData;
    selected?: boolean;
};

function VariableNode({ data, selected }: VariableNodeProps) {
    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl border min-w-[150px]
        glass-card
        ${selected ? "border-pink-500 shadow-lg shadow-pink-500/20" : "border-white/10 hover:border-pink-500/50"}
        transition-all duration-200 hover-lift
      `}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-pink-500 !border-2 !border-background"
            />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                    <Variable className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-pink-100">{data.label || "Variable"}</p>
                    {data.variableName && (
                        <p className="text-xs text-muted-foreground font-mono truncate">
                            ${"{"}
                            {data.variableName}
                            {"}"}
                        </p>
                    )}
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-pink-500 !border-2 !border-background"
            />
        </div>
    );
}

export const MemoLoopNode = memo(LoopNode);
export const MemoCodeNode = memo(CodeNode);
export const MemoDelayNode = memo(DelayNode);
export const MemoVariableNode = memo(VariableNode);
