import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
    if (!webhookSecret) {
        return new Response("Webhook secret not configured", { status: 500 });
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "subscription.created" || eventType === "subscription.updated") {
        const subscription = evt.data;
        const userId = subscription.metadata?.userId;

        if (userId) {
            await prisma.workspace.updateMany({
                where: { members: { some: { userId } } },
                data: {
                    plan: "PRO",
                    usageLimit: 1000,
                },
            });
        }
    }

    if (eventType === "subscription.revoked") {
        const subscription = evt.data;
        const userId = subscription.custom_field_data?.userId;

        if (userId) {
            await prisma.workspace.updateMany({
                where: { members: { some: { userId } } },
                data: {
                    plan: "FREE",
                    usageLimit: 100,
                },
            });
        }
    }

    return new Response("", { status: 200 });
}
