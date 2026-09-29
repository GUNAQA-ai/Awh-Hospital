/**
 * @file HealthSchemas.ts
 * @description
 * Runtime Zod validation schemas and TypeScript type declarations for HMS Core and Orchestrator health check endpoints.
 * Validates service readiness responses returned by `GET /readiness` and `GET /api/v1/health/ready`.
 *
 * Responsibilities:
 * - Define Zod schema enforcing service readiness status contracts.
 * - Export inferred TypeScript types for health verification tests.
 *
 * Major Schemas:
 * - {@link ReadinessResponseSchema} - Validates `{ status: "ok" }` readiness payloads.
 *
 * Major Types:
 * - {@link ReadinessResponse} - Inferred TypeScript type for readiness responses.
 *
 * Dependencies:
 * - `zod`: TypeScript-first schema declaration and validation library.
 *
 * Assumptions:
 * - Microservice health endpoints respond with a JSON object containing a `status` field.
 *
 * Side Effects:
 * - None. Pure schema definitions.
 *
 * Usage Considerations:
 * - Use with {@link ResponseValidator.validateSchema} to assert readiness during deployment smoke tests.
 */

import { z } from 'zod';

/**
 * Zod schema validating the JSON response from `GET /readiness`.
 */
export const ReadinessResponseSchema = z.object({
  /** Operational status indicator string (typically "ok") */
  status: z.string(),
}).passthrough();

/** Inferred TypeScript type representing a validated readiness probe response. */
export type ReadinessResponse = z.infer<typeof ReadinessResponseSchema>;
