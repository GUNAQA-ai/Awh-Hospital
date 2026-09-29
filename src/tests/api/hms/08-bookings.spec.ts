/**
 * @file 08-bookings.spec.ts
 * @description
 * Automated API test suite verifying appointment booking query and authorization endpoints in the HMS Core API service.
 * Validates bookings collection listing, unauthenticated request rejection, and 404 handling.
 *
 * Test Suite Scope:
 * - TC-API-BOOK-001: List appointment bookings with valid authentication token (`GET /api/v1/bookings`).
 * - TC-API-BOOK-002: Validate HTTP 404 response when querying non-existent booking UUID (`GET /api/v1/bookings/{id}`).
 * - TC-API-BOOK-003: Verify unauthenticated requests to bookings collection return HTTP 401 Unauthorized.
 *
 * Preconditions:
 * - HMS Core API service running and accessible on port 3000.
 * - Authenticated session initialized via `AuthHelper.login()` in `beforeAll`.
 *
 * Test Data:
 * - Nil-UUID (`00000000-0000-0000-0000-000000000000`) for negative 404 assertion.
 *
 * Required Environment:
 * - Configured via `API_BASE_URL` (default: `http://13.205.179.0:3000`).
 *
 * Steps / Flow:
 * 1. Log in during beforeAll hook.
 * 2. Send GET request with/without Authorization header.
 * 3. Validate status code 200 OK, 401 Unauthorized, or 404 Not Found.
 *
 * Cleanup Requirements:
 * - None. Read-only query endpoints.
 *
 * Dependencies:
 * - `ApiClient`, `AuthHelper`, `HMS`, `ResponseValidator`
 *
 * Tags:
 * - `@api`, `@bookings`, `@security`
 */

import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/** Base URL for the HMS Core API service */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Bookings', () => {
  test.beforeAll(async ({ apiClient }) => {
    await AuthHelper.login(apiClient, BASE_URL);
  });

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Bookings');
  });

  /**
   * TC-API-BOOK-001: Lists appointment bookings with valid JWT authentication.
   */
  test('TC-API-BOOK-001 GET /api/v1/bookings — List bookings', async ({ apiClient }) => {
    allure.story('List Bookings');
    allure.severity('critical');

    const response = await apiClient.get(`${BASE_URL}${HMS.BOOKINGS}`, {
      headers: AuthHelper.getAuthHeaders()
    });
    ResponseValidator.validateStatusCode(response, 200);
  });

  /**
   * TC-API-BOOK-002: Validates HTTP 404 response on non-existent booking ID.
   */
  test('TC-API-BOOK-002 GET /api/v1/bookings/{id} — Invalid ID returns 404', async ({ apiClient }) => {
    allure.story('Get Booking - Negative');
    allure.severity('normal');

    const response = await apiClient.get(`${BASE_URL}${HMS.BOOKING_BY_ID('00000000-0000-0000-0000-000000000000')}`, {
      headers: AuthHelper.getAuthHeaders()
    });
    ResponseValidator.validateStatusCode(response, 404);
  });

  /**
   * TC-API-BOOK-003: Validates that unauthenticated requests to bookings collection return HTTP 401.
   */
  test('TC-API-BOOK-003 GET /api/v1/bookings — Verify 401 without auth', async ({ apiClient }) => {
    allure.story('Authorization Guard');
    allure.severity('critical');

    const response = await apiClient.get(`${BASE_URL}${HMS.BOOKINGS}`);
    ResponseValidator.validateStatusCode(response, 401);
  });
});
