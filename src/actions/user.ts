"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSession() {
    return await auth.api.getSession({
        headers: await headers(),
    });
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session?.user) return null;

    return await prisma.user.findUnique({
        where: { id: session.user.id },
    });
}

export async function getCurrentWorkspace() {
    const session = await getSession();
    if (!session?.user) return null;

    return await prisma.workspace.findFirst({
        where: { members: { some: { userId: session.user.id } } },
    });
}
