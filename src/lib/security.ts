import crypto from "crypto";

/**
 * Timing-safe string comparison to prevent timing attacks
 * Use this for comparing sensitive values like tokens, passwords, etc.
 */
export function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    // Use crypto.timingSafeEqual if available (Node.js 6.6.0+)
    if (typeof crypto.timingSafeEqual === "function") {
        try {
            return crypto.timingSafeEqual(
                Buffer.from(a),
                Buffer.from(b)
            );
        } catch {
            return false;
        }
    }

    // Fallback for older Node.js versions
    // This is still vulnerable to some timing attacks but better than direct comparison
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

/**
 * Validate webhook token with timing-safe comparison
 */
export function validateWebhookToken(storedToken: string, providedToken: string): boolean {
    if (!storedToken || !providedToken) {
        return false;
    }
    return timingSafeEqual(storedToken, providedToken);
}
