import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Log type validator
const logValidator = v.object({
    nodeId: v.string(),
    type: v.union(v.literal("info"), v.literal("error"), v.literal("success"), v.literal("warning")),
    message: v.string(),
    timestamp: v.number(),
    data: v.optional(v.any()),
});

// Get executions for an agent
export const listByAgent = query({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("executions")
            .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
            .order("desc")
            .take(50);
    },
});

// Get executions for current user
export const listByUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) return [];

        return await ctx.db
            .query("executions")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(100);
    },
});

// Get single execution
export const getById = query({
    args: { executionId: v.id("executions") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.executionId);
    },
});

// Create new execution
export const create = mutation({
    args: {
        agentId: v.id("agents"),
        input: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) throw new Error("User not found");

        const now = Date.now();

        return await ctx.db.insert("executions", {
            agentId: args.agentId,
            userId: user._id,
            status: "pending",
            input: args.input,
            logs: [],
            tokenUsed: 0,
            startedAt: now,
        });
    },
});

// Update execution status
export const updateStatus = mutation({
    args: {
        executionId: v.id("executions"),
        status: v.union(
            v.literal("pending"),
            v.literal("running"),
            v.literal("completed"),
            v.literal("failed"),
            v.literal("cancelled")
        ),
        output: v.optional(v.any()),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const updates: Record<string, unknown> = {
            status: args.status,
        };

        if (args.output !== undefined) {
            updates.output = args.output;
        }

        if (args.error !== undefined) {
            updates.error = args.error;
        }

        if (args.status === "completed" || args.status === "failed" || args.status === "cancelled") {
            updates.completedAt = Date.now();
        }

        await ctx.db.patch(args.executionId, updates);
    },
});

// Add log entry to execution
export const addLog = mutation({
    args: {
        executionId: v.id("executions"),
        log: logValidator,
    },
    handler: async (ctx, args) => {
        const execution = await ctx.db.get(args.executionId);
        if (!execution) throw new Error("Execution not found");

        await ctx.db.patch(args.executionId, {
            logs: [...execution.logs, args.log],
        });
    },
});

// Update token usage for execution
export const updateTokenUsage = mutation({
    args: {
        executionId: v.id("executions"),
        tokensUsed: v.number(),
    },
    handler: async (ctx, args) => {
        const execution = await ctx.db.get(args.executionId);
        if (!execution) throw new Error("Execution not found");

        await ctx.db.patch(args.executionId, {
            tokenUsed: execution.tokenUsed + args.tokensUsed,
        });
    },
});

// Get messages for an execution
export const getMessages = query({
    args: { executionId: v.id("executions") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_execution", (q) => q.eq("executionId", args.executionId))
            .order("asc")
            .collect();
    },
});

// Add message to execution
export const addMessage = mutation({
    args: {
        executionId: v.id("executions"),
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
        nodeId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("messages", {
            executionId: args.executionId,
            role: args.role,
            content: args.content,
            timestamp: Date.now(),
            nodeId: args.nodeId,
        });
    },
});

// Cancel execution
export const cancel = mutation({
    args: { executionId: v.id("executions") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.executionId, {
            status: "cancelled",
            completedAt: Date.now(),
        });
    },
});
