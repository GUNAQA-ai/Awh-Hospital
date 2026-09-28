import { z } from 'zod';

/**
 * Zod schemas for Auth endpoints.
 * Swagger: http://13.205.179.0:3000/api/docs#/Auth
 */

// POST /auth/login → { access_token, principal }
export const LoginResponseSchema = z.object({
  access_token: z.string(),
  principal: z.object({
    userId: z.string(),
    organizationId: z.string(),
    role: z.string(),
    username: z.string(),
    email: z.string(),
  }),
});

// GET /auth/state → { state: string }
export const AuthStateResponseSchema = z.object({
  state: z.string(),
}).passthrough();

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type AuthStateResponse = z.infer<typeof AuthStateResponseSchema>;
