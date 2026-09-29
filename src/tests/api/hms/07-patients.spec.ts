/**
 * @file 07-patients.spec.ts
 * @description
 * Automated API test suite verifying patient management, query search, duplicate detection,
 * and individual patient record retrieval in the HMS Core API service.
 *
 * Test Suite Scope:
 * - TC-API-PAT-001: List patient records registered within the organization (`GET /api/v1/patients`).
 * - TC-API-PAT-002: Search patient records by text query parameter (`GET /api/v1/patients/search?q=test`).
 * - TC-API-PAT-003: Check for duplicate patient accounts using phone number parameter (`GET /api/v1/patients/check-duplicates`).
 * - TC-API-PAT-004: Validate HTTP 404 response when querying non-existent patient UUID (`GET /api/v1/patients/{id}`).
 *
 * Preconditions:
 * - HMS Core API service running and accessible on port 3000.
 * - Authenticated session initialized via `AuthHelper.login()` in `beforeAll`.
 *
 * Test Data:
 * - Search query strings and phone parameters for duplicate checks.
 * - Nil-UUID (`00000000-0000-0000-0000-000000000000`) for negative 404 assertion.
 *
 * Required Environment:
 * - Configured via `API_BASE_URL` (default: `http://13.205.179.0:3000`).
 *
 * Steps / Flow:
 * 1. Log in during beforeAll hook.
 * 2. Send GET request with Authorization header and optional query parameters.
 * 3. Validate status code 200 OK or 404 Not Found.
 *
 * Cleanup Requirements:
 * - None. Read-only query endpoints.
 *
 * Dependencies:
 * - `ApiClient`, `AuthHelper`, `HMS`, `ResponseValidator`
 *
 * Tags:
 * - `@api`, `@patients`, `@search`
 */

import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/** Base URL for the HMS Core API service */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Patients', () => {
  test.beforeAll(async ({ apiClient }) => {
    await AuthHelper.login(apiClient, BASE_URL);
  });

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Patients');
  });

  /**
   * TC-API-PAT-001: Lists patients registered within the organization.
   */
  test('TC-API-PAT-001 GET /api/v1/patients — List patients', async ({ apiClient }) => {
    allure.story('List Patients');
    allure.severity('critical');

    const response = await apiClient.get(`${BASE_URL}${HMS.PATIENTS}`, {
      headers: AuthHelper.getAuthHeaders()
    });
    ResponseValidator.validateStatusCode(response, 200);
  });

  /**
   * TC-API-PAT-002: Searches patients matching query text.
   */
  test('TC-API-PAT-002 GET /api/v1/patients/search — Search patients', async ({ apiClient }) => {
    allure.story('Search Patients');
    allure.severity('critical');

    const response = await apiClient.get(`${BASE_URL}${HMS.PATIENT_SEARCH}`, {
      headers: AuthHelper.getAuthHeaders(),
      params: { q: 'test' }
    });
    ResponseValidator.validateStatusCode(response, 200);
  });

  /**
   * TC-API-PAT-003: Evaluates duplicate patient detection based on phone number.
   */
  test('TC-API-PAT-003 GET /api/v1/patients/check-duplicates — Check duplicates', async ({ apiClient }) => {
    allure.story('Duplicate Check');
    allure.severity('normal');

    const response = await apiClient.get(`${BASE_URL}${HMS.PATIENT_CHECK_DUPLICATES}`, {
      headers: AuthHelper.getAuthHeaders(),
      params: { phone: '9390406658', email: '' }
    });
    ResponseValidator.validateStatusCode(response, 200);
  });

  /**
   * TC-API-PAT-004: Validates HTTP 404 response on non-existent patient ID.
   */
  test('TC-API-PAT-004 GET /api/v1/patients/{id} — Invalid ID returns 404', async ({ apiClient }) => {
    allure.story('Get Patient - Negative');
    allure.severity('normal');

    const response = await apiClient.get(`${BASE_URL}${HMS.PATIENT_BY_ID('00000000-0000-0000-0000-000000000000')}`, {
      headers: AuthHelper.getAuthHeaders()
    });
    ResponseValidator.validateStatusCode(response, 404);
  });
});
