"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, Shield, Zap, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getCurrentWorkspace } from "@/actions/user";

export default function SettingsPage() {
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["user", "current"],
        queryFn: () => getCurrentUser(),
    });

    const { data: workspace, isLoading: isWorkspaceLoading } = useQuery({
        queryKey: ["workspace", "current"],
        queryFn: () => getCurrentWorkspace(),
    });

    const planFeatures = {
        FREE: {
            name: "Free",
            price: "$0",
            tokens: "10,000",
            features: ["5 agents", "Basic nodes", "Community support"],
        },
        PRO: {
            name: "Pro",
            price: "$25/mo",
            tokens: "100,000",
            features: ["Unlimited agents", "All nodes", "Priority support", "API access"],
        },
    };

    if (isUserLoading || isWorkspaceLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    const currentPlan = (workspace?.plan as keyof typeof planFeatures) || "FREE";
    const planInfo = planFeatures[currentPlan];
    const tokenUsage = 0; // Usage tracking not fully implemented in DB yet
    const tokenLimit = workspace?.usageLimit || 10000;
    const usagePercent = (tokenUsage / tokenLimit) * 100;

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and subscription</p>
            </div>

            {/* Profile */}
            <Card className="glass-card border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-violet-400" />
                        Profile
                    </CardTitle>
                    <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border border-white/10 shadow-lg">
                            {user?.name?.[0] || user?.email?.[0] || "U"}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{user?.name || "User"}</h3>
                            <p className="text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage */}
            <Card className="glass-card border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-400" />
                        Token Usage
                    </CardTitle>
                    <CardDescription>Your AI token consumption this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{tokenUsage.toLocaleString()} tokens used</span>
                            <span className="text-muted-foreground">{tokenLimit.toLocaleString()} limit</span>
                        </div>
                        <Progress value={usagePercent} className="h-2 bg-white/5" indicatorClassName="bg-gradient-to-r from-violet-500 to-pink-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Subscription */}
            <Card className="glass-card border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-violet-400" />
                        Subscription
                    </CardTitle>
                    <CardDescription>Manage your billing and subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{planInfo.name} Plan</h3>
                                <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                                    Current
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {planInfo.tokens} tokens/month • {planInfo.price}
                            </p>
                        </div>
                        {currentPlan === "FREE" && (
                            <Button className="gradient-bg glow hover:opacity-90">
                                Upgrade Plan
                            </Button>
                        )}
                    </div>

                    <Separator className="bg-white/5" />

                    <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(planFeatures).map(([key, plan]) => (
                            <div
                                key={key}
                                className={`p-4 rounded-xl border transition-all duration-300 ${key === currentPlan
                                    ? "border-violet-500/50 bg-violet-500/5 shadow-lg shadow-violet-500/5"
                                    : "border-white/5 bg-white/5"
                                    }`}
                            >
                                <h4 className="font-bold">{plan.name}</h4>
                                <p className="text-2xl font-bold mt-1 tracking-tight">{plan.price}</p>
                                <p className="text-xs text-muted-foreground mb-4">{plan.tokens} tokens</p>
                                <ul className="text-xs space-y-1.5">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="text-muted-foreground flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-violet-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="glass-card border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-violet-400" />
                        Security
                    </CardTitle>
                    <CardDescription>Manage your security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-sm">Two-Factor Authentication</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 border-white/10">Enable</Button>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-sm">API Keys</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Manage your API keys for external integrations
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 border-white/10">Manage Keys</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
