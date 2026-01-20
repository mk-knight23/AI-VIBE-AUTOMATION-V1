"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Square } from "lucide-react";

type EndNodeData = {
    label: string;
    responseType?: "text" | "json";
};

type EndNodeProps = {
    data: EndNodeData;
    selected?: boolean;
};

function EndNode({ data, selected }: EndNodeProps) {
    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl border min-w-[150px]
        glass-card
        ${selected ? "border-red-500 shadow-lg shadow-red-500/20" : "border-white/10 hover:border-red-500/50"}
        transition-all duration-200 hover-lift
      `}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-background"
            />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Square className="h-4 w-4 text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm text-red-100">{data.label || "End"}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                        {data.responseType || "text"} response
                    </p>
                </div>
            </div>
        </div>
    );
}

export default memo(EndNode);
