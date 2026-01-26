"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Globe } from "lucide-react";

type APINodeData = {
    label: string;
    url?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    executionStatus?: "idle" | "running" | "success" | "error";
};

type APINodeProps = {
    data: APINodeData;
    selected?: boolean;
};

const methodColors: Record<string, string> = {
    GET: "text-green-400",
    POST: "text-blue-400",
    PUT: "text-orange-400",
    PATCH: "text-yellow-400",
    DELETE: "text-red-400",
};

function APINode({ data, selected }: APINodeProps) {
    const method = data.method || "GET";

    const statusStyles = {
        idle: "",
        running: "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse",
        success: "border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        error: "border-rose-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
    };

    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl border min-w-[180px]
        glass-card
        ${selected ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-white/10 hover:border-blue-500/50"}
        ${statusStyles[data.executionStatus || "idle"]}
        transition-all duration-200 hover-lift
      `}
        >
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

            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background"
            />
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Globe className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-blue-100">{data.label || "API Call"}</p>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-mono font-medium ${methodColors[method]}`}>
                            {method}
                        </span>
                        {data.url && (
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                {data.url.replace(/^https?:\/\//, "")}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background"
            />
        </div>
    );
}

export default memo(APINode);
