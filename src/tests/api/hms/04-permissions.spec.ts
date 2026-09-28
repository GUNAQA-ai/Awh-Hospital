import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/**
 * HMS Core API — Permissions
 * Swagger: http://13.205.179.0:3000/api/docs#/Permissions
 */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Permissions', () => {

  test.beforeAll(async ({ apiClient }) => {
    await AuthHelper.login(apiClient, BASE_URL);
  });

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Permissions');
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Permissions/PermissionsController_listAll
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

  // Docs: http://13.205.179.0:3000/api/docs#/Permissions/PermissionsController_listUserPermissions
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



