"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Zap, Clock, TrendingUp, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const agents = useQuery(api.agents.listByUser) || [];

    const stats = [
        {
            title: "Total Agents",
            value: agents.length,
            icon: Bot,
            description: "Active AI agents",
            gradient: "from-violet-500 to-pink-500",
        },
        {
            title: "Total Runs",
            value: agents.reduce((sum, agent) => sum + agent.runCount, 0),
            icon: Zap,
            description: "Agent executions",
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            title: "Last Active",
            value: agents.length > 0 ? "Today" : "N/A",
            icon: Clock,
            description: "Most recent activity",
            gradient: "from-orange-500 to-amber-500",
        },
        {
            title: "Success Rate",
            value: "98%",
            icon: TrendingUp,
            description: "Execution success",
            gradient: "from-emerald-500 to-teal-500",
        },
    ];

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of your AI agents and activity
                    </p>
                </div>
                <Link href="/dashboard/agents/new">
                    <Button className="gradient-bg glow hover:opacity-90 cursor-pointer hidden sm:flex">
                        <Plus className="h-4 w-4 mr-2" />
                        New Agent
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="glass-card hover-lift cursor-pointer group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-lg group-hover:scale-105 transition-transform`}>
                                <stat.icon className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Agents */}
            <Card className="glass-card overflow-hidden">
                <CardHeader className="border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Agents</CardTitle>
                            <CardDescription>Your most recently created or updated agents</CardDescription>
                        </div>
                        {agents.length > 0 && (
                            <Link href="/dashboard/agents">
                                <Button variant="ghost" size="sm" className="hover:bg-white/5 cursor-pointer">
                                    View all
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {agents.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
                                <Bot className="h-10 w-10 text-violet-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                Create your first AI agent to start automating your workflows
                            </p>
                            <Link href="/dashboard/agents/new">
                                <Button className="gradient-bg glow hover:opacity-90 cursor-pointer">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Agent
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {agents.slice(0, 5).map((agent) => (
                                <Link
                                    key={agent._id}
                                    href={`/dashboard/agents/${agent._id}`}
                                    className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                                            <Bot className="h-5 w-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium group-hover:text-violet-300 transition-colors">{agent.name}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {agent.description || "No description"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge
                                            variant={agent.isPublished ? "default" : "secondary"}
                                            className={agent.isPublished ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}
                                        >
                                            {agent.isPublished ? "Published" : "Draft"}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground tabular-nums">
                                            {agent.runCount} runs
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
