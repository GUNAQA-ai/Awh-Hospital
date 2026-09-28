import { z } from 'zod';

/**
 * Zod schemas for AI Chat (Orchestration API).
 * Swagger: http://13.205.179.0:3001/api/docs#/AI%20Chat
 */

// POST /api/v1/ai/chat → ChatResponseDto
export const ChatResponseSchema = z.object({
  reply: z.string(),
  form: z.object({}).passthrough().nullable(),
  workflowId: z.string(),
  conversationId: z.string(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
