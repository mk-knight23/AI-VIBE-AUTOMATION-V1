"use client";

import { useState, Suspense } from "react";
import { Check, Zap, Shield, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCheckout } from "@/actions/payments";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

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
        gradient: "from-gray-500/20 to-gray-600/20",
        icon: Shield,
        iconColor: "text-gray-400",
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
        gradient: "from-violet-500/20 to-pink-500/20",
        productId: process.env.NEXT_PUBLIC_POLAR_PRO_ID || "pro-plan-id",
        icon: Zap,
        iconColor: "text-violet-400",
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
        gradient: "from-orange-500/20 to-red-500/20",
        icon: Sparkles,
        iconColor: "text-orange-400",
    },
];

function PricingContent() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("success")) {
            toast.success("Thank you for subscribing! Your account is being updated.");
        }
    }, [searchParams]);

    const { mutate: handleSubscribe, isPending: isRedirecting } = useMutation({
        mutationFn: (productId: string) => createCheckout(productId),
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Something went wrong. Please try again.");
        }
    });

    return (
        <div className="p-6 md:p-8 space-y-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="h-3.5 w-3.5" />
                    Flexible Plans
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight gradient-text py-2">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                    Choose the plan that best fits your needs. Scale your AI automation with
                    unmatched power and flexibility.
                </p>

                {/* Billing Toggle */}
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${billingCycle === "monthly"
                            ? "bg-violet-600 text-white shadow-xl shadow-violet-600/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${billingCycle === "yearly"
                            ? "bg-violet-600 text-white shadow-xl shadow-violet-600/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                    >
                        Yearly
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 h-5 px-1.5 uppercase font-black">
                            -20%
                        </Badge>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                {plans.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`relative glass-card border-white/10 overflow-hidden group transition-all duration-500 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/5 flex flex-col ${plan.popular ? "scale-105 z-10 border-violet-500/40 bg-violet-500/[0.03]" : ""
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-0">
                                <div className="bg-gradient-to-l from-violet-600 to-pink-600 text-white text-[10px] font-bold px-8 py-1.5 rotate-45 translate-x-10 translate-y-2 shadow-lg">
                                    POPULAR
                                </div>
                            </div>
                        )}

                        <CardHeader className="text-center pt-10 pb-8 relative">
                            {/* Decorative gradient blob */}
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[60px] rounded-full opacity-20 bg-gradient-to-br ${plan.gradient}`} />

                            <div className={`inline-flex mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} p-4 mb-6 relative z-10 border border-white/5 shadow-inner`}>
                                <plan.icon className={`h-8 w-8 ${plan.iconColor}`} />
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight mb-2">{plan.name}</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">{plan.description}</CardDescription>
                            <div className="mt-8 flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-black tracking-tighter">
                                    {billingCycle === "yearly" && plan.price !== "Custom" && plan.price !== "$0"
                                        ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}`
                                        : plan.price}
                                </span>
                                <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">{plan.priceDetail}</span>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 px-8 flex-grow">
                            <div className="h-px bg-white/5 w-full mb-6" />
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-4 group/feature">
                                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 transition-transform group-hover/feature:scale-110">
                                        <Check className="h-3 w-3 text-emerald-400" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground/80 group-hover/feature:text-foreground transition-colors">{feature}</span>
                                </div>
                            ))}
                        </CardContent>

                        <CardFooter className="p-8 pt-0">
                            <Button
                                className={`w-full h-14 rounded-2xl text-sm font-bold transition-all duration-300 ${plan.popular
                                    ? "gradient-bg glow hover:opacity-90 shadow-xl shadow-violet-600/20"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                    }`}
                                variant={plan.popular ? "default" : "outline"}
                                disabled={plan.disabled || isRedirecting}
                                onClick={() => {
                                    if ((plan as any).productId) {
                                        handleSubscribe((plan as any).productId);
                                    }
                                }}
                            >
                                {isRedirecting && (plan as any).productId ? (
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                ) : null}
                                {plan.cta}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* FAQ Area */}
            <div className="max-w-3xl mx-auto pt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <h4 className="font-bold text-foreground">Can I cancel anytime?</h4>
                        <p className="text-sm text-muted-foreground">Yes, you can cancel your subscription at any time from your settings panel.</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-bold text-foreground">What happens if I run out of tokens?</h4>
                        <p className="text-sm text-muted-foreground">You can purchase additional token packs or upgrade to a higher plan instantly.</p>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-30">
                    Secure payments powered by Polar
                </p>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>}>
            <PricingContent />
        </Suspense>
    );
}

