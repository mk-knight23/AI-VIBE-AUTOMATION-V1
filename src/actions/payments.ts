"use server";

import { polar } from "@/lib/polar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getSession() {
  // Security: Admin bypass removed - always require proper authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized: Valid session required");
  }

  return session;
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
