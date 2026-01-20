"use client";

import { Node } from "@xyflow/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { providerModels, AIProvider } from "@/lib/ai/providers";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
    node: Node | null;
    onClose: () => void;
    onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
}

const SettingsLabel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <Label className={cn("text-[11px] font-bold text-violet-400/80 uppercase tracking-widest pl-1", className)}>
        {children}
    </Label>
);

export default function SettingsPanel({ node, onClose, onUpdate }: SettingsPanelProps) {
    if (!node) return null;

    const handleChange = (key: string, value: unknown) => {
        onUpdate(node.id, { ...node.data, [key]: value });
    };

    const renderSettings = () => {
        switch (node.type) {
            case "start":
                return (
                    <>
                        <div className="space-y-3">
                            <SettingsLabel>Label</SettingsLabel>
                            <Input
                                value={(node.data.label as string) || ""}
                                onChange={(e) => handleChange("label", e.target.value)}
                                placeholder="Start node"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Trigger Type</SettingsLabel>
                            <Select
                                value={(node.data.trigger as string) || "manual"}
                                onValueChange={(value) => handleChange("trigger", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manual Execution</SelectItem>
                                    <SelectItem value="webhook">Webhook Trigger</SelectItem>
                                    <SelectItem value="scheduled">Scheduled Cron</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                );

            case "end":
                return (
                    <>
                        <div className="space-y-3">
                            <SettingsLabel>Label</SettingsLabel>
                            <Input
                                value={(node.data.label as string) || ""}
                                onChange={(e) => handleChange("label", e.target.value)}
                                placeholder="End node"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Response Type</SettingsLabel>
                            <Select
                                value={(node.data.responseType as string) || "text"}
                                onValueChange={(value) => handleChange("responseType", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Plain Text</SelectItem>
                                    <SelectItem value="json">JSON Data</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                );

            case "ai":
                return (
                    <>
                        <div className="space-y-3">
                            <SettingsLabel>Label</SettingsLabel>
                            <Input
                                value={(node.data.label as string) || ""}
                                onChange={(e) => handleChange("label", e.target.value)}
                                placeholder="AI Step"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Provider</SettingsLabel>
                            <Select
                                value={(node.data.provider as string) || "openai"}
                                onValueChange={(value) => {
                                    handleChange("provider", value);
                                    handleChange("model", providerModels[value as AIProvider][0]);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="openai">OpenAI</SelectItem>
                                    <SelectItem value="anthropic">Anthropic</SelectItem>
                                    <SelectItem value="google">Google Gemini</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Model</SettingsLabel>
                            <Select
                                value={(node.data.model as string) || "gpt-4o-mini"}
                                onValueChange={(value) => handleChange("model", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {providerModels[(node.data.provider as AIProvider) || "openai"].map(
                                        (model) => (
                                            <SelectItem key={model} value={model}>
                                                {model}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>System Prompt</SettingsLabel>
                            <Textarea
                                value={(node.data.systemPrompt as string) || ""}
                                onChange={(e) => handleChange("systemPrompt", e.target.value)}
                                placeholder="You are a helpful assistant..."
                                rows={4}
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>User Prompt Template</SettingsLabel>
                            <Textarea
                                value={(node.data.userPrompt as string) || ""}
                                onChange={(e) => handleChange("userPrompt", e.target.value)}
                                placeholder="Use {{variable}} for dynamic values"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <SettingsLabel>Temperature</SettingsLabel>
                                <Badge variant="glow">{(node.data.temperature as number) || 0.7}</Badge>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={(node.data.temperature as number) || 0.7}
                                onChange={(e) => handleChange("temperature", parseFloat(e.target.value))}
                                className="w-full accent-violet-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </>
                );

            case "api":
                return (
                    <>
                        <div className="space-y-3">
                            <SettingsLabel>Label</SettingsLabel>
                            <Input
                                value={(node.data.label as string) || ""}
                                onChange={(e) => handleChange("label", e.target.value)}
                                placeholder="API Request"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Method</SettingsLabel>
                            <Select
                                value={(node.data.method as string) || "GET"}
                                onValueChange={(value) => handleChange("method", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>URL</SettingsLabel>
                            <Input
                                value={(node.data.url as string) || ""}
                                onChange={(e) => handleChange("url", e.target.value)}
                                placeholder="https://api.example.com/endpoint"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Response Variable</SettingsLabel>
                            <Input
                                value={(node.data.responseVariable as string) || ""}
                                onChange={(e) => handleChange("responseVariable", e.target.value)}
                                placeholder="apiResponse"
                            />
                        </div>
                    </>
                );

            case "ifelse":
                return (
                    <>
                        <div className="space-y-3">
                            <SettingsLabel>Label</SettingsLabel>
                            <Input
                                value={(node.data.label as string) || ""}
                                onChange={(e) => handleChange("label", e.target.value)}
                                placeholder="Condition"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Condition</SettingsLabel>
                            <Textarea
                                value={(node.data.condition as string) || ""}
                                onChange={(e) => handleChange("condition", e.target.value)}
                                placeholder="variable === 'value'"
                                rows={2}
                            />
                        </div>
                    </>
                );

            case "loop":
                return (
                    <>
                        <div className="space-y-3">
                            <SettingsLabel>Label</SettingsLabel>
                            <Input
                                value={(node.data.label as string) || ""}
                                onChange={(e) => handleChange("label", e.target.value)}
                                placeholder="Loop"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Iteration Type</SettingsLabel>
                            <Select
                                value={(node.data.iterationType as string) || "count"}
                                onValueChange={(value) => handleChange("iterationType", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="count">Fixed Count</SelectItem>
                                    <SelectItem value="collection">For Each Item</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {node.data.iterationType === "count" && (
                            <div className="space-y-3">
                                <SettingsLabel>Iterations</SettingsLabel>
                                <Input
                                    type="number"
                                    value={(node.data.count as number) || 3}
                                    onChange={(e) => handleChange("count", parseInt(e.target.value))}
                                />
                            </div>
                        )}
                    </>
                );

            case "code":
                return (
                    <>
                        <div className="space-y-3">
                            <SettingsLabel>Label</SettingsLabel>
                            <Input
                                value={(node.data.label as string) || ""}
                                onChange={(e) => handleChange("label", e.target.value)}
                                placeholder="JS Code"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>JavaScript Code</SettingsLabel>
                            <Textarea
                                value={(node.data.code as string) || ""}
                                onChange={(e) => handleChange("code", e.target.value)}
                                placeholder="// Your JavaScript code here"
                                rows={8}
                                className="font-mono text-[13px] bg-black/30"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Output Variable</SettingsLabel>
                            <Input
                                value={(node.data.outputVariable as string) || ""}
                                onChange={(e) => handleChange("outputVariable", e.target.value)}
                                placeholder="result"
                            />
                        </div>
                    </>
                );

            case "delay":
                return (
                    <>
                        <div className="space-y-3">
                            <SettingsLabel>Label</SettingsLabel>
                            <Input
                                value={(node.data.label as string) || ""}
                                onChange={(e) => handleChange("label", e.target.value)}
                                placeholder="Pause"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Duration (ms)</SettingsLabel>
                            <Input
                                type="number"
                                value={(node.data.duration as number) || 1000}
                                onChange={(e) => handleChange("duration", parseInt(e.target.value))}
                            />
                        </div>
                    </>
                );

            case "variable":
                return (
                    <>
                        <div className="space-y-3">
                            <SettingsLabel>Label</SettingsLabel>
                            <Input
                                value={(node.data.label as string) || ""}
                                onChange={(e) => handleChange("label", e.target.value)}
                                placeholder="Set Variable"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Variable Name</SettingsLabel>
                            <Input
                                value={(node.data.variableName as string) || ""}
                                onChange={(e) => handleChange("variableName", e.target.value)}
                                placeholder="myVariable"
                            />
                        </div>
                        <div className="space-y-3">
                            <SettingsLabel>Value</SettingsLabel>
                            <Textarea
                                value={(node.data.value as string) || ""}
                                onChange={(e) => handleChange("value", e.target.value)}
                                placeholder="Variable value"
                                rows={3}
                            />
                        </div>
                    </>
                );

            default:
                return (
                    <div className="space-y-4 text-muted-foreground text-sm glass-card p-4 border-white/5">
                        No settings available for this node type.
                    </div>
                );
        }
    };

    return (
        <div className="w-80 border-l border-white/5 bg-background/50 backdrop-blur-xl flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div>
                    <h2 className="font-bold text-lg text-white">Node Settings</h2>
                    <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest mt-0.5">{node.type} node</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 rounded-full h-8 w-8">
                    <X className="h-4 w-4 text-muted-foreground hover:text-white transition-colors" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">{renderSettings()}</div>
            </ScrollArea>
        </div>
    );
}
