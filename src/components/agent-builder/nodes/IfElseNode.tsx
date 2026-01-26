"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";

type IfElseNodeData = {
    label: string;
    condition?: string;
    trueLabel?: string;
    falseLabel?: string;
    executionStatus?: "idle" | "running" | "success" | "error";
};

const statusStyles = {
    idle: "",
    running: "shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse border-amber-500",
    success: "border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
    error: "border-rose-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
};

function IfElseNode({ data, selected }: { data: IfElseNodeData; selected?: boolean }) {
    return (
        <div className={`relative px-4 py-3 rounded-xl border min-w-[180px] glass-card transition-all duration-200 hover-lift ${selected ? "border-amber-500 shadow-lg shadow-amber-500/20" : "border-white/10"} ${statusStyles[data.executionStatus || "idle"]}`}>
            {data.executionStatus === "success" && (
                <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background shadow-lg z-10">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                </div>
            )}
            {data.executionStatus === "error" && (
                <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 flex items-center justify-center border-2 border-background shadow-lg z-10">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
            )}
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background" />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <GitBranch className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-amber-100">{data.label || "If/Else"}</p>
                    {data.condition && (
                        <p className="text-xs text-muted-foreground font-mono truncate">{data.condition}</p>
                    )}
                </div>
            </div>
            <div className="flex justify-between mt-3 pt-2 border-t border-white/5 text-[10px] font-bold uppercase tracking-wider">
                <span className="text-emerald-400/80">{data.trueLabel || "True"}</span>
                <span className="text-red-400/80">{data.falseLabel || "False"}</span>
            </div>
            <Handle type="source" position={Position.Bottom} id="true" style={{ left: "25%" }} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background" />
            <Handle type="source" position={Position.Bottom} id="false" style={{ left: "75%" }} className="!w-3 !h-3 !bg-red-500 !border-2 !border-background" />
        </div>
    );
}

export default memo(IfElseNode);
