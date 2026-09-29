/**
 * @file 06-departments.spec.ts
 * @description
 * Automated API test suite verifying hospital department endpoints in the HMS Core API service.
 * Validates medical specialty department listings, single department profile retrieval, and negative 404 handling.
 *
 * Test Suite Scope:
 * - TC-API-DEPT-001: List all active clinical departments for the organization (`GET /api/v1/departments`).
 * - TC-API-DEPT-002: Retrieve specific clinical department details by valid UUID (`GET /api/v1/departments/{id}`).
 * - TC-API-DEPT-003: Validate HTTP 404 response when querying non-existent department UUID.
 *
 * Preconditions:
 * - HMS Core API service running and accessible on port 3000.
 * - Authenticated session initialized via `AuthHelper.login()` in `beforeAll`.
 *
 * Test Data:
 * - Dynamic data flow: Extracts valid department UUID from initial listing query.
 * - Nil-UUID (`00000000-0000-0000-0000-000000000000`) used for negative assertions.
 *
 * Required Environment:
 * - Configured via `API_BASE_URL` (default: `http://13.205.179.0:3000`).
 *
 * Steps / Flow:
 * 1. Log in during beforeAll hook.
 * 2. Send GET request with Authorization header.
 * 3. Validate status code 200 OK or 404 Not Found.
 *
 * Cleanup Requirements:
 * - None. Read-only query endpoints.
 *
 * Dependencies:
 * - `ApiClient`, `AuthHelper`, `HMS`, `ResponseValidator`
 *
 * Tags:
 * - `@api`, `@departments`
 */

import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/** Base URL for the HMS Core API service */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Departments', () => {
  test.beforeAll(async ({ apiClient }) => {
    await AuthHelper.login(apiClient, BASE_URL);
  });

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Departments');
  });

  /**
   * TC-API-DEPT-001: Lists all active clinical departments.
   */
  test('TC-API-DEPT-001 GET /api/v1/departments — List departments', async ({ apiClient }) => {
    allure.story('List Departments');
    allure.severity('critical');

    const response = await apiClient.get(`${BASE_URL}${HMS.DEPARTMENTS}`, {
      headers: AuthHelper.getAuthHeaders()
    });
    ResponseValidator.validateStatusCode(response, 200);
  });

  /**
   * TC-API-DEPT-002: Retrieves a specific department profile by valid ID.
   */
  test('TC-API-DEPT-002 GET /api/v1/departments/{id} — Get department by valid ID', async ({ apiClient }) => {
    allure.story('Get Department');
    allure.severity('normal');

    const listResp = await apiClient.get(`${BASE_URL}${HMS.DEPARTMENTS}`, {
      headers: AuthHelper.getAuthHeaders()
    });
    const depts = await listResp.json();
    const items = Array.isArray(depts) ? depts : depts.data || [];
    expect(items.length).toBeGreaterThan(0);

    const response = await apiClient.get(`${BASE_URL}${HMS.DEPARTMENT_BY_ID(items[0].id)}`, {
      headers: AuthHelper.getAuthHeaders()
    });
    ResponseValidator.validateStatusCode(response, 200);
  });

  /**
   * TC-API-DEPT-003: Validates HTTP 404 response on non-existent department ID.
   */
  test('TC-API-DEPT-003 GET /api/v1/departments/{id} — Invalid ID returns 404', async ({ apiClient }) => {
    allure.story('Get Department - Negative');
    allure.severity('normal');

    const response = await apiClient.get(`${BASE_URL}${HMS.DEPARTMENT_BY_ID('00000000-0000-0000-0000-000000000000')}`, {
      headers: AuthHelper.getAuthHeaders()
    });
    ResponseValidator.validateStatusCode(response, 404);
  });
});
