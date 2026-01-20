"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TokenDisplay } from "@/components/TokenDisplay";
import {
    Bot,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    History,
    LayoutDashboard,
    Menu,
    Plus,
    Settings,
    Sparkles,
    User,
} from "lucide-react";

interface DashboardLayoutProps {
    children: ReactNode;
}

const sidebarLinks = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "My Agents",
        href: "/dashboard/agents",
        icon: Bot,
    },
    {
        title: "Templates",
        href: "/dashboard/templates",
        icon: Sparkles,
    },
    {
        title: "History",
        href: "/dashboard/history",
        icon: History,
    },
    {
        title: "Pricing",
        href: "/dashboard/pricing",
        icon: CreditCard,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-white/5 px-4">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-xl font-bold gradient-text">
                            Agentify
                        </span>
                    )}
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("ml-auto hover:bg-white/5", collapsed && "hidden")}
                    onClick={() => setCollapsed(true)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>

            {/* Create Agent Button */}
            <div className="p-4">
                <Link href="/dashboard/agents/new">
                    <Button
                        className={cn(
                            "w-full gradient-bg hover:opacity-90 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 cursor-pointer",
                            collapsed && "px-0"
                        )}
                    >
                        <Plus className="h-5 w-5" />
                        {!collapsed && <span className="ml-2">New Agent</span>}
                    </Button>
                </Link>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3">
                <nav className="space-y-1">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                                    isActive
                                        ? "bg-gradient-to-r from-violet-500/15 to-pink-500/10 text-violet-300 border border-violet-500/20"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent",
                                    collapsed && "justify-center px-2"
                                )}
                            >
                                <link.icon className={cn(
                                    "h-5 w-5 flex-shrink-0 transition-colors",
                                    isActive && "text-violet-400"
                                )} />
                                {!collapsed && <span>{link.title}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* User Section with Token Display */}
            <div className="border-t border-white/5 p-4 space-y-4">
                {/* Token Usage */}
                <TokenDisplay collapsed={collapsed} />

                {/* User Info */}
                <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Demo User</p>
                            <p className="text-xs text-muted-foreground">demo@agentify.local</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_50%)] pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.1),transparent_50%)] pointer-events-none" />

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex flex-col glass-card transition-all duration-300 relative z-10",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden fixed top-4 left-4 z-40 glass"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 glass-card border-r-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative z-10">
                {children}
            </main>

            {/* Expand button when collapsed */}
            {collapsed && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex fixed top-4 left-4 z-40 glass hover:bg-white/10"
                    onClick={() => setCollapsed(false)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
