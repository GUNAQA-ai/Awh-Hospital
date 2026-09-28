import { test, expect } from '../../../fixtures/testFixtures';
import { ApiClient } from '../../../api/core/ApiClient';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { ReadinessResponseSchema } from '../../../api/schemas/HealthSchemas';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { allure } from 'allure-playwright';

/**
 * HMS Core API — Health Checks
 * Swagger: http://13.205.179.0:3000/api/docs#/Health
 */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Health Checks', () => {

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Health');
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Health/HealthController_health
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

  // Docs: http://13.205.179.0:3000/api/docs#/Health/HealthController_readiness
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



