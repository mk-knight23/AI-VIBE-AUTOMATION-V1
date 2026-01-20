import arcjet, { tokenBucket, detectBot, shield } from "@arcjet/next";

// Rate limit configuration for different tiers
export const rateLimitConfig = {
    free: {
        requestsPerMinute: 10,
        tokensPerDay: 10000,
    },
    pro: {
        requestsPerMinute: 100,
        tokensPerDay: 100000,
    },
    enterprise: {
        requestsPerMinute: 1000,
        tokensPerDay: 1000000,
    },
};

// Helper to get rate limit for a tier
export function getRateLimitForTier(tier: "free" | "pro" | "enterprise") {
    return rateLimitConfig[tier];
}

// Check if Arcjet is configured
const isArcjetConfigured = !!process.env.ARCJET_KEY;

// Initialize Arcjet with security rules (only if key is configured)
const aj = isArcjetConfigured
    ? arcjet({
        key: process.env.ARCJET_KEY!,
        characteristics: ["ip.src"],
        rules: [
            // Protect against common attacks
            shield({
                mode: "LIVE",
            }),
            // Detect and block bots
            detectBot({
                mode: "LIVE",
                allow: [], // Deny all bots
            }),
            // Rate limiting for API requests
            tokenBucket({
                mode: "LIVE",
                refillRate: 10,
                interval: 60, // 10 requests per minute
                capacity: 50,
            }),
        ],
    })
    : null;

// Stricter rate limiting for AI execution
export const ajExecute = isArcjetConfigured
    ? arcjet({
        key: process.env.ARCJET_KEY!,
        characteristics: ["ip.src"],
        rules: [
            shield({ mode: "LIVE" }),
            detectBot({ mode: "LIVE", allow: [] }),
            // Stricter limits for AI execution (expensive operations)
            tokenBucket({
                mode: "LIVE",
                refillRate: 5,
                interval: 60, // 5 requests per minute
                capacity: 20,
            }),
        ],
    })
    : null;

// Light rate limiting for read operations
export const ajRead = isArcjetConfigured
    ? arcjet({
        key: process.env.ARCJET_KEY!,
        characteristics: ["ip.src"],
        rules: [
            shield({ mode: "LIVE" }),
            // More generous for read operations
            tokenBucket({
                mode: "LIVE",
                refillRate: 100,
                interval: 60,
                capacity: 200,
            }),
        ],
    })
    : null;

export default aj;
