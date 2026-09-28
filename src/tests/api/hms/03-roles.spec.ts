import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/**
 * HMS Core API — Roles
 * Swagger: http://13.205.179.0:3000/api/docs#/Roles
 */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Roles', () => {

  test.beforeAll(async ({ apiClient }) => {
    await AuthHelper.login(apiClient, BASE_URL);
  });

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Roles');
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Roles/RolesController_list
  test('TC-API-ROLES-001 GET /api/v1/roles — List all roles (authenticated)', async ({ apiClient }) => {
    allure.story('List Roles');
    allure.severity('critical');

    await test.step('Step 1: Send GET /api/v1/roles with auth token', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.ROLES}`, {
        headers: AuthHelper.getAuthHeaders(),
      });

      await test.step('Step 2: Verify status 200', async () => {
        ResponseValidator.validateStatusCode(response, 200);
      });

      await test.step('Step 3: Verify response is an array', async () => {
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
      });
    });
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Roles/RolesController_list
  test('TC-API-ROLES-002 GET /api/v1/roles — Verify 401 without auth token', async ({ apiClient }) => {
    allure.story('Authorization Guard');
    allure.severity('critical');

    await test.step('Step 1: Send GET /api/v1/roles WITHOUT auth token', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.ROLES}`);

      await test.step('Step 2: Verify status 401 Unauthorized', async () => {
        ResponseValidator.validateStatusCode(response, 401);
      });
    });
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Roles/RolesController_getById
  test('TC-API-ROLES-003 GET /api/v1/roles/{id} — Get role by valid ID', async ({ apiClient }) => {
    allure.story('Get Role by ID');
    allure.severity('normal');

    let roleId: string;

    await test.step('Step 1: Fetch list of roles to get a valid ID', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.ROLES}`, {
        headers: AuthHelper.getAuthHeaders(),
      });
      const roles = await response.json();
      expect(roles.length).toBeGreaterThan(0);
      roleId = roles[0].id;
    });

    await test.step('Step 2: Send GET /api/v1/roles/{id}', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.ROLE_BY_ID(roleId)}`, {
        headers: AuthHelper.getAuthHeaders(),
      });

      await test.step('Step 3: Verify status 200 and response has id', async () => {
        ResponseValidator.validateStatusCode(response, 200);
        const body = await response.json();
        expect(body.id).toBe(roleId);
      });
    });
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Roles/RolesController_getById
  test('TC-API-ROLES-004 GET /api/v1/roles/{id} — Invalid ID returns 404', async ({ apiClient }) => {
    allure.story('Get Role - Negative');
    allure.severity('normal');

    await test.step('Step 1: Send GET with non-existent UUID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.get(`${BASE_URL}${HMS.ROLE_BY_ID(fakeId)}`, {
        headers: AuthHelper.getAuthHeaders(),
      });

      await test.step('Step 2: Verify status 404', async () => {
        ResponseValidator.validateStatusCode(response, 404);
      });
    });
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Roles/RolesController_listPermissions
  test('TC-API-ROLES-005 GET /api/v1/roles/{id}/permissions — List permissions for a role', async ({ apiClient }) => {
    allure.story('Role Permissions');
    allure.severity('normal');

    let roleId: string;

    await test.step('Step 1: Get first role ID', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.ROLES}`, {
        headers: AuthHelper.getAuthHeaders(),
      });
      const roles = await response.json();
      roleId = roles[0].id;
    });

    await test.step('Step 2: Send GET /api/v1/roles/{id}/permissions', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.ROLE_PERMISSIONS(roleId)}`, {
        headers: AuthHelper.getAuthHeaders(),
      });

      await test.step('Step 3: Verify status 200 and response is array', async () => {
        ResponseValidator.validateStatusCode(response, 200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
      });
    });
  });
});



