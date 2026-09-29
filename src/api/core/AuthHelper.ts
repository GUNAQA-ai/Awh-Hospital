/**
 * @file AuthHelper.ts
 * @description
 * Centralized authentication and token management utility for HMS Core and AWH AI Platform APIs.
 * Handles user authentication via the `/auth/login` endpoint, caches the retrieved JSON Web Token (JWT),
 * and provides standardized Authorization headers for downstream protected API requests.
 *
 * Responsibilities:
 * - Dispatch login requests to the HMS Core API (`POST /auth/login`).
 * - Cache JWT access tokens in-memory across the test execution lifecycle.
 * - Store and expose authenticated user principal metadata (userId, organizationId, role, username, email).
 * - Generate standard `Bearer <token>` authorization headers.
 * - Reset and clear authentication state between test suites or tenant switches.
 *
 * Major Classes:
 * - {@link AuthHelper} - Static helper class managing JWT authentication state.
 *
 * Major Interfaces:
 * - {@link AuthCredentials} - Username/email and password credential payload.
 * - {@link LoginResponse} - Shape of the HMS Core authentication response containing token and principal info.
 *
 * Dependencies:
 * - `./ApiClient`: Framework HTTP client wrapper.
 * - `../../utils/logger`: Framework Winston logger.
 *
 * Assumptions:
 * - The HMS Core API service is operational and exposes `POST /auth/login`.
 * - Environment variables `API_EMAIL` and `API_PASSWORD` provide valid default service credentials when explicit credentials are omitted.
 *
 * Side Effects:
 * - Issues HTTP POST request over the network.
 * - Modifies static in-memory state (`AuthHelper.accessToken`, `AuthHelper.principal`).
 *
 * Usage Considerations:
 * - Never log or expose raw passwords in error messages or logs.
 * - Call `AuthHelper.login()` during beforeAll hooks or endpoint initialization before dispatching authenticated calls.
 */

import { ApiClient } from './ApiClient';
import { logger } from '../../utils/logger';

/**
 * Authentication credentials structure submitted during user login.
 *
 * @interface AuthCredentials
 */
export interface AuthCredentials {
  /**
   * The registered user or service email address.
   * Example: "admin@awh.com"
   */
  email: string;

  /**
   * The account password.
   */
  password: string;
}

/**
 * Authentication response payload returned by the HMS Core API `/auth/login` endpoint.
 *
 * @interface LoginResponse
 */
export interface LoginResponse {
  /**
   * Signed JSON Web Token (JWT) authorizing subsequent requests.
   */
  access_token: string;

  /**
   * User account profile and organizational role claims.
   */
  principal: {
    /** Unique user identifier string */
    userId: string;
    /** Organization or hospital tenant ID */
    organizationId: string;
    /** Role assigned in the system (e.g. "SUPER_ADMIN", "ADMIN", "DOCTOR") */
    role: string;
    /** Username handle */
    username: string;
    /** User's registered email address */
    email: string;
  };
}

/**
 * Centralized static Authentication Helper.
 * Handles login via POST /auth/login on HMS Core API and caches the JWT token.
 * The Bearer token is shared across both HMS Core API and AWH AI Platform API.
 *
 * @class AuthHelper
 */
export class AuthHelper {
  /** In-memory cached JWT access token */
  private static accessToken: string | null = null;

  /** In-memory cached user principal metadata */
  private static principal: LoginResponse['principal'] | null = null;

  /**
   * Authenticates against the HMS Core API and caches the resulting JWT token.
   * If an access token is already cached, returns the cached token immediately without re-authenticating.
   *
   * @param {ApiClient} request
   *        Required.
   *        The active ApiClient instance used to dispatch the login request.
   * @param {string} baseURL
   *        Required.
   *        Base URL of the HMS Core API service.
   *        Example: "http://13.205.179.0:3000"
   * @param {AuthCredentials} [credentials]
   *        Optional.
   *        Email and password credentials. If omitted, values from `process.env.API_EMAIL`
   *        and `process.env.API_PASSWORD` are utilized.
   * @returns {Promise<string>}
   *          The valid JWT access token string.
   * @throws {Error}
   *         Thrown if the authentication endpoint returns an HTTP status other than 200 or 201.
   *
   * @example
   * const token = await AuthHelper.login(apiClient, 'http://13.205.179.0:3000');
   */
  public static async login(
    request: ApiClient,
    baseURL: string,
    credentials?: AuthCredentials
  ): Promise<string> {
    // Return cached token if already authenticated
    if (AuthHelper.accessToken) {
      logger.info('🔑 Using cached access token.');
      return AuthHelper.accessToken;
    }

    const email = credentials?.email || process.env.API_EMAIL || '';
    const password = credentials?.password || process.env.API_PASSWORD || '';

    logger.info(`🔐 Authenticating as: ${email}`);

    const response = await request.post(`${baseURL}/auth/login`, {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status() !== 201 && response.status() !== 200) {
      const body = await response.text();
      throw new Error(`Authentication failed (${response.status()}): ${body}`);
    }

    const body: LoginResponse = await response.json();
    AuthHelper.accessToken = body.access_token;
    AuthHelper.principal = body.principal;

    logger.info(`✅ Authenticated successfully. Role: ${body.principal.role}, User: ${body.principal.username}`);
    return AuthHelper.accessToken;
  }

  /**
   * Returns the Authorization header object containing the active Bearer token.
   *
   * @returns {{ Authorization: string }}
   *          Object with header `{ Authorization: "Bearer <token>" }`.
   * @throws {Error}
   *         Thrown if called before `AuthHelper.login()` has successfully executed.
   *
   * @example
   * const headers = AuthHelper.getAuthHeaders();
   */
  public static getAuthHeaders(): { Authorization: string } {
    if (!AuthHelper.accessToken) {
      throw new Error('Not authenticated. Call AuthHelper.login() first.');
    }
    return { Authorization: `Bearer ${AuthHelper.accessToken}` };
  }

  /**
   * Returns the currently cached access token string, or null if unauthenticated.
   *
   * @returns {string | null}
   *          JWT access token or null.
   */
  public static getToken(): string | null {
    return AuthHelper.accessToken;
  }

  /**
   * Returns the cached user principal metadata from the login response, or null if unauthenticated.
   *
   * @returns {LoginResponse['principal'] | null}
   *          The authenticated user principal object.
   */
  public static getPrincipal(): LoginResponse['principal'] | null {
    return AuthHelper.principal;
  }

  /**
   * Clears all cached authentication credentials and tokens from memory.
   *
   * @returns {void}
   */
  public static clearAuth(): void {
    AuthHelper.accessToken = null;
    AuthHelper.principal = null;
    logger.info('🔓 Authentication cache cleared.');
  }
}
