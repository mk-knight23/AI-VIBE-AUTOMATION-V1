"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { listExecutions } from "@/actions/workflows";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function WorkflowRunsPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: executions = [], isLoading } = useQuery({
        queryKey: ["executions", id],
        queryFn: () => listExecutions(id),
        refetchInterval: 3000, // Poll for updates
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/workflows/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Execution History</h1>
                    <p className="text-muted-foreground mt-1">
                        View recent runs and logs for this workflow
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {executions.length === 0 ? (
                    <Card className="glass-card">
                        <CardContent className="py-12 text-center">
                            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground">No executions found for this workflow yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    executions.map((execution: any) => (
                        <Card key={execution.id} className="glass-card overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {execution.status === "COMPLETED" ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        ) : execution.status === "FAILED" ? (
                                            <XCircle className="h-5 w-5 text-rose-500" />
                                        ) : (
                                            <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                                        )}
                                        <div className="font-semibold">Run {execution.id.slice(-6)}</div>
                                        <Badge variant="outline" className="capitalize">
                                            {execution.status.toLowerCase()}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {execution.startedAt ? formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true }) : "N/A"}
                                    </div>
                                </div>

                                {execution.error && (
                                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-sm text-rose-400 mb-4">
                                        {execution.error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Logs</div>
                                    <div className="bg-black/20 rounded-lg p-3 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                                        {execution.logs.map((log: any) => (
                                            <div key={log.id} className="flex gap-3">
                                                <span className="text-muted-foreground shrink-0">
                                                    [{new Date(log.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                                                </span>
                                                <span className={log.level === "ERROR" ? "text-rose-400" : log.level === "WARN" ? "text-amber-400" : "text-emerald-400"}>
                                                    {log.message}
                                                </span>
                                            </div>
                                        ))}
                                        {execution.logs.length === 0 && <span className="text-muted-foreground italic">No logs recorded</span>}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
