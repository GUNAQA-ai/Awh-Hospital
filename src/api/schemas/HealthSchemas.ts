import { z } from 'zod';

/**
 * Zod schemas for Health endpoints.
 * Swagger: http://13.205.179.0:3000/api/docs#/Health
 */

// GET /readiness → { status: "ok" }
export const ReadinessResponseSchema = z.object({
  status: z.string(),
}).passthrough();
