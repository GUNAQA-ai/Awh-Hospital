/**
 * @file 05-doctors.spec.ts
 * @description
 * Automated API test suite verifying specialist and consulting doctor endpoints in the HMS Core API service.
 * Validates doctor directory queries, individual doctor profile lookups, and negative 404 handling.
 *
 * Test Suite Scope:
 * - TC-API-DOC-001: List all practicing doctors for the tenant organization (`GET /api/v1/doctors`).
 * - TC-API-DOC-002: Retrieve individual doctor details by valid UUID (`GET /api/v1/doctors/{id}`).
 * - TC-API-DOC-003: Validate HTTP 404 response when querying non-existent doctor UUID.
 *
 * Preconditions:
 * - HMS Core API service running and accessible on port 3000.
 * - Authenticated session initialized via `AuthHelper.login()` in `beforeAll`.
 *
 * Test Data:
 * - Dynamic data flow: Extracts valid doctor UUID from initial list query.
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
 * - `@api`, `@doctors`
 */

import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/** Base URL for the HMS Core API service */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Doctors', () => {

  test.beforeAll(async ({ apiClient }) => {
    await AuthHelper.login(apiClient, BASE_URL);
  });

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Doctors');
  });

  /**
   * TC-API-DOC-001: Lists all doctors registered under the tenant organization.
   */
  test('TC-API-DOC-001 GET /api/v1/doctors — List doctors for org', async ({ apiClient }) => {
    allure.story('List Doctors');
    allure.severity('critical');

    await test.step('Step 1: Send GET /api/v1/doctors', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.DOCTORS}`, {
        headers: AuthHelper.getAuthHeaders(),
      });

      await test.step('Step 2: Verify status 200', async () => {
        ResponseValidator.validateStatusCode(response, 200);
      });
    });
  });

  /**
   * TC-API-DOC-002: Retrieves a single doctor profile by valid ID.
   */
  test('TC-API-DOC-002 GET /api/v1/doctors/{id} — Get doctor by valid ID', async ({ apiClient }) => {
    allure.story('Get Doctor by ID');
    allure.severity('normal');

    let doctorId: string;

    await test.step('Step 1: List doctors to get a valid ID', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.DOCTORS}`, {
        headers: AuthHelper.getAuthHeaders(),
      });
      const body = await response.json();
      const doctors = Array.isArray(body) ? body : body.data || [];
      expect(doctors.length).toBeGreaterThan(0);
      doctorId = doctors[0].id;
    });

    await test.step('Step 2: Send GET /api/v1/doctors/{id}', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.DOCTOR_BY_ID(doctorId)}`, {
        headers: AuthHelper.getAuthHeaders(),
      });

      await test.step('Step 3: Verify status 200', async () => {
        ResponseValidator.validateStatusCode(response, 200);
        const body = await response.json();
        expect(body.id).toBe(doctorId);
      });
    });
  });

  /**
   * TC-API-DOC-003: Validates HTTP 404 response on non-existent doctor ID.
   */
  test('TC-API-DOC-003 GET /api/v1/doctors/{id} — Invalid ID returns 404', async ({ apiClient }) => {
    allure.story('Get Doctor - Negative');
    allure.severity('normal');

    await test.step('Step 1: Send GET with non-existent UUID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.get(`${BASE_URL}${HMS.DOCTOR_BY_ID(fakeId)}`, {
        headers: AuthHelper.getAuthHeaders(),
      });

      await test.step('Step 2: Verify status 404', async () => {
        ResponseValidator.validateStatusCode(response, 404);
      });
    });
  });
});
