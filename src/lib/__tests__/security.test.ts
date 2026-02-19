import { describe, it, expect } from "@jest/globals";
import { timingSafeEqual, validateWebhookToken } from "../security";

describe("Security Utilities", () => {
    describe("timingSafeEqual", () => {
        it("should return true for identical strings", () => {
            const result = timingSafeEqual("hello-world", "hello-world");
            expect(result).toBe(true);
        });

        it("should return false for different strings", () => {
            const result = timingSafeEqual("hello-world", "hello-earth");
            expect(result).toBe(false);
        });

        it("should return false for strings of different lengths", () => {
            const result = timingSafeEqual("hello", "hello-world");
            expect(result).toBe(false);
        });

        it("should handle empty strings", () => {
            const result = timingSafeEqual("", "");
            expect(result).toBe(true);
        });

        it("should return false for one empty string", () => {
            const result = timingSafeEqual("", "not-empty");
            expect(result).toBe(false);
        });

        it("should handle special characters", () => {
            const result = timingSafeEqual("token-123!@#", "token-123!@#");
            expect(result).toBe(true);
        });
    });

    describe("validateWebhookToken", () => {
        it("should return true for matching tokens", () => {
            const storedToken = "abc123-token";
            const providedToken = "abc123-token";
            const result = validateWebhookToken(storedToken, providedToken);
            expect(result).toBe(true);
        });

        it("should return false for non-matching tokens", () => {
            const storedToken = "abc123-token";
            const providedToken = "wrong-token";
            const result = validateWebhookToken(storedToken, providedToken);
            expect(result).toBe(false);
        });

        it("should return false for empty stored token", () => {
            const result = validateWebhookToken("", "some-token");
            expect(result).toBe(false);
        });

        it("should return false for empty provided token", () => {
            const result = validateWebhookToken("stored-token", "");
            expect(result).toBe(false);
        });

        it("should return false for both empty tokens", () => {
            const result = validateWebhookToken("", "");
            expect(result).toBe(false);
        });

        it("should handle UUID-like tokens", () => {
            const storedToken = "550e8400-e29b-41d4-a716-446655440000";
            const providedToken = "550e8400-e29b-41d4-a716-446655440000";
            const result = validateWebhookToken(storedToken, providedToken);
            expect(result).toBe(true);
        });
    });
});
