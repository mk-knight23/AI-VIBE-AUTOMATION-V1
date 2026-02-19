import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest/client";
import { validateWebhookToken } from "@/lib/security";
import { z } from "zod";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ workflowId: string }>;
}

// Input validation schema for webhook payload
const WebhookPayloadSchema = z
  .object({
    // Allow any additional properties
  })
  .passthrough();

/**
 * Webhook Trigger API
 *
 * External services can trigger workflow executions via POST requests.
 * Authentication is done via the webhook token in query or Authorization header.
 *
 * Security: Uses timing-safe token comparison to prevent timing attacks.
 *
 * Usage:
 *   POST /api/webhook/[workflowId]?token=xxx
 *   OR
 *   POST /api/webhook/[workflowId] with Authorization: Bearer xxx
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { workflowId } = await params;

    // Validate workflowId format (CUID)
    if (!/^[a-z0-9]{25}$/.test(workflowId)) {
      return NextResponse.json(
        { error: "Invalid workflow ID format" },
        { status: 400 },
      );
    }

    // Get token from query or Authorization header
    const url = new URL(req.url);
    const queryToken = url.searchParams.get("token");
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const token = queryToken || bearerToken;

    if (!token || token.length === 0) {
      return NextResponse.json(
        { error: "Missing authentication token" },
        { status: 401 },
      );
    }

    // Find workflow by ID and verify token
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        name: true,
        webhookToken: true,
        webhookEnabled: true,
        userId: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 },
      );
    }

    // Verify webhook is enabled
    if (!workflow.webhookEnabled) {
      return NextResponse.json(
        { error: "Webhook is not enabled for this workflow" },
        { status: 403 },
      );
    }

    // Verify token matches using timing-safe comparison
    if (!validateWebhookToken(workflow.webhookToken, token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse and validate request body (optional payload)
    let payload: Record<string, any> = {};
    try {
      const body = await req.text();
      if (body) {
        const parsed = JSON.parse(body);
        // Validate payload structure
        payload = WebhookPayloadSchema.parse(parsed);
      }
    } catch {
      // Empty or invalid JSON body is okay, use empty object
    }

    // Trigger workflow execution via Inngest
    const { ids } = await inngest.send({
      name: "workflow/execute",
      data: {
        workflowId: workflow.id,
        trigger: "webhook",
        initialData: {
          webhook: {
            payload,
            timestamp: new Date().toISOString(),
            headers: Object.fromEntries(req.headers.entries()),
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Workflow "${workflow.name}" triggered`,
      eventId: ids[0],
    });
  } catch (error) {
    console.error("Webhook trigger error:", error);
    return NextResponse.json(
      { error: "Failed to trigger workflow" },
      { status: 500 },
    );
  }
}

// Also support GET for testing/verification
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { workflowId } = await params;

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: {
      id: true,
      name: true,
      webhookEnabled: true,
    },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json({
    workflowId: workflow.id,
    name: workflow.name,
    webhookEnabled: workflow.webhookEnabled,
    message: workflow.webhookEnabled
      ? "Webhook is active. Send POST with token to trigger."
      : "Webhook is not enabled for this workflow.",
  });
}
