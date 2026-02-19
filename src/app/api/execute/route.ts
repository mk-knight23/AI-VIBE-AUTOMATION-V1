import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { getAIModel, AIProvider } from "@/lib/ai/providers";
import { ajExecute } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs"; // Prisma doesn't support Edge runtime easily without Accelerate

// Input validation schema
const ExecuteRequestSchema = z.object({
  workflowId: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9_-]+$/, "Invalid workflow ID format"),
  message: z.string().min(1).max(10000).trim(),
});

export async function POST(req: NextRequest) {
  try {
    // Apply Arcjet rate limiting if configured
    if (ajExecute) {
      const decision = await ajExecute.protect(req, { requested: 1 });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Please try again later." },
            { status: 429 },
          );
        }
        if (decision.reason.isBot()) {
          return NextResponse.json({ error: "Bot detected" }, { status: 403 });
        }
        return NextResponse.json({ error: "Request blocked" }, { status: 403 });
      }
    }

    // Get session for authorization
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = ExecuteRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { workflowId, message } = validationResult.data;

    // Get the workflow with authorization check
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        userId: true,
        nodes: true,
        isActive: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 },
      );
    }

    // Authorization check: user must own the workflow
    if (workflow.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this workflow" },
        { status: 403 },
      );
    }

    // Check if workflow is active
    if (!workflow.isActive) {
      return NextResponse.json(
        { error: "Workflow is not active" },
        { status: 400 },
      );
    }

    const nodes = workflow.nodes as any[];

    // Find the AI node in the workflow
    const aiNode = nodes.find((node: any) => node.type === "ai");

    if (!aiNode) {
      return NextResponse.json(
        { error: "No AI node found in workflow" },
        { status: 400 },
      );
    }

    // Get AI configuration from the node
    const provider = (aiNode.data.provider as AIProvider) || "google";
    const model = (aiNode.data.model as string) || "gemini-1.5-flash";
    const systemPrompt =
      (aiNode.data.systemPrompt as string) || "You are a helpful AI assistant.";
    const temperature = (aiNode.data.temperature as number) || 0.7;

    // Validate temperature range
    if (temperature < 0 || temperature > 2) {
      return NextResponse.json(
        { error: "Invalid temperature value" },
        { status: 400 },
      );
    }

    // Create the AI model instance
    const aiModel = getAIModel(provider, model);

    // Stream the response
    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
      temperature,
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Workflow execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute workflow" },
      { status: 500 },
    );
  }
}
