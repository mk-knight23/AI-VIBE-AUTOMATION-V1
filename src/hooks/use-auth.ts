"use client";

import { authClient } from "@/lib/auth-client";

/**
 * Authentication hook
 * Security: Admin bypass removed - always requires proper authentication
 */
export function useAuth() {
  // Always use real authentication - no bypass mode
  const session = authClient.useSession();

  return session;
}
