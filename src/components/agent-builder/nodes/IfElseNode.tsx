"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";

type IfElseNodeData = {
    label: string;
    condition?: string;
    trueLabel?: string;
    falseLabel?: string;
};

type IfElseNodeProps = {
    data: IfElseNodeData;
    selected?: boolean;
};

function IfElseNode({ data, selected }: IfElseNodeProps) {
    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl border min-w-[180px]
        glass-card
        ${selected ? "border-amber-500 shadow-lg shadow-amber-500/20" : "border-white/10 hover:border-amber-500/50"}
        transition-all duration-200 hover-lift
      `}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background"
            />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <GitBranch className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-amber-100">{data.label || "If/Else"}</p>
                    {data.condition && (
                        <p className="text-xs text-muted-foreground font-mono truncate">
                            {data.condition}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex justify-between mt-3 pt-2 border-t border-white/5 text-xs">
                <span className="text-emerald-400 font-medium">{data.trueLabel || "True"}</span>
                <span className="text-red-400 font-medium">{data.falseLabel || "False"}</span>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                style={{ left: "25%" }}
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                style={{ left: "75%" }}
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-background"
            />
        </div>
    );
}

export default memo(IfElseNode);
