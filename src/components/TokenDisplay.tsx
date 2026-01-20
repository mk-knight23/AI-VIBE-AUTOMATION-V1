"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Zap, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TokenDisplayProps {
    collapsed?: boolean;
}

const DEMO_USER_ID = "demo_user_local_dev";

export function TokenDisplay({ collapsed = false }: TokenDisplayProps) {
    const user = useQuery(api.users.getByClerkId, { clerkId: DEMO_USER_ID });

    if (!user) {
        return null;
    }

    const usagePercent = Math.min((user.tokenUsage / user.tokenLimit) * 100, 100);
    const isNearLimit = usagePercent > 80;
    const formattedUsage = formatNumber(user.tokenUsage);
    const formattedLimit = formatNumber(user.tokenLimit);

    if (collapsed) {
        return (
            <div className="flex flex-col items-center gap-2">
                <div className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold",
                    isNearLimit ? "bg-orange-500/20 text-orange-400" : "bg-violet-500/20 text-violet-400"
                )}>
                    <Zap className="h-4 w-4" />
                </div>
                {user.plan === "free" && (
                    <Link href="/dashboard/pricing">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/5">
                            <TrendingUp className="h-4 w-4 text-violet-400" />
                        </Button>
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Token Usage */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" />
                        Tokens
                    </span>
                    <span className={cn(
                        "font-medium",
                        isNearLimit ? "text-orange-400" : "text-foreground"
                    )}>
                        {formattedUsage} / {formattedLimit}
                    </span>
                </div>
                <Progress
                    value={usagePercent}
                    className="h-1.5"
                />
            </div>

            {/* Plan & Upgrade */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        user.plan === "free" && "bg-slate-500/20 text-slate-400",
                        user.plan === "pro" && "bg-violet-500/20 text-violet-400",
                        user.plan === "enterprise" && "bg-orange-500/20 text-orange-400"
                    )}>
                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </span>
                </div>
                {user.plan === "free" && (
                    <Link href="/dashboard/pricing">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-violet-400 hover:text-violet-300 hover:bg-white/5 cursor-pointer">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Upgrade
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}
