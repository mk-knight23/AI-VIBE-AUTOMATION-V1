"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { Bot, Plus, Search, MoreVertical, Trash, Copy, Play, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listWorkflows, createWorkflow, deleteWorkflow, duplicateWorkflow } from "@/actions/workflows";

const iconOptions = ["🤖", "🧠", "⚡", "🔮", "🎯", "🚀", "💡", "🔧", "📊", "🌐"];

export default function AgentsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newAgent, setNewAgent] = useState({
        name: "",
        description: "",
        icon: "🤖",
    });

    const { data: workflows = [], isLoading } = useQuery({
        queryKey: ["workflows"],
        queryFn: () => listWorkflows(),
    });

    const createMutation = useMutation({
        mutationFn: (data: { name: string; description?: string }) => createWorkflow(data.name, data.description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
            toast.success("Agent created successfully!");
            setIsCreateOpen(false);
            setNewAgent({ name: "", description: "", icon: "🤖" });
        },
        onError: () => toast.error("Failed to create agent"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteWorkflow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
            toast.success("Agent deleted");
        },
        onError: () => toast.error("Failed to delete agent"),
    });

    const duplicateMutation = useMutation({
        mutationFn: (id: string) => duplicateWorkflow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
            toast.success("Agent duplicated");
        },
        onError: () => toast.error("Failed to duplicate agent"),
    });

    const filteredAgents = workflows.filter(
        (agent) =>
            agent.name.toLowerCase().includes(search.toLowerCase()) ||
            agent.description?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        if (!newAgent.name.trim()) {
            toast.error("Please enter an agent name");
            return;
        }
        createMutation.mutate({ name: newAgent.name, description: newAgent.description });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Agents</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage your AI agents
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            <Plus className="h-5 w-5 mr-2" />
                            New Agent
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Agent</DialogTitle>
                            <DialogDescription>
                                Give your agent a name and description to get started.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <div className="flex flex-wrap gap-2">
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setNewAgent({ ...newAgent, icon })}
                                            className={`h-10 w-10 rounded-lg text-xl flex items-center justify-center transition-colors ${newAgent.icon === icon
                                                ? "bg-purple-500/20 border-2 border-purple-500"
                                                : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="My AI Agent"
                                    value={newAgent.name}
                                    onChange={(e) =>
                                        setNewAgent({ ...newAgent, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="What does this agent do?"
                                    value={newAgent.description}
                                    onChange={(e) =>
                                        setNewAgent({ ...newAgent, description: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={createMutation.isPending}
                                className="bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Create Agent
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search agents..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {filteredAgents.length === 0 ? (
                <Card className="border-dashed border-2 border-border/50 bg-card/30">
                    <CardContent className="py-16 flex flex-col items-center justify-center">
                        <Bot className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {search ? "No agents found" : "No agents yet"}
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md mb-4">
                            {search
                                ? "Try a different search term"
                                : "Create your first AI agent to start building intelligent workflows"}
                        </p>
                        {!search && (
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Agent
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAgents.map((agent) => (
                        <Card
                            key={agent.id}
                            className="group border-border/50 bg-card/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                                            {/* We don't have icon in DB yet, using default */}
                                            🤖
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{agent.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {agent.description || "No description"}
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => duplicateMutation.mutate(agent.id)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-500 focus:text-red-500"
                                                onClick={() => deleteMutation.mutate(agent.id)}
                                            >
                                                <Trash className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={agent.isActive ? "default" : "secondary"}>
                                            {agent.isActive ? "Published" : "Draft"}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {(agent as any).runCount} runs
                                        </span>

                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/dashboard/workflows/${agent.id}/chat`}>
                                            <Button size="sm" variant="outline">
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/dashboard/workflows/${agent.id}`}>
                                            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
