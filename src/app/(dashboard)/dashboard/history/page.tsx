"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Clock, Zap, CheckCircle, XCircle, Pause, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listExecutionsByUser } from "@/actions/workflows";

const statusConfig: Record<string, any> = {
    PENDING: { icon: Pause, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    RUNNING: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10" },
    COMPLETED: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    FAILED: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    CANCELLED: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-500/10" },
};

export default function HistoryPage() {
    const { data: executions = [], isLoading } = useQuery({
        queryKey: ["executions", "history"],
        queryFn: () => listExecutionsByUser(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Execution History</h1>
                <p className="text-muted-foreground">
                    View past agent executions and their results
                </p>
            </div>

            <Card className="glass-card border-white/10">
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
                                    const config = statusConfig[execution.status] || statusConfig.PENDING;
                                    const StatusIcon = config.icon;

                                    return (
                                        <div
                                            key={execution.id}
                                            className="flex items-center justify-between p-4 rounded-xl glass-card border-white/5 hover:border-violet-500/30 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`h-11 w-11 rounded-xl ${config.bg} flex items-center justify-center border border-white/5`}
                                                >
                                                    <StatusIcon
                                                        className={`h-5 w-5 ${config.color} ${execution.status === "RUNNING" ? "animate-spin" : ""
                                                            }`}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-sm">
                                                            {execution.workflow?.name || "Deleted Workflow"}
                                                        </h4>
                                                        <Badge variant="outline" className="capitalize text-[10px] py-0 h-4 border-white/10">
                                                            {execution.status.toLowerCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {execution.startedAt
                                                            ? formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })
                                                            : "Not started"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 text-[11px] text-muted-foreground">
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                                                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                                                    <span>{(execution as any).tokenUsed ?? 0} tokens</span>
                                                </div>
                                                {execution.completedAt && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                                                        <Clock className="h-3.5 w-3.5 text-violet-400" />
                                                        <span>
                                                            {Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt!).getTime()) / 1000)}s
                                                        </span>
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
