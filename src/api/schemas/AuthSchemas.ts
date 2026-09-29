/**
 * @file AuthSchemas.ts
 * @description
 * Runtime Zod validation schemas and TypeScript type declarations for HMS Core authentication endpoints.
 * Enforces JSON response payload contracts for login (`POST /auth/login`) and auth state (`GET /auth/state`).
 *
 * Responsibilities:
 * - Define Zod schema validating JWT token and user principal structure.
 * - Define Zod schema validating authentication state endpoints.
 * - Export TypeScript types inferred from the validation schemas.
 *
 * Major Schemas:
 * - {@link LoginResponseSchema} - Validates the access token and user principal returned upon login.
 * - {@link AuthStateResponseSchema} - Validates auth state string responses.
 *
 * Major Types:
 * - {@link LoginResponse} - Inferred TypeScript type for login responses.
 * - {@link AuthStateResponse} - Inferred TypeScript type for auth state responses.
 *
 * Dependencies:
 * - `zod`: TypeScript-first schema declaration and validation library.
 *
 * Assumptions:
 * - Responses conform to the HMS Core OpenAPI specification at `http://13.205.179.0:3000/api/docs#/Auth`.
 *
 * Side Effects:
 * - None. Pure schema definitions.
 *
 * Usage Considerations:
 * - Use with {@link ResponseValidator.validateSchema} to assert API response body contracts.
 */

import { z } from 'zod';

/**
 * Zod schema validating the JSON response from `POST /auth/login`.
 * Enforces presence of the JWT `access_token` and nested `principal` claims.
 */
export const LoginResponseSchema = z.object({
  /** Signed JSON Web Token string */
  access_token: z.string(),
  /** Authenticated user identity and permission context */
  principal: z.object({
    /** Unique user identifier */
    userId: z.string(),
    /** Hospital or organization tenant identifier */
    organizationId: z.string(),
    /** System authorization role name */
    role: z.string(),
    /** User handle */
    username: z.string(),
    /** User contact email address */
    email: z.string(),
  }),
});

/**
 * Zod schema validating the JSON response from `GET /auth/state`.
 */
export const AuthStateResponseSchema = z.object({
  /** Active state string (e.g. "authenticated", "anonymous") */
  state: z.string(),
}).passthrough();

/** Inferred TypeScript type representing a validated login response payload. */
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/** Inferred TypeScript type representing a validated auth state response payload. */
export type AuthStateResponse = z.infer<typeof AuthStateResponseSchema>;
