import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Node type validator
const nodeValidator = v.object({
  id: v.string(),
  type: v.string(),
  position: v.object({ x: v.number(), y: v.number() }),
  data: v.any(),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
});

// Edge type validator
const edgeValidator = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
  sourceHandle: v.optional(v.string()),
  targetHandle: v.optional(v.string()),
  animated: v.optional(v.boolean()),
  type: v.optional(v.string()),
});

// Execution log validator
const logValidator = v.object({
  nodeId: v.string(),
  type: v.union(v.literal("info"), v.literal("error"), v.literal("success"), v.literal("warning")),
  message: v.string(),
  timestamp: v.number(),
  data: v.optional(v.any()),
});

export default defineSchema({
  // Users table - synced with Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    tokenUsage: v.number(),
    tokenLimit: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Agents table - stores agent configurations
  agents: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    nodes: v.array(nodeValidator),
    edges: v.array(edgeValidator),
    isPublished: v.boolean(),
    lastRun: v.optional(v.number()),
    runCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_published", ["isPublished"]),

  // Executions table - tracks agent run history
  executions: defineTable({
    agentId: v.id("agents"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    input: v.optional(v.any()),
    output: v.optional(v.any()),
    logs: v.array(logValidator),
    tokenUsed: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_agent", ["agentId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Chat messages for agent conversations
  messages: defineTable({
    executionId: v.id("executions"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    timestamp: v.number(),
    nodeId: v.optional(v.string()),
  })
    .index("by_execution", ["executionId"]),

  // Templates table - pre-built agent templates
  templates: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.string(),
    nodes: v.array(nodeValidator),
    edges: v.array(edgeValidator),
    featured: v.boolean(),
    usageCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_featured", ["featured"]),
});
