/**
 * @file 01-health.spec.ts
 * @description
 * Automated API test suite verifying health check and service readiness probes for the HMS Core API service.
 * Validates system liveness (`GET /health`) and container readiness probe response contracts (`GET /readiness`).
 *
 * Test Suite Scope:
 * - TC-API-HEALTH-001: Liveness probe check ensuring HTTP 200 response.
 * - TC-API-HEALTH-002: Readiness probe check validating HTTP 200 and `{ status: "ok" }` response payload schema.
 *
 * Preconditions:
 * - HMS Core API service running and accessible on port 3000.
 *
 * Test Data:
 * - None required (public unauthenticated probe endpoints).
 *
 * Required Environment:
 * - Configured via `API_BASE_URL` (default: `http://13.205.179.0:3000`).
 *
 * Steps / Flow:
 * 1. Dispatch GET request to target health route.
 * 2. Validate HTTP 200 OK status code.
 * 3. Validate JSON payload structure against Zod schema.
 *
 * Expected Result:
 * - Service responds with HTTP 200 OK within standard SLA latency thresholds.
 *
 * Cleanup Requirements:
 * - None. Read-only probe requests.
 *
 * Dependencies:
 * - `ApiClient`, `ResponseValidator`, `ReadinessResponseSchema`, `HMS`
 *
 * Tags:
 * - `@api`, `@health`, `@smoke`
 */

import { test, expect } from '../../../fixtures/testFixtures';
import { ApiClient } from '../../../api/core/ApiClient';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { ReadinessResponseSchema } from '../../../api/schemas/HealthSchemas';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { allure } from 'allure-playwright';

/** Base URL for the HMS Core API service */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Health Checks', () => {

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Health');
  });

  /**
   * TC-API-HEALTH-001: Verifies liveness probe returns HTTP 200.
   */
  test('TC-API-HEALTH-001 GET /health — Verify liveness check returns 200', async ({ apiClient }) => {
    allure.story('Liveness Check');
    allure.severity('blocker');

    await test.step('Step 1: Send GET request to /health', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.HEALTH}`);

      await test.step('Step 2: Verify response status is 200', async () => {
        ResponseValidator.validateStatusCode(response, 200);
      });
    });
  });

  /**
   * TC-API-HEALTH-002: Verifies readiness probe returns HTTP 200 and { status: "ok" }.
   */
  test('TC-API-HEALTH-002 GET /readiness — Verify readiness returns { status: "ok" }', async ({ apiClient }) => {
    allure.story('Readiness Check');
    allure.severity('blocker');

    await test.step('Step 1: Send GET request to /readiness', async () => {
      const response = await apiClient.get(`${BASE_URL}${HMS.READINESS}`);

      await test.step('Step 2: Verify response status is 200', async () => {
        ResponseValidator.validateStatusCode(response, 200);
      });

      await test.step('Step 3: Verify response body matches schema { status: "ok" }', async () => {
        const parsed = await ResponseValidator.validateSchema(response, ReadinessResponseSchema);
        expect(parsed.status).toBe('ok');
      });
    });
  });
});
