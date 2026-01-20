import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { getAIModel, AIProvider } from "@/lib/ai/providers";
import { ajExecute } from "@/lib/arcjet";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const runtime = "edge";

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

        const { agentId, message } = await req.json();

        if (!agentId || !message) {
            return NextResponse.json(
                { error: "Missing agentId or message" },
                { status: 400 }
            );
        }

        // Get the agent
        const agent = await convex.query(api.agents.getById, {
            agentId: agentId as Id<"agents">,
        });

        if (!agent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Find the AI node in the workflow
        const aiNode = agent.nodes.find((node: any) => node.type === "ai");

        if (!aiNode) {
            return NextResponse.json(
                { error: "No AI node found in agent workflow" },
                { status: 400 }
            );
        }

        // Get AI configuration from the node
        const provider = (aiNode.data.provider as AIProvider) || "openai";
        const model = (aiNode.data.model as string) || "gpt-4o-mini";
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
        console.error("Agent execution error:", error);
        return NextResponse.json(
            { error: "Failed to execute agent" },
            { status: 500 }
        );
    }
}
