"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Clock, Zap, CheckCircle, XCircle, Pause, Loader2 } from "lucide-react";
import Link from "next/link";

const statusConfig = {
    pending: { icon: Pause, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    running: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10" },
    completed: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    failed: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    cancelled: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-500/10" },
};

export default function HistoryPage() {
    const executions = useQuery(api.executions.listByUser) || [];

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Execution History</h1>
                <p className="text-muted-foreground mt-1">
                    View past agent executions and their results
                </p>
            </div>

            {/* Executions List */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle>Recent Executions</CardTitle>
                    <CardDescription>
                        {executions.length} executions in the last 30 days
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {executions.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No executions yet</h3>
                            <p className="text-muted-foreground">
                                Run an agent to see execution history here
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[600px]">
                            <div className="space-y-3">
                                {executions.map((execution) => {
                                    const config = statusConfig[execution.status];
                                    const StatusIcon = config.icon;

                                    return (
                                        <div
                                            key={execution._id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`h-10 w-10 rounded-lg ${config.bg} flex items-center justify-center`}
                                                >
                                                    <StatusIcon
                                                        className={`h-5 w-5 ${config.color} ${execution.status === "running" ? "animate-spin" : ""
                                                            }`}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">Agent Execution</h4>
                                                        <Badge variant="outline" className="capitalize">
                                                            {execution.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Zap className="h-4 w-4" />
                                                    {execution.tokenUsed} tokens
                                                </div>
                                                {execution.completedAt && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {Math.round((execution.completedAt - execution.startedAt) / 1000)}s
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
