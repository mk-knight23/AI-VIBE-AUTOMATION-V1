"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, Shield, Zap } from "lucide-react";

export default function SettingsPage() {
    const user = useQuery(api.users.getCurrentUser);

    const planFeatures = {
        free: {
            name: "Free",
            price: "$0",
            tokens: "10,000",
            features: ["5 agents", "Basic nodes", "Community support"],
        },
        pro: {
            name: "Pro",
            price: "$25/mo",
            tokens: "100,000",
            features: ["Unlimited agents", "All nodes", "Priority support", "API access"],
        },
        enterprise: {
            name: "Enterprise",
            price: "Custom",
            tokens: "Unlimited",
            features: ["Custom integrations", "Dedicated support", "SLA", "On-premise option"],
        },
    };

    const currentPlan = user?.plan || "free";
    const planInfo = planFeatures[currentPlan as keyof typeof planFeatures];
    const tokenUsage = user?.tokenUsage || 0;
    const tokenLimit = user?.tokenLimit || 10000;
    const usagePercent = (tokenUsage / tokenLimit) * 100;

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and subscription</p>
            </div>

            {/* Profile */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile
                    </CardTitle>
                    <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                            {user?.name?.[0] || user?.email?.[0] || "U"}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{user?.name || "User"}</h3>
                            <p className="text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Token Usage
                    </CardTitle>
                    <CardDescription>Your AI token consumption this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>{tokenUsage.toLocaleString()} tokens used</span>
                            <span>{tokenLimit.toLocaleString()} limit</span>
                        </div>
                        <Progress value={usagePercent} className="h-2" />
                    </div>
                    {usagePercent > 80 && (
                        <p className="text-sm text-yellow-500">
                            You&apos;re approaching your token limit. Consider upgrading your plan.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Subscription */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Subscription
                    </CardTitle>
                    <CardDescription>Manage your billing and subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{planInfo.name} Plan</h3>
                                <Badge
                                    className={
                                        currentPlan === "pro"
                                            ? "bg-purple-500"
                                            : currentPlan === "enterprise"
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                                : ""
                                    }
                                >
                                    Current
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                {planInfo.tokens} tokens/month • {planInfo.price}
                            </p>
                        </div>
                        {currentPlan !== "enterprise" && (
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                                Upgrade Plan
                            </Button>
                        )}
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-3 gap-4">
                        {Object.entries(planFeatures).map(([key, plan]) => (
                            <div
                                key={key}
                                className={`p-4 rounded-lg border ${key === currentPlan
                                    ? "border-purple-500 bg-purple-500/5"
                                    : "border-border/50"
                                    }`}
                            >
                                <h4 className="font-semibold">{plan.name}</h4>
                                <p className="text-2xl font-bold mt-1">{plan.price}</p>
                                <p className="text-sm text-muted-foreground mb-4">{plan.tokens} tokens</p>
                                <ul className="text-sm space-y-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="text-muted-foreground">
                                            • {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security
                    </CardTitle>
                    <CardDescription>Manage your security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Two-Factor Authentication</h4>
                            <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <Button variant="outline">Enable</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">API Keys</h4>
                            <p className="text-sm text-muted-foreground">
                                Manage your API keys for external integrations
                            </p>
                        </div>
                        <Button variant="outline">Manage Keys</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
