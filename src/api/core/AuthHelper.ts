import { ApiClient } from './ApiClient';
import { logger } from '../../utils/logger';

/**
 * Utility: Centralized Authentication Helper.
 * Handles login via POST /auth/login on HMS Core API and caches the JWT token.
 * The same Bearer token is used for both HMS Core API (port 3000) and 
 * AWH AI Platform API (port 3001).
 * 
 * Swagger: http://13.205.179.0:3000/api/docs#/Auth/AuthController_login
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  principal: {
    userId: string;
    organizationId: string;
    role: string;
    username: string;
    email: string;
  };
}

export class AuthHelper {
  private static accessToken: string | null = null;
  private static principal: LoginResponse['principal'] | null = null;

  /**
   * Login and cache the access token. Returns cached token if already authenticated.
   * @param request - ApiClient instance
   * @param baseURL - HMS Core API base URL (e.g. http://13.205.179.0:3000)
   * @param credentials - Email and password
   */
  public static async login(
    request: ApiClient,
    baseURL: string,
    credentials?: AuthCredentials
  ): Promise<string> {
    // Return cached token if available
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
   * Returns the Authorization headers for authenticated API requests.
   */
  public static getAuthHeaders(): { Authorization: string } {
    if (!AuthHelper.accessToken) {
      throw new Error('Not authenticated. Call AuthHelper.login() first.');
    }
    return { Authorization: `Bearer ${AuthHelper.accessToken}` };
  }

  /**
   * Returns the cached access token.
   */
  public static getToken(): string | null {
    return AuthHelper.accessToken;
  }

  /**
   * Returns the principal (user info) from the login response.
   */
  public static getPrincipal(): LoginResponse['principal'] | null {
    return AuthHelper.principal;
  }

  /**
   * Clears cached authentication state.
   */
  public static clearAuth(): void {
    AuthHelper.accessToken = null;
    AuthHelper.principal = null;
    logger.info('🔓 Authentication cache cleared.');
  }
}
