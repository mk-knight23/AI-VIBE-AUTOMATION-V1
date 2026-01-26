"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
    return await auth.api.getSession({
        headers: await headers(),
    });
}

async function getWorkspaceId() {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const workspace = await prisma.workspace.findFirst({
        where: { members: { some: { userId: session.user.id } } }
    });

    if (!workspace) throw new Error("No workspace found");
    return { userId: session.user.id, workspaceId: workspace.id };
}

// Supported credential types
export const CREDENTIAL_TYPES = {
    openai: { name: "OpenAI", fields: ["apiKey"] },
    anthropic: { name: "Anthropic", fields: ["apiKey"] },
    google: { name: "Google AI", fields: ["apiKey"] },
    slack: { name: "Slack", fields: ["botToken"] },
    discord: { name: "Discord", fields: ["botToken"] },
    stripe: { name: "Stripe", fields: ["secretKey"] },
    custom: { name: "Custom API", fields: ["value"] },
} as const;

export type CredentialType = keyof typeof CREDENTIAL_TYPES;

/**
 * List all credentials (without decrypted values)
 */
export async function listCredentials() {
    const { userId, workspaceId } = await getWorkspaceId();

    return await prisma.credential.findMany({
        where: { workspaceId, userId },
        select: {
            id: true,
            name: true,
            type: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { name: "asc" },
    });
}

/**
 * Create a new encrypted credential
 */
export async function createCredential(
    name: string,
    type: CredentialType,
    value: string
) {
    const { userId, workspaceId } = await getWorkspaceId();

    // Check for duplicate name
    const existing = await prisma.credential.findUnique({
        where: { workspaceId_name: { workspaceId, name } }
    });
    if (existing) {
        throw new Error(`Credential "${name}" already exists`);
    }

    // Encrypt the value
    const { encrypted, iv } = encrypt(value);

    const credential = await prisma.credential.create({
        data: {
            name,
            type,
            encrypted,
            iv,
            userId,
            workspaceId,
        },
        select: {
            id: true,
            name: true,
            type: true,
        }
    });

    revalidatePath("/dashboard/settings");
    return credential;
}

/**
 * Update credential value (re-encrypts)
 */
export async function updateCredential(id: string, value: string) {
    const { userId, workspaceId } = await getWorkspaceId();

    // Verify ownership
    const existing = await prisma.credential.findFirst({
        where: { id, userId, workspaceId }
    });
    if (!existing) throw new Error("Credential not found");

    // Re-encrypt with new value
    const { encrypted, iv } = encrypt(value);

    const credential = await prisma.credential.update({
        where: { id },
        data: { encrypted, iv, updatedAt: new Date() },
        select: { id: true, name: true }
    });

    revalidatePath("/dashboard/settings");
    return credential;
}

/**
 * Delete a credential
 */
export async function deleteCredential(id: string) {
    const { userId, workspaceId } = await getWorkspaceId();

    await prisma.credential.deleteMany({
        where: { id, userId, workspaceId }
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
}

/**
 * Get decrypted credential value (for internal executor use only)
 * This should NEVER be exposed to client directly
 */
export async function getDecryptedCredential(id: string): Promise<string | null> {
    const { userId, workspaceId } = await getWorkspaceId();

    const credential = await prisma.credential.findFirst({
        where: { id, userId, workspaceId }
    });

    if (!credential) return null;

    try {
        return decrypt(credential.encrypted, credential.iv);
    } catch (error) {
        console.error("Failed to decrypt credential:", error);
        return null;
    }
}

/**
 * Get credential by name for use in workflow execution
 */
export async function getCredentialByName(name: string): Promise<string | null> {
    const { userId, workspaceId } = await getWorkspaceId();

    const credential = await prisma.credential.findUnique({
        where: { workspaceId_name: { workspaceId, name } }
    });

    if (!credential || credential.userId !== userId) return null;

    try {
        return decrypt(credential.encrypted, credential.iv);
    } catch (error) {
        console.error("Failed to decrypt credential:", error);
        return null;
    }
}
