"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Loader2, Settings, Trash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getWorkflow } from "@/actions/workflows";

interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
}

export default function AgentChatPage() {
    const params = useParams();
    const workflowId = params.id as string;
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: workflow, isLoading: isWorkflowLoading } = useQuery({
        queryKey: ["workflow", workflowId],
        queryFn: () => getWorkflow(workflowId),
    });

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: input.trim(),
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workflowId,
                    message: userMessage.content,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to execute agent");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: "",
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessage.id
                                ? { ...msg, content: msg.content + chunk }
                                : msg
                        )
                    );
                }
            }
        } catch (error) {
            console.error("Execution error:", error);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: "Sorry, there was an error executing the agent. Please try again.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isWorkflowLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center p-8">
                <h2 className="text-xl font-bold mb-2">Agent not found</h2>
                <Link href="/dashboard/workflows">
                    <Button variant="outline">Back to Agents</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/workflows/${workflowId}`}>
                        <Button variant="ghost" size="icon" className="hover:bg-white/5">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl shadow-lg">
                            🤖
                        </div>
                        <div>
                            <h1 className="font-bold text-sm tracking-tight">{workflow.name}</h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Test your AI agent</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant={workflow.isActive ? "default" : "secondary"} className="text-[10px] h-5 bg-white/5 border-white/10 hover:bg-white/10">
                        {workflow.isActive ? "Active" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5" onClick={() => setMessages([])}>
                        <Trash className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Link href={`/dashboard/workflows/${workflowId}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden relative">
                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 px-8">
                            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-6 shadow-2xl border border-violet-500/20">
                                <Bot className="h-12 w-12 text-violet-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3 gradient-text">Test {workflow.name}</h2>
                            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                                Start a conversation to test your AI agent. Every message triggers your
                                workflow and generates a response based on your design.
                            </p>
                            <div className="mt-10 flex flex-wrap gap-2 justify-center">
                                {["Hello!", "How do you work?", "Show me your capabilities"].map((suggestion) => (
                                    <Button
                                        key={suggestion}
                                        variant="outline"
                                        size="sm"
                                        className="glass-card hover:bg-white/10 border-white/5 text-xs px-4"
                                        onClick={() => setInput(suggestion)}
                                    >
                                        {suggestion}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-20">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {message.role !== "user" && (
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg mt-1">
                                            <Bot className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${message.role === "user"
                                            ? "bg-violet-600 text-white"
                                            : "glass-card border-white/5 text-foreground"
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                        {message.role === "assistant" && !message.content && isLoading && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                                                </div>
                                                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Thinking</span>
                                            </div>
                                        )}
                                    </div>
                                    {message.role === "user" && (
                                        <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                                            <User className="h-5 w-5 text-violet-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-6 bg-gradient-to-t from-background via-background to-transparent pt-10">
                    <form onSubmit={handleSubmit} className="relative group max-w-3xl mx-auto">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message to your agent..."
                            disabled={isLoading}
                            className="h-14 pl-6 pr-14 glass-card border-white/10 focus:border-violet-500/50 shadow-2xl rounded-2xl"
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="absolute right-2 top-2 h-10 w-10 min-w-10 gradient-bg glow rounded-xl hover:opacity-90 transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </form>
                    <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-[0.2em] opacity-50">
                        Powered by Agentify Engine
                    </p>
                </div>
            </div>
        </div>
    );
}
