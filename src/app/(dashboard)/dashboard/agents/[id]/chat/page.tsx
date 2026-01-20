"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Loader2, Settings, Trash } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
}

export default function AgentChatPage() {
    const params = useParams();
    const agentId = params.id as string;

    const agent = useQuery(api.agents.getById, { agentId: agentId as Id<"agents"> });

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new message
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
            // Call the agent execution API
            const response = await fetch("/api/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agentId,
                    message: userMessage.content,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to execute agent");
            }

            // Handle streaming response
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

    const clearChat = () => {
        setMessages([]);
    };

    if (!agent) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="h-14 border-b border-border/40 bg-card/50 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/agents/${agentId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{agent.icon || "🤖"}</span>
                        <div>
                            <h1 className="font-semibold">{agent.name}</h1>
                            <p className="text-xs text-muted-foreground">Test your agent</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant={agent.isPublished ? "default" : "secondary"}>
                        {agent.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Button variant="outline" size="icon" onClick={clearChat}>
                        <Trash className="h-4 w-4" />
                    </Button>
                    <Link href={`/dashboard/agents/${agentId}`}>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                                <Bot className="h-10 w-10 text-purple-500" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Test {agent.name}</h2>
                            <p className="text-muted-foreground max-w-md">
                                Start a conversation to test your agent. Send a message and see how your
                                workflow responds.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                {["Hello!", "What can you do?", "Help me with a task"].map((suggestion) => (
                                    <Button
                                        key={suggestion}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setInput(suggestion)}
                                    >
                                        {suggestion}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {message.role !== "user" && (
                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                    <Card
                                        className={`max-w-[80%] p-4 ${message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-card"
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        {message.role === "assistant" && !message.content && isLoading && (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm text-muted-foreground">Thinking...</span>
                                            </div>
                                        )}
                                    </Card>
                                    {message.role === "user" && (
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                            <User className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-border/40">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
