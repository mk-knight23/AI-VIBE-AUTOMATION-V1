"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Clock, Play, Sparkles } from "lucide-react";

export default function AgentTabs() {
    const agents = useQuery(api.agents.listByUser) || [];
    const isLoading = agents === undefined;

    return (
        <div className="px-4 md:px-8 lg:px-12 mt-8">
            <Tabs defaultValue="my-agents" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="my-agents">My Agents</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="my-agents" className="mt-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i} className="overflow-hidden animate-pulse">
                                    <CardContent className="p-4">
                                        <div className="h-10 w-10 rounded-lg bg-muted mb-3" />
                                        <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                                        <div className="h-4 w-1/2 bg-muted rounded" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : agents && agents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {agents.map((agent) => (
                                <Link
                                    key={agent._id}
                                    href={`/dashboard/agents/${agent._id}`}
                                    className="block"
                                >
                                    <Card className="overflow-hidden glass-card border-white/5 hover:border-violet-500/50 transition-all cursor-pointer group hover-lift shadow-xl">
                                        <CardContent className="p-5">
                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 flex items-center justify-center mb-4 group-hover:from-violet-500/20 group-hover:to-pink-500/20 transition-all shadow-inner group-hover:scale-110 duration-300">
                                                <Bot className="h-6 w-6 text-violet-400" />
                                            </div>
                                            <h3 className="font-bold text-lg text-white truncate leading-tight">{agent.name}</h3>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                                                        {formatDistanceToNow(agent.createdAt, { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-5">
                                                {agent.isPublished ? (
                                                    <Badge variant="glow">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Draft
                                                    </Badge>
                                                )}
                                                {agent.runCount > 0 && (
                                                    <Badge variant="outline" className="gap-1 px-3">
                                                        <Play className="h-2.5 w-2.5 fill-current" />
                                                        {agent.runCount} runs
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Bot className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground">No agents yet</h3>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                Create your first AI agent to get started
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="templates" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templateAgents.map((template) => (
                            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                                <CardContent className="p-4">
                                    <div
                                        className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                                        style={{ backgroundColor: template.bgColor }}
                                    >
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold">{template.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {template.description}
                                    </p>
                                    <Badge variant="outline" className="mt-3">
                                        Template
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

const templateAgents = [
    {
        id: "weather-agent",
        name: "Weather Agent",
        description: "Get real-time weather information for any city using weather APIs.",
        bgColor: "#3b82f6",
    },
    {
        id: "email-assistant",
        name: "Email Assistant",
        description: "AI-powered email drafting and response suggestions.",
        bgColor: "#8b5cf6",
    },
    {
        id: "code-reviewer",
        name: "Code Reviewer",
        description: "Automated code review and suggestions using AI.",
        bgColor: "#10b981",
    },
    {
        id: "customer-support",
        name: "Customer Support",
        description: "Handle customer inquiries with AI-powered responses.",
        bgColor: "#f59e0b",
    },
    {
        id: "content-writer",
        name: "Content Writer",
        description: "Generate blog posts, articles, and marketing content.",
        bgColor: "#ec4899",
    },
    {
        id: "data-analyzer",
        name: "Data Analyzer",
        description: "Analyze data and generate insights and reports.",
        bgColor: "#6366f1",
    },
];
