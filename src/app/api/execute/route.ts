import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { getAIModel, AIProvider } from "@/lib/ai/providers";
import { ajExecute } from "@/lib/arcjet";

export const runtime = "nodejs"; // Prisma doesn't support Edge runtime easily without Accelerate

export async function POST(req: NextRequest) {
    try {
        // Apply Arcjet rate limiting if configured
        if (ajExecute) {
            const decision = await ajExecute.protect(req, { requested: 1 });

            if (decision.isDenied()) {
                if (decision.reason.isRateLimit()) {
                    return NextResponse.json(
                        { error: "Rate limit exceeded. Please try again later." },
                        { status: 429 }
                    );
                }
                if (decision.reason.isBot()) {
                    return NextResponse.json(
                        { error: "Bot detected" },
                        { status: 403 }
                    );
                }
                return NextResponse.json(
                    { error: "Request blocked" },
                    { status: 403 }
                );
            }
        }

        const { workflowId, message } = await req.json();

        if (!workflowId || !message) {
            return NextResponse.json(
                { error: "Missing workflowId or message" },
                { status: 400 }
            );
        }

        // Get the workflow
        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId },
        });

        if (!workflow) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }

        const nodes = workflow.nodes as any[];

        // Find the AI node in the workflow
        const aiNode = nodes.find((node: any) => node.type === "ai");

        if (!aiNode) {
            return NextResponse.json(
                { error: "No AI node found in workflow" },
                { status: 400 }
            );
        }

        // Get AI configuration from the node
        const provider = (aiNode.data.provider as AIProvider) || "google"; // Default to google since we set up Gemini
        const model = (aiNode.data.model as string) || "gemini-1.5-flash";
        const systemPrompt =
            (aiNode.data.systemPrompt as string) ||
            "You are a helpful AI assistant.";
        const temperature = (aiNode.data.temperature as number) || 0.7;

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
            { status: 500 }
        );
    }
}
