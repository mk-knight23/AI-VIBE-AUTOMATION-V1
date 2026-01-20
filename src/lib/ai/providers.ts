import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

// AI Provider types
export type AIProvider = "openai" | "anthropic" | "google";

// Model configurations per provider
export const providerModels: Record<AIProvider, string[]> = {
    openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    anthropic: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    google: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"],
};

// Get the AI model instance based on provider and model name
export function getAIModel(provider: AIProvider, modelName: string) {
    switch (provider) {
        case "openai":
            return openai(modelName);
        case "anthropic":
            return anthropic(modelName);
        case "google":
            return google(modelName);
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}

// Default model configurations
export const defaultModelConfig = {
    provider: "openai" as AIProvider,
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 2048,
};

// Token cost estimates (approximate, per 1K tokens)
export const tokenCosts: Record<AIProvider, Record<string, { input: number; output: number }>> = {
    openai: {
        "gpt-4o": { input: 0.0025, output: 0.01 },
        "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
        "gpt-4-turbo": { input: 0.01, output: 0.03 },
        "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
    },
    anthropic: {
        "claude-3-5-sonnet-20241022": { input: 0.003, output: 0.015 },
        "claude-3-5-haiku-20241022": { input: 0.001, output: 0.005 },
        "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
    },
    google: {
        "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
        "gemini-1.5-flash": { input: 0.000075, output: 0.0003 },
        "gemini-2.0-flash-exp": { input: 0.0001, output: 0.0004 },
    },
};
