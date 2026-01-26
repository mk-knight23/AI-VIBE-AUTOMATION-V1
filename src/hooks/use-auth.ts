"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

// Mock session for admin mode
const ADMIN_SESSION = {
    data: {
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
    },
    isPending: false,
    error: null,
    isRefetching: false,
    refetch: async () => { }, // Mock refetch function
};

export function useAuth() {
    // Check if we're in admin mode via public env var
    // Note: We need to expose this via NEXT_PUBLIC_ for client side
    const isAdminMode = process.env.NEXT_PUBLIC_ADMIN_MODE === "true";

    const session = authClient.useSession();
    const [adminSession, setAdminSession] = useState<typeof session>(session);

    useEffect(() => {
        if (isAdminMode) {
            setAdminSession(ADMIN_SESSION);
        } else {
            setAdminSession(session);
        }
    }, [isAdminMode, session]);

    return isAdminMode ? ADMIN_SESSION : session;
}
