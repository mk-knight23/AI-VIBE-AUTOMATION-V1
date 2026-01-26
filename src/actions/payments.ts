"use server";

import { polar } from "@/lib/polar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getSession() {
    // Admin bypass mode
    if (process.env.ADMIN_MODE === "true") {
        return {
            user: {
                id: "admin-bypass",
                email: "admin@admin.com",
                name: "Admin User",
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                image: null
            },
            session: {
                id: "session-bypass",
                expiresAt: new Date(Date.now() + 86400000),
                token: "admin-token",
                createdAt: new Date(),
                updatedAt: new Date(),
                ipAddress: "127.0.0.1",
                userAgent: "Admin Bypass",
                userId: "admin-bypass"
            }
        };
    }

    return await auth.api.getSession({
        headers: await headers(),
    });
}

export async function createCheckout(productId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    try {
        const checkout = await polar.checkouts.custom.create({
            productId: productId,
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pricing?success=true`,
            customerEmail: session.user.email,
            metadata: {
                userId: session.user.id,
            },
        });

        if (checkout.url) {
            return { url: checkout.url };
        }

        throw new Error("Failed to create checkout URL");
    } catch (error: any) {
        console.error("Polar checkout error:", error);
        throw new Error(error.message || "Failed to initialize payment");
    }
}
