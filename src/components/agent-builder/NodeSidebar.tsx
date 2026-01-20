"use client";

import { DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Play,
    Square,
    Bot,
    Globe,
    GitBranch,
    Repeat,
    Code,
    Clock,
    Variable,
} from "lucide-react";

interface NodeDefinition {
    type: string;
    label: string;
    icon: React.ElementType;
    description: string;
    gradient: string;
    category: string;
}

const nodeDefinitions: NodeDefinition[] = [
    {
        type: "start",
        label: "Start",
        icon: Play,
        description: "Entry point",
        gradient: "from-green-500 to-emerald-500",
        category: "Flow",
    },
    {
        type: "end",
        label: "End",
        icon: Square,
        description: "Terminate flow",
        gradient: "from-red-500 to-orange-500",
        category: "Flow",
    },
    {
        type: "ai",
        label: "AI",
        icon: Bot,
        description: "LLM processing",
        gradient: "from-purple-500 to-pink-500",
        category: "AI",
    },
    {
        type: "api",
        label: "API Call",
        icon: Globe,
        description: "HTTP request",
        gradient: "from-blue-500 to-cyan-500",
        category: "Integration",
    },
    {
        type: "ifelse",
        label: "If/Else",
        icon: GitBranch,
        description: "Conditional logic",
        gradient: "from-yellow-500 to-orange-500",
        category: "Logic",
    },
    {
        type: "loop",
        label: "Loop",
        icon: Repeat,
        description: "Iterate items",
        gradient: "from-indigo-500 to-violet-500",
        category: "Logic",
    },
    {
        type: "code",
        label: "Code",
        icon: Code,
        description: "JavaScript",
        gradient: "from-gray-500 to-slate-600",
        category: "Logic",
    },
    {
        type: "delay",
        label: "Delay",
        icon: Clock,
        description: "Wait/pause",
        gradient: "from-cyan-500 to-sky-500",
        category: "Flow",
    },
    {
        type: "variable",
        label: "Variable",
        icon: Variable,
        description: "Set variable",
        gradient: "from-pink-500 to-rose-500",
        category: "Data",
    },
];

const categories = [...new Set(nodeDefinitions.map((n) => n.category))];

interface NodeSidebarProps {
    onDragStart?: (event: DragEvent, nodeType: string) => void;
}

export default function NodeSidebar({ onDragStart }: NodeSidebarProps) {
    const handleDragStart = (event: DragEvent, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
        onDragStart?.(event, nodeType);
    };

    return (
        <div className="w-64 border-r border-white/5 bg-background/50 backdrop-blur-xl flex flex-col">
            <div className="p-6 border-b border-white/5">
                <h2 className="font-bold text-xl gradient-text">Nodes</h2>
                <p className="text-xs text-muted-foreground mt-1">
                    Drag and drop to build
                </p>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-8">
                    {categories.map((category) => (
                        <div key={category}>
                            <h3 className="text-[10px] font-bold text-violet-400/70 uppercase tracking-[0.2em] mb-4 px-2">
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {nodeDefinitions
                                    .filter((node) => node.category === category)
                                    .map((node) => (
                                        <div
                                            key={node.type}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, node.type)}
                                            className="group flex items-center gap-3 p-3 rounded-xl glass-card border-white/5 hover:border-violet-500/50 cursor-grab active:cursor-grabbing hover-lift transition-all duration-300"
                                        >
                                            <div
                                                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${node.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                            >
                                                <node.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm group-hover:text-white transition-colors">{node.label}</p>
                                                <p className="text-[11px] text-muted-foreground truncate leading-relaxed">
                                                    {node.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

export { nodeDefinitions };
