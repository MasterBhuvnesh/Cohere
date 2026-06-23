import { openai } from "@ai-sdk/openai";

/**
 * Central model configuration for the Vector AI agent (Track D).
 *
 * Model ids are current as of 2026-06-12 (sourced from the AI gateway model
 * list, `openai/` prefix stripped for direct @ai-sdk/openai usage).
 *
 * The OpenAI provider reads OPENAI_API_KEY lazily at request time, so these
 * module-level instances are safe to construct on deployments where the key
 * is not yet set — only actual LLM calls will fail.
 */
export const CHAT_MODEL_ID = "gpt-5.4-mini";

/** 1536 dimensions — matches the `by_embedding` vector index on `issues`. */
export const EMBEDDING_MODEL_ID = "text-embedding-3-small";

export const chatModel = openai.chat(CHAT_MODEL_ID);

export const embeddingModel = openai.embedding(EMBEDDING_MODEL_ID);

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export const AI_NOT_CONFIGURED_MESSAGE =
  "The AI agent is not configured yet: the OPENAI_API_KEY environment variable is missing on the Convex deployment.";

export function assertAiConfigured(): void {
  if (!isAiConfigured()) {
    throw new Error(AI_NOT_CONFIGURED_MESSAGE);
  }
}
