/**
 * @file 09-availability.spec.ts
 * @description
 * Automated API test suite verifying doctor availability schedule and slot management endpoints
 * in the HMS Core API service. Validates recurring schedule queries, override slot listings,
 * and public patient-facing slot availability used by the AWH booking frontend.
 *
 * Test Suite Scope:
 * - TC-API-AVAIL-001: List all recurring doctor availability schedules (`GET /api/v1/availability/schedules`).
 * - TC-API-AVAIL-002: List availability overrides (holiday blocks, ad-hoc closures) (`GET /api/v1/availability/overrides`).
 * - TC-API-AVAIL-003: Query public patient-facing published appointment slots (`GET /api/v1/public/availability/slots`).
 *
 * Preconditions:
 * - HMS Core API service running and accessible on port 3000.
 * - Authenticated admin session initialized via `AuthHelper.login()` in `beforeAll`.
 *
 * Test Data:
 * - None required. Read-only availability queries.
 *
 * Required Environment:
 * - Configured via `API_BASE_URL` (default: `http://13.205.179.0:3000`).
 *
 * Steps / Flow:
 * 1. Authenticate in beforeAll hook.
 * 2. Send GET request with Authorization Bearer header.
 * 3. Validate HTTP 200 OK status code and response payload shape.
 *
 * Cleanup Requirements:
 * - None. All test scenarios are read-only queries.
 *
 * Dependencies:
 * - `ApiClient`, `AuthHelper`, `HMS`, `ResponseValidator`
 *
 * Tags:
 * - `@api`, `@availability`, `@scheduling`
 */

import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/** Base URL for the HMS Core API service */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Availability', () => {

  test.beforeAll(async ({ apiClient }) => {
    await AuthHelper.login(apiClient, BASE_URL);
  });

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Availability');
  });

  /**
   * TC-API-AVAIL-001: Lists all recurring doctor availability schedules for the organization.
   * Swagger: http://13.205.179.0:3000/api/docs#/Availability
   */
  test('TC-API-AVAIL-001 GET /api/v1/availability/schedules — List schedules', async ({ apiClient }) => {
    allure.story('List Schedules');
    allure.severity('critical');

    const response = await apiClient.get(`${BASE_URL}${HMS.AVAILABILITY_SCHEDULES}`, {
      headers: AuthHelper.getAuthHeaders(),
    });
    ResponseValidator.validateStatusCode(response, 200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  /**
   * TC-API-AVAIL-002: Lists availability overrides (holiday blocks, ad-hoc schedule closures).
   */
  test('TC-API-AVAIL-002 GET /api/v1/availability/overrides — List overrides', async ({ apiClient }) => {
    allure.story('List Overrides');
    allure.severity('normal');

    const response = await apiClient.get(`${BASE_URL}${HMS.AVAILABILITY_OVERRIDES}`, {
      headers: AuthHelper.getAuthHeaders(),
    });
    ResponseValidator.validateStatusCode(response, 200);
  });

  /**
   * TC-API-AVAIL-003: Queries the public patient-facing published availability slots
   * consumed by the AWH booking frontend calendar grid.
   * Swagger: http://13.205.179.0:3000/api/docs#/Published%20Availability/PublishedAvailabilityController_getSlots
   */
  test('TC-API-AVAIL-003 GET /api/v1/public/availability/slots — Public patient-facing slots', async ({ apiClient }) => {
    allure.story('Public Slots');
    allure.severity('critical');

    const response = await apiClient.get(`${BASE_URL}${HMS.PUBLIC_AVAILABILITY_SLOTS}`, {
      headers: AuthHelper.getAuthHeaders(),
    });
    ResponseValidator.validateStatusCode(response, 200);
  });
});



