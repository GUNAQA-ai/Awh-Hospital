/**
 * @file ChatSchemas.ts
 * @description
 * Runtime Zod validation schemas and TypeScript type declarations for AWH AI Platform Chat endpoints.
 * Validates conversational responses returned by `POST /api/v1/ai/chat`.
 *
 * Responsibilities:
 * - Define Zod schema enforcing the contract for AI conversational replies, workflow IDs, and conversation IDs.
 * - Export inferred TypeScript types for downstream API test suites.
 *
 * Major Schemas:
 * - {@link ChatResponseSchema} - Validates chat responses from the Orchestration Service.
 *
 * Major Types:
 * - {@link ChatResponse} - Inferred TypeScript type for chat responses.
 *
 * Dependencies:
 * - `zod`: TypeScript-first schema declaration and validation library.
 *
 * Assumptions:
 * - Responses conform to the Orchestrator OpenAPI specification at `http://13.205.179.0:3001/api/docs#/AI%20Chat`.
 *
 * Side Effects:
 * - None. Pure schema definitions.
 *
 * Usage Considerations:
 * - Use with {@link ResponseValidator.validateSchema} to assert AI chat endpoint responses.
 */

import { z } from 'zod';

/**
 * Zod schema validating the JSON response from `POST /api/v1/ai/chat`.
 * Conforms to ChatResponseDto from the Orchestrator API.
 */
export const ChatResponseSchema = z.object({
  /** AI agent's textual response message */
  reply: z.string(),
  /** Optional interactive form payload if the agent requests structured user input */
  form: z.object({}).passthrough().nullable(),
  /** Unique ID of the underlying workflow execution */
  workflowId: z.string(),
  /** Unique ID of the conversation thread */
  conversationId: z.string(),
});

/** Inferred TypeScript type representing a validated AI chat response payload. */
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
