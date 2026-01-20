"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function CreateAgentSection() {
    const router = useRouter();
    const [agentName, setAgentName] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const createAgent = useMutation(api.agents.create);

    const handleCreate = async () => {
        if (!agentName.trim()) {
            toast.error("Please enter an agent name");
            return;
        }

        setIsLoading(true);
        try {
            const result = await createAgent({
                name: agentName.trim(),
                description: "",
            });

            toast.success("Agent created successfully!");
            setIsOpen(false);
            setAgentName("");
            router.push(`/dashboard/agents/${result}`);
        } catch (error) {
            console.error("Failed to create agent:", error);
            toast.error("Failed to create agent. Please sign in first.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="relative group max-w-2xl w-full">
                {/* Decorative background glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative glass-card border-white/5 bg-background/50 backdrop-blur-xl rounded-3xl p-10 flex flex-col items-center text-center space-y-8 shadow-2xl">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-2 shadow-inner border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="h-8 w-8 text-violet-400" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            Ready to <span className="gradient-text">Build?</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                            Orchestrate powerful AI workflows with our drag-and-drop builder.
                            Connect nodes, APIs, and logic in seconds.
                        </p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="lg"
                                variant="glow"
                                className="h-14 px-8 rounded-2xl text-lg font-bold group/btn"
                            >
                                <Plus className="h-6 w-6 mr-3 group-hover/btn:rotate-90 transition-transform duration-300" />
                                Create New Agent
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md border-white/5 bg-background/80 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold gradient-text">Create New Agent</DialogTitle>
                                <DialogDescription className="text-muted-foreground/80">
                                    Enter a name for your AI agent. You can customize the logic later in the builder.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6">
                                <Input
                                    placeholder="e.g. Weather Assistant"
                                    value={agentName}
                                    onChange={(e) => setAgentName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !isLoading) {
                                            handleCreate();
                                        }
                                    }}
                                    disabled={isLoading}
                                    className="h-12 text-lg"
                                />
                            </div>
                            <DialogFooter className="gap-3 sm:gap-2">
                                <DialogClose asChild>
                                    <Button variant="ghost" disabled={isLoading} className="rounded-xl h-11">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    onClick={handleCreate}
                                    disabled={isLoading || !agentName.trim()}
                                    variant="glow"
                                    className="rounded-xl h-11 px-8"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        "Create Agent"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
