"use client";

import { useState } from "react";
import { Check, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
    {
        name: "Free",
        description: "Perfect for getting started",
        price: "$0",
        priceDetail: "forever",
        features: [
            "3 AI agents",
            "10,000 tokens/month",
            "Basic node types",
            "Community support",
            "Standard rate limits",
        ],
        cta: "Current Plan",
        disabled: true,
        gradient: "from-gray-500 to-gray-600",
    },
    {
        name: "Pro",
        description: "For power users and teams",
        price: "$29",
        priceDetail: "/month",
        popular: true,
        features: [
            "Unlimited AI agents",
            "100,000 tokens/month",
            "All node types",
            "Priority support",
            "Higher rate limits",
            "Custom integrations",
            "API access",
        ],
        cta: "Upgrade to Pro",
        disabled: false,
        gradient: "from-purple-500 to-pink-500",
    },
    {
        name: "Enterprise",
        description: "For large organizations",
        price: "Custom",
        priceDetail: "contact us",
        features: [
            "Everything in Pro",
            "1,000,000+ tokens/month",
            "Dedicated support",
            "Custom SLA",
            "SSO/SAML",
            "On-premise option",
            "White-label available",
        ],
        cta: "Contact Sales",
        disabled: false,
        gradient: "from-orange-500 to-red-500",
    },
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Choose the plan that best fits your needs. Upgrade or downgrade at any time.
                </p>

                {/* Billing Toggle */}
                <div className="inline-flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingCycle === "monthly"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingCycle === "yearly"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Yearly
                        <Badge variant="secondary" className="ml-2 text-xs">
                            Save 20%
                        </Badge>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {plans.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`relative border-border/50 bg-card/50 ${plan.popular ? "ring-2 ring-purple-500/50" : ""
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Most Popular
                                </Badge>
                            </div>
                        )}

                        <CardHeader className="text-center pt-8">
                            <div className={`inline-flex mx-auto rounded-lg bg-gradient-to-br ${plan.gradient} p-3 mb-4`}>
                                {plan.name === "Free" && <Shield className="h-6 w-6 text-white" />}
                                {plan.name === "Pro" && <Zap className="h-6 w-6 text-white" />}
                                {plan.name === "Enterprise" && <Sparkles className="h-6 w-6 text-white" />}
                            </div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">
                                    {billingCycle === "yearly" && plan.price !== "Custom" && plan.price !== "$0"
                                        ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}`
                                        : plan.price}
                                </span>
                                <span className="text-muted-foreground ml-1">{plan.priceDetail}</span>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-3">
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                </div>
                            ))}
                        </CardContent>

                        <CardFooter>
                            <Button
                                className={`w-full ${plan.popular
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                        : ""
                                    }`}
                                variant={plan.popular ? "default" : "outline"}
                                disabled={plan.disabled}
                            >
                                {plan.cta}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* FAQ or Additional Info */}
            <div className="text-center text-muted-foreground pt-8">
                <p>
                    All plans include a 14-day free trial. No credit card required.
                </p>
                <p className="mt-2 text-sm">
                    Need a custom plan?{" "}
                    <a href="mailto:sales@agentify.io" className="text-purple-400 hover:underline">
                        Contact our sales team
                    </a>
                </p>
            </div>
        </div>
    );
}
