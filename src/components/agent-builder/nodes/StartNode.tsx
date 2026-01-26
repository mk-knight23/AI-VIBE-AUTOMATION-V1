"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";
import { Play } from "lucide-react";

type StartNodeData = {
    label: string;
    trigger?: "manual" | "webhook" | "scheduled";
    executionStatus?: "idle" | "running" | "success" | "error";
};

type StartNodeProps = {
    data: StartNodeData;
    selected?: boolean;
};

function StartNode({ data, selected }: StartNodeProps) {
    const statusStyles = {
        idle: "",
        running: "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse",
        success: "border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        error: "border-rose-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
    };

    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl border min-w-[150px]
        glass-card
        ${selected ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-white/10 hover:border-emerald-500/50"}
        ${statusStyles[data.executionStatus || "idle"]}
        transition-all duration-200 hover-lift
      `}
        >
            {data.executionStatus === "success" && (
                <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background shadow-lg z-10">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                </div>
            )}

            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <Play className="h-4 w-4 text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm text-emerald-100">{data.label || "Start"}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                        {data.trigger || "manual"} trigger
                    </p>
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background"
            />
        </div>
    );
}

export default memo(StartNode);
export type { StartNodeData };
