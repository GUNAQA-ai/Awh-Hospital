/**
 * @file 04-permissions.spec.ts
 * @description
 * Automated API test suite verifying system and user permission endpoints in the HMS Core API service.
 * Validates querying the global permissions catalog and retrieving granted permissions for an authenticated user.
 *
 * Test Suite Scope:
 * - TC-API-PERM-001: Query system-wide permissions catalog (`GET /api/v1/permissions`).
 * - TC-API-PERM-002: Retrieve permission sets assigned to a specific user principal (`GET /api/v1/permissions/users/{userId}`).
 *
 * Preconditions:
 * - HMS Core API service running and accessible on port 3000.
 * - Authenticated session initialized via `AuthHelper.login()` in `beforeAll`.
 *
 * Test Data:
 * - Authenticated user principal ID extracted dynamically from `AuthHelper.getPrincipal()`.
 *
 * Required Environment:
 * - Configured via `API_BASE_URL` (default: `http://13.205.179.0:3000`).
 *
 * Steps / Flow:
 * 1. Log in during beforeAll hook.
 * 2. Send GET request with Authorization header.
 * 3. Validate status code 200 OK and array response payload.
 *
 * Cleanup Requirements:
 * - None. Read-only query endpoints.
 *
 * Dependencies:
 * - `ApiClient`, `AuthHelper`, `HMS`, `ResponseValidator`
 *
 * Tags:
 * - `@api`, `@rbac`, `@permissions`, `@security`
 */

import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/** Base URL for the HMS Core API service */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Permissions', () => {

  test.beforeAll(async ({ apiClient }) => {
    await AuthHelper.login(apiClient, BASE_URL);
  });

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Permissions');
  });

  /**
   * TC-API-PERM-001: Lists all system permissions defined in the platform catalog.
   */
  test('TC-API-PERM-001 GET /api/v1/permissions — List all system permissions', async ({ apiClient }) => {
    allure.story('List Permissions');
    allure.severity('critical');

    await test.step('Step 1: Send GET /api/v1/permissions', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.PERMISSIONS}`, {
        headers: AuthHelper.getAuthHeaders(),
      });

      await test.step('Step 2: Verify status 200 and response is array', async () => {
        ResponseValidator.validateStatusCode(response, 200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
      });
    });
  });

  /**
   * TC-API-PERM-002: Retrieves permissions granted to the currently logged in user principal.
   */
  test('TC-API-PERM-002 GET /api/v1/permissions/users/{userId} — List user permissions', async ({ apiClient }) => {
    allure.story('User Permissions');
    allure.severity('normal');

    await test.step('Step 1: Get user ID from principal', async () => {
      const principal = AuthHelper.getPrincipal();
      expect(principal).not.toBeNull();

      const response = await apiClient.get(`${BASE_URL}${HMS.USER_PERMISSIONS(principal!.userId)}`, {
        headers: AuthHelper.getAuthHeaders(),
      });

      await test.step('Step 2: Verify status 200 and response is array', async () => {
        ResponseValidator.validateStatusCode(response, 200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
      });
    });
  });
});
