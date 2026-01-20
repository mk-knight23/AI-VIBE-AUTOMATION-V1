"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Bot } from "lucide-react";

type AINodeData = {
    label: string;
    model?: string;
    provider?: "openai" | "anthropic" | "google";
    systemPrompt?: string;
};

type AINodeProps = {
    data: AINodeData;
    selected?: boolean;
};

function AINode({ data, selected }: AINodeProps) {
    const providerColors = {
        openai: "from-green-500 to-teal-500",
        anthropic: "from-orange-500 to-amber-500",
        google: "from-blue-500 to-cyan-500",
    };

    const gradient = providerColors[data.provider || "openai"];

    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl border min-w-[180px]
        glass-card
        ${selected ? "border-violet-500 shadow-lg shadow-violet-500/20" : "border-white/10 hover:border-violet-500/50"}
        transition-all duration-200 hover-lift
      `}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-violet-500 !border-2 !border-background"
            />
            <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                    <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-violet-100">{data.label || "AI"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {data.model || "gpt-4o-mini"}
                    </p>
                </div>
            </div>
            {data.systemPrompt && (
                <div className="mt-3 p-2 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        {data.systemPrompt}
                    </p>
                </div>
            )}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-violet-500 !border-2 !border-background"
            />
        </div>
    );
}

export default memo(AINode);
