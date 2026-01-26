"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Sparkles, Users, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { listTemplates, cloneTemplate } from "@/actions/templates";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [cloningId, setCloningId] = useState<string | null>(null);

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ["templates"],
        queryFn: () => listTemplates(),
    });

    const { mutate: handleClone, isPending } = useMutation({
        mutationFn: (id: string) => cloneTemplate(id),
        onMutate: (id) => setCloningId(id),
        onSuccess: (workflow) => {
            toast.success("Template cloned successfully!");
            router.push(`/dashboard/workflows/${workflow.id}`);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to clone template");
            setCloningId(null);
        },
    });

    const filteredTemplates = templates.filter(
        (template) =>
            template.name.toLowerCase().includes(search.toLowerCase()) ||
            template.description.toLowerCase().includes(search.toLowerCase()) ||
            template.category.toLowerCase().includes(search.toLowerCase())
    );

    const categories = Array.from(new Set(templates.map((t) => t.category)));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
                </div>
                <p className="text-muted-foreground ml-1">
                    Start with pre-built agent templates and customize them to your needs
                </p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 glass border-white/10 focus:border-violet-500/50"
                />
            </div>

            {templates.length === 0 ? (
                <Card className="glass-card border-dashed border-2 border-white/10">
                    <CardContent className="py-16 flex flex-col items-center justify-center">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 flex items-center justify-center mb-6">
                            <Sparkles className="h-10 w-10 text-violet-400/50" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No templates yet</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            Templates will be available soon. Create your own agents in the meantime!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-10">
                    {filteredTemplates.filter((t) => t.featured).length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-400" />
                                <span className="gradient-text">Featured Templates</span>
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredTemplates
                                    .filter((t) => t.featured)
                                    .map((template) => (
                                        <TemplateCard
                                            key={template.id}
                                            template={template}
                                            onClone={() => handleClone(template.id)}
                                            isCloning={isPending && cloningId === template.id}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    {categories.map((category) => {
                        const categoryTemplates = filteredTemplates.filter(
                            (t) => t.category === category && !t.featured
                        );
                        if (categoryTemplates.length === 0) return null;

                        return (
                            <div key={category}>
                                <h2 className="text-xl font-semibold mb-6 capitalize px-1 border-l-4 border-violet-500 pl-3">
                                    {category}
                                </h2>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {categoryTemplates.map((template) => (
                                        <TemplateCard
                                            key={template.id}
                                            template={template}
                                            onClone={() => handleClone(template.id)}
                                            isCloning={isPending && cloningId === template.id}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

interface TemplateCardProps {
    template: any;
    onClone: () => void;
    isCloning: boolean;
}

function TemplateCard({ template, onClone, isCloning }: TemplateCardProps) {
    return (
        <Card className="group glass-card hover:border-violet-500/30 transition-all duration-300 hover-lift relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="pb-4 relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20 flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform">
                            {template.icon}
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold group-hover:text-violet-300 transition-colors">
                                {template.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs bg-white/5 hover:bg-white/10 border-white/10">
                                    {template.category}
                                </Badge>
                                {template.featured && (
                                    <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30 text-xs">
                                        Featured
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
                <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                    {template.description}
                </CardDescription>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full">
                        <Users className="h-3.5 w-3.5" />
                        <span>{template.usageCount} uses</span>
                    </div>
                    <Button
                        size="sm"
                        onClick={onClone}
                        disabled={isCloning}
                        className="gradient-bg glow hover:opacity-90 transition-all cursor-pointer text-xs h-8"
                    >
                        {isCloning ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                        ) : (
                            <Sparkles className="h-3.5 w-3.5 mr-2" />
                        )}
                        Use Template
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
