import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Node and edge validators (matching schema)
const nodeValidator = v.object({
    id: v.string(),
    type: v.string(),
    position: v.object({ x: v.number(), y: v.number() }),
    data: v.any(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
});

const edgeValidator = v.object({
    id: v.string(),
    source: v.string(),
    target: v.string(),
    sourceHandle: v.optional(v.string()),
    targetHandle: v.optional(v.string()),
    animated: v.optional(v.boolean()),
    type: v.optional(v.string()),
});

// Get all templates
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("templates")
            .order("desc")
            .collect();
    },
});

// Get featured templates
export const listFeatured = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("templates")
            .withIndex("by_featured", (q) => q.eq("featured", true))
            .collect();
    },
});

// Get templates by category
export const listByCategory = query({
    args: { category: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("templates")
            .withIndex("by_category", (q) => q.eq("category", args.category))
            .collect();
    },
});

// Get template by ID
export const getById = query({
    args: { templateId: v.id("templates") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.templateId);
    },
});

// Clone template to create a new agent
export const cloneToAgent = mutation({
    args: {
        templateId: v.id("templates"),
        userId: v.id("users"),
        agentName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const template = await ctx.db.get(args.templateId);
        if (!template) throw new Error("Template not found");

        const now = Date.now();

        // Update template usage count
        await ctx.db.patch(args.templateId, {
            usageCount: template.usageCount + 1,
        });

        // Create new agent from template
        return await ctx.db.insert("agents", {
            userId: args.userId,
            name: args.agentName || `${template.name} (Copy)`,
            description: template.description,
            icon: template.icon,
            nodes: template.nodes,
            edges: template.edges,
            isPublished: false,
            runCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    },
});

// Seed initial templates (called once during setup)
export const seedTemplates = internalMutation({
    args: {},
    handler: async (ctx) => {
        const templates = [
            {
                name: "Customer Support Bot",
                description: "AI-powered customer support agent that answers FAQs and escalates issues",
                icon: "🎧",
                category: "Support",
                featured: true,
                nodes: [
                    {
                        id: "start",
                        type: "start",
                        position: { x: 250, y: 50 },
                        data: { label: "Start", trigger: "manual" },
                    },
                    {
                        id: "ai-1",
                        type: "ai",
                        position: { x: 250, y: 200 },
                        data: {
                            label: "Support Assistant",
                            provider: "openai",
                            model: "gpt-4o-mini",
                            systemPrompt: "You are a helpful customer support assistant. Answer questions politely and professionally. If you cannot help, offer to escalate to a human agent.",
                            temperature: 0.7,
                        },
                    },
                    {
                        id: "end",
                        type: "end",
                        position: { x: 250, y: 350 },
                        data: { label: "End" },
                    },
                ],
                edges: [
                    { id: "e1", source: "start", target: "ai-1", animated: true },
                    { id: "e2", source: "ai-1", target: "end", animated: true },
                ],
            },
            {
                name: "Code Review Assistant",
                description: "Reviews code and provides suggestions for improvements and best practices",
                icon: "💻",
                category: "Development",
                featured: true,
                nodes: [
                    {
                        id: "start",
                        type: "start",
                        position: { x: 250, y: 50 },
                        data: { label: "Start", trigger: "manual" },
                    },
                    {
                        id: "ai-1",
                        type: "ai",
                        position: { x: 250, y: 200 },
                        data: {
                            label: "Code Reviewer",
                            provider: "openai",
                            model: "gpt-4o",
                            systemPrompt: "You are an expert code reviewer. Analyze the provided code for bugs, security issues, performance problems, and style improvements. Provide specific, actionable feedback.",
                            temperature: 0.3,
                        },
                    },
                    {
                        id: "end",
                        type: "end",
                        position: { x: 250, y: 350 },
                        data: { label: "End" },
                    },
                ],
                edges: [
                    { id: "e1", source: "start", target: "ai-1", animated: true },
                    { id: "e2", source: "ai-1", target: "end", animated: true },
                ],
            },
            {
                name: "Content Writer",
                description: "Creates blog posts, articles, and marketing copy with a consistent brand voice",
                icon: "✍️",
                category: "Content",
                featured: true,
                nodes: [
                    {
                        id: "start",
                        type: "start",
                        position: { x: 250, y: 50 },
                        data: { label: "Start", trigger: "manual" },
                    },
                    {
                        id: "ai-1",
                        type: "ai",
                        position: { x: 250, y: 200 },
                        data: {
                            label: "Content Writer",
                            provider: "anthropic",
                            model: "claude-3-5-sonnet-20241022",
                            systemPrompt: "You are a professional content writer. Create engaging, well-structured content that is informative and matches the desired tone. Use headers, bullet points, and clear formatting.",
                            temperature: 0.8,
                        },
                    },
                    {
                        id: "end",
                        type: "end",
                        position: { x: 250, y: 350 },
                        data: { label: "End" },
                    },
                ],
                edges: [
                    { id: "e1", source: "start", target: "ai-1", animated: true },
                    { id: "e2", source: "ai-1", target: "end", animated: true },
                ],
            },
            {
                name: "Data Analyst",
                description: "Analyzes data and generates insights, summaries, and recommendations",
                icon: "📊",
                category: "Analytics",
                featured: false,
                nodes: [
                    {
                        id: "start",
                        type: "start",
                        position: { x: 250, y: 50 },
                        data: { label: "Start", trigger: "manual" },
                    },
                    {
                        id: "ai-1",
                        type: "ai",
                        position: { x: 250, y: 200 },
                        data: {
                            label: "Data Analyst",
                            provider: "google",
                            model: "gemini-1.5-pro",
                            systemPrompt: "You are a data analyst. Analyze the provided data and generate clear insights, trends, and actionable recommendations. Present findings in a structured format with key metrics highlighted.",
                            temperature: 0.4,
                        },
                    },
                    {
                        id: "end",
                        type: "end",
                        position: { x: 250, y: 350 },
                        data: { label: "End" },
                    },
                ],
                edges: [
                    { id: "e1", source: "start", target: "ai-1", animated: true },
                    { id: "e2", source: "ai-1", target: "end", animated: true },
                ],
            },
            {
                name: "Email Assistant",
                description: "Helps compose professional emails and responses",
                icon: "📧",
                category: "Productivity",
                featured: false,
                nodes: [
                    {
                        id: "start",
                        type: "start",
                        position: { x: 250, y: 50 },
                        data: { label: "Start", trigger: "manual" },
                    },
                    {
                        id: "ai-1",
                        type: "ai",
                        position: { x: 250, y: 200 },
                        data: {
                            label: "Email Writer",
                            provider: "openai",
                            model: "gpt-4o-mini",
                            systemPrompt: "You are a professional email assistant. Help compose clear, concise, and appropriate emails. Match the tone to the context (formal/informal) and ensure the message is complete and actionable.",
                            temperature: 0.6,
                        },
                    },
                    {
                        id: "end",
                        type: "end",
                        position: { x: 250, y: 350 },
                        data: { label: "End" },
                    },
                ],
                edges: [
                    { id: "e1", source: "start", target: "ai-1", animated: true },
                    { id: "e2", source: "ai-1", target: "end", animated: true },
                ],
            },
        ];

        // Insert templates
        const now = Date.now();
        for (const template of templates) {
            await ctx.db.insert("templates", {
                ...template,
                usageCount: 0,
                createdAt: now,
            });
        }
    },
});
