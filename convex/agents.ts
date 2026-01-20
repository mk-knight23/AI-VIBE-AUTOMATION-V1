import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Node type validator (matching schema)
const nodeValidator = v.object({
    id: v.string(),
    type: v.string(),
    position: v.object({ x: v.number(), y: v.number() }),
    data: v.any(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
});

// Edge type validator (matching schema)
const edgeValidator = v.object({
    id: v.string(),
    source: v.string(),
    target: v.string(),
    sourceHandle: v.optional(v.string()),
    targetHandle: v.optional(v.string()),
    animated: v.optional(v.boolean()),
    type: v.optional(v.string()),
});

// Demo user ID for local development
const DEMO_CLERK_ID = "demo_user_local_dev";

// Helper to get demo user (read-only, for queries)
async function getDemoUserId(ctx: any): Promise<Id<"users"> | null> {
    const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", DEMO_CLERK_ID))
        .first();
    return existingUser?._id || null;
}

// Helper to get or create demo user (for mutations only)
async function getOrCreateDemoUser(ctx: any): Promise<Id<"users">> {
    const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", DEMO_CLERK_ID))
        .first();

    if (existingUser) {
        return existingUser._id;
    }

    // Create demo user
    const now = Date.now();
    return await ctx.db.insert("users", {
        clerkId: DEMO_CLERK_ID,
        email: "demo@agentify.local",
        name: "Demo User",
        plan: "free",
        tokenUsage: 0,
        tokenLimit: 10000,
        createdAt: now,
        updatedAt: now,
    });
}

// Helper to get current user ID for QUERIES (read-only)
async function getUserIdForQuery(ctx: any): Promise<Id<"users"> | null> {
    const identity = await ctx.auth.getUserIdentity();

    if (identity) {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
            .first();
        return user?._id || null;
    }

    // Demo mode - only read (queries can't write)
    return await getDemoUserId(ctx);
}

// Helper to get current user ID for MUTATIONS (can create demo user)
async function getUserIdForMutation(ctx: any): Promise<Id<"users"> | null> {
    const identity = await ctx.auth.getUserIdentity();

    if (identity) {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
            .first();
        return user?._id || null;
    }

    // Demo mode - create or get demo user
    return await getOrCreateDemoUser(ctx);
}

// Get all agents for current user
export const listByUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getUserIdForQuery(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("agents")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// Get agents by user ID (for components that have userId)
export const getByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("agents")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

// Get single agent by ID
export const getById = query({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.agentId);
    },
});

// Create new agent
export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdForMutation(ctx);
        if (!userId) throw new Error("Unauthorized");

        const now = Date.now();

        // Create with default start and end nodes
        const defaultNodes = [
            {
                id: "start-node",
                type: "start",
                position: { x: 250, y: 50 },
                data: { label: "Start", trigger: "manual" },
            },
            {
                id: "end-node",
                type: "end",
                position: { x: 250, y: 400 },
                data: { label: "End" },
            },
        ];

        return await ctx.db.insert("agents", {
            userId: userId,
            name: args.name,
            description: args.description,
            icon: args.icon || "🤖",
            nodes: defaultNodes,
            edges: [],
            isPublished: false,
            runCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    },
});

// Update agent details
export const update = mutation({
    args: {
        agentId: v.id("agents"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { agentId, ...updates } = args;

        await ctx.db.patch(agentId, {
            ...updates,
            updatedAt: Date.now(),
        });
    },
});

// Update agent workflow (nodes and edges)
export const updateWorkflow = mutation({
    args: {
        agentId: v.id("agents"),
        nodes: v.array(nodeValidator),
        edges: v.array(edgeValidator),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.agentId, {
            nodes: args.nodes,
            edges: args.edges,
            updatedAt: Date.now(),
        });
    },
});

// Toggle agent published status
export const togglePublish = mutation({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        const agent = await ctx.db.get(args.agentId);
        if (!agent) throw new Error("Agent not found");

        await ctx.db.patch(args.agentId, {
            isPublished: !agent.isPublished,
            updatedAt: Date.now(),
        });
    },
});

// Delete agent
export const remove = mutation({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        // Also delete related executions
        const executions = await ctx.db
            .query("executions")
            .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
            .collect();

        for (const execution of executions) {
            // Delete messages for each execution
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_execution", (q) => q.eq("executionId", execution._id))
                .collect();

            for (const message of messages) {
                await ctx.db.delete(message._id);
            }

            await ctx.db.delete(execution._id);
        }

        await ctx.db.delete(args.agentId);
    },
});

// Increment run count
export const incrementRunCount = mutation({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        const agent = await ctx.db.get(args.agentId);
        if (!agent) throw new Error("Agent not found");

        await ctx.db.patch(args.agentId, {
            runCount: agent.runCount + 1,
            lastRun: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

// Duplicate agent
export const duplicate = mutation({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        const userId = await getUserIdForMutation(ctx);
        if (!userId) throw new Error("Unauthorized");

        const agent = await ctx.db.get(args.agentId);
        if (!agent) throw new Error("Agent not found");

        const now = Date.now();

        return await ctx.db.insert("agents", {
            userId: userId,
            name: `${agent.name} (Copy)`,
            description: agent.description,
            icon: agent.icon,
            nodes: agent.nodes,
            edges: agent.edges,
            isPublished: false,
            runCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    },
});
