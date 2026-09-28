import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { LoginResponseSchema, AuthStateResponseSchema } from '../../../api/schemas/AuthSchemas';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/**
 * HMS Core API — Auth Endpoints
 * Swagger: http://13.205.179.0:3000/api/docs#/Auth
 */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Auth', () => {

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Authentication');
    AuthHelper.clearAuth();
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Auth/AuthController_generateState
  test('TC-API-AUTH-001 GET /auth/state — Verify CSRF state token generation', async ({ apiClient }) => {
    allure.story('CSRF State Token');
    allure.severity('critical');

    await test.step('Step 1: Send GET request to /auth/state', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.AUTH_STATE}`);

      await test.step('Step 2: Verify response status is 200', async () => {
        ResponseValidator.validateStatusCode(response, 200);
      });

      await test.step('Step 3: Verify response contains state string', async () => {
        const parsed = await ResponseValidator.validateSchema(response, AuthStateResponseSchema);
        expect(parsed.state).toBeTruthy();
        expect(typeof parsed.state).toBe('string');
      });
    });
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Auth/AuthController_login
  test('TC-API-AUTH-002 POST /auth/login — Verify successful login returns access_token and principal', async ({ apiClient }) => {
    allure.story('Login');
    allure.severity('blocker');

    await test.step('Step 1: Send POST /auth/login with valid credentials', async () => {
      const response = await apiClient.post(`${BASE_URL}${HMS.AUTH_LOGIN}`, {
        data: {
          email: process.env.API_EMAIL || 'ananta.sai@tekisho.ai',
          password: process.env.API_PASSWORD || 'Admin@1234',
        },
      });

      await test.step('Step 2: Verify response status is 201', async () => {
        ResponseValidator.validateStatusCode(response, 201);
      });

      await test.step('Step 3: Validate response schema (access_token + principal)', async () => {
        const parsed = await ResponseValidator.validateSchema(response, LoginResponseSchema);
        expect(parsed.access_token).toBeTruthy();
        expect(parsed.principal.userId).toBeTruthy();
        expect(parsed.principal.role).toBeTruthy();
        expect(parsed.principal.email).toContain('@');
      });
    });
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Auth/AuthController_login
  test('TC-API-AUTH-003 POST /auth/login — Verify login with invalid credentials returns 401', async ({ apiClient }) => {
    allure.story('Login - Negative');
    allure.severity('critical');

    await test.step('Step 1: Send POST /auth/login with wrong password', async () => {
      const response = await apiClient.post(`${BASE_URL}${HMS.AUTH_LOGIN}`, {
        data: {
          email: 'ananta.sai@tekisho.ai',
          password: 'WrongPassword123',
        },
      });

      await test.step('Step 2: Verify response status is 401 (Unauthorized)', async () => {
        ResponseValidator.validateStatusCode(response, 401);
      });
    });
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Auth/AuthController_login
  test('TC-API-AUTH-004 POST /auth/login — Verify login with missing fields returns 400', async ({ apiClient }) => {
    allure.story('Login - Validation');
    allure.severity('normal');

    await test.step('Step 1: Send POST /auth/login with empty body', async () => {
      const response = await apiClient.post(`${BASE_URL}${HMS.AUTH_LOGIN}`, {
        data: {},
      });

      await test.step('Step 2: Verify response status is 400 (Bad Request)', async () => {
        expect(response.status()).toBeGreaterThanOrEqual(400);
        expect(response.status()).toBeLessThan(500);
      });
    });
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Auth/AuthController_forgotPassword
  test('TC-API-AUTH-005 POST /auth/forgot-password — Verify returns 200 (no email enumeration)', async ({ apiClient }) => {
    allure.story('Forgot Password');
    allure.severity('normal');

    await test.step('Step 1: Send POST /auth/forgot-password with valid email', async () => {
      const response = await apiClient.post(`${BASE_URL}${HMS.AUTH_FORGOT_PASSWORD}`, {
        data: { email: 'ananta.sai@tekisho.ai' },
      });

      await test.step('Step 2: Verify response status is 200 (always 200 to prevent enumeration)', async () => {
        ResponseValidator.validateStatusCode(response, 200);
      });
    });
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Auth/AuthController_login
  test('TC-API-AUTH-006 POST /auth/login — Verify AuthHelper caches token correctly', async ({ apiClient }) => {
    allure.story('AuthHelper Integration');
    allure.severity('critical');

    await test.step('Step 1: Login via AuthHelper', async () => {
      const token = await AuthHelper.login(apiClient, BASE_URL);
      expect(token).toBeTruthy();
    });

    await test.step('Step 2: Verify cached token matches', async () => {
      const cachedToken = AuthHelper.getToken();
      expect(cachedToken).toBeTruthy();
    });

    await test.step('Step 3: Verify principal data is populated', async () => {
      const principal = AuthHelper.getPrincipal();
      expect(principal).not.toBeNull();
      expect(principal!.role).toBeTruthy();
    });

    await test.step('Step 4: Verify getAuthHeaders returns valid header', async () => {
      const headers = AuthHelper.getAuthHeaders();
      expect(headers.Authorization).toContain('Bearer ');
    });
  });
});



