import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user by Clerk ID
export const getByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
    },
});

// Get current user (assumes authenticated context)
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();
    },
});

// Create or update user from Clerk webhook
export const upsertFromClerk = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        const now = Date.now();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                email: args.email,
                name: args.name,
                imageUrl: args.imageUrl,
                updatedAt: now,
            });
            return existingUser._id;
        }

        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            email: args.email,
            name: args.name,
            imageUrl: args.imageUrl,
            plan: "free",
            tokenUsage: 0,
            tokenLimit: 10000, // Free tier limit
            createdAt: now,
            updatedAt: now,
        });
    },
});

// Update user plan
export const updatePlan = mutation({
    args: {
        userId: v.id("users"),
        plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    },
    handler: async (ctx, args) => {
        const tokenLimits = {
            free: 10000,
            pro: 100000,
            enterprise: 1000000,
        };

        await ctx.db.patch(args.userId, {
            plan: args.plan,
            tokenLimit: tokenLimits[args.plan],
            updatedAt: Date.now(),
        });
    },
});

// Update token usage
export const updateTokenUsage = mutation({
    args: {
        userId: v.id("users"),
        tokensUsed: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        await ctx.db.patch(args.userId, {
            tokenUsage: user.tokenUsage + args.tokensUsed,
            updatedAt: Date.now(),
        });
    },
});

// Delete user
export const deleteUser = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (user) {
            await ctx.db.delete(user._id);
        }
    },
});
