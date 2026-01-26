"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
    return await auth.api.getSession({
        headers: await headers(),
    });
}

export async function listTemplates() {
    return await prisma.workflowTemplate.findMany({
        orderBy: { usageCount: "desc" },
    });
}

export async function cloneTemplate(templateId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const template = await prisma.workflowTemplate.findUnique({
        where: { id: templateId },
    });

    if (!template) throw new Error("Template not found");

    // Get or create a default workspace
    let workspace = await prisma.workspace.findFirst({
        where: { members: { some: { userId: session.user.id } } }
    });

    if (!workspace) {
        workspace = await prisma.workspace.create({
            data: {
                name: "My Workspace",
                slug: `workspace-${session.user.id.slice(0, 5)}`,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "OWNER"
                    }
                }
            }
        });
    }

    const workflow = await prisma.workflow.create({
        data: {
            name: `${template.name} (Clone)`,
            description: template.description,
            userId: session.user.id,
            workspaceId: workspace.id,
            nodes: template.nodes || [],
            edges: template.edges || [],
        }
    });

    await prisma.workflowTemplate.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/templates");

    return workflow;
}
