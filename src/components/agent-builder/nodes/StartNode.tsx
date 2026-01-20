"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";
import { Play } from "lucide-react";

type StartNodeData = {
    label: string;
    trigger?: "manual" | "webhook" | "scheduled";
};

type StartNodeProps = {
    data: StartNodeData;
    selected?: boolean;
};

function StartNode({ data, selected }: StartNodeProps) {
    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl border min-w-[150px]
        glass-card
        ${selected ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-white/10 hover:border-emerald-500/50"}
        transition-all duration-200 hover-lift
      `}
        >
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
