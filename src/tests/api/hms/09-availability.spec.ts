import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/**
 * HMS Core API — Availability
 * Swagger: http://13.205.179.0:3000/api/docs#/Availability
 */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Availability', () => {
  test.beforeAll(async ({ apiClient }) => { await AuthHelper.login(apiClient, BASE_URL); });
  test.beforeEach(async () => { allure.epic('HMS Core API'); allure.feature('Availability'); });

  test('TC-API-AVAIL-001 GET /api/v1/availability/schedules — List schedules', async ({ apiClient }) => {
    allure.story('List Schedules'); allure.severity('critical');
    const response = await apiClient.get(`${BASE_URL}${HMS.AVAILABILITY_SCHEDULES}`, { headers: AuthHelper.getAuthHeaders() });
    ResponseValidator.validateStatusCode(response, 200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('TC-API-AVAIL-002 GET /api/v1/availability/overrides — List overrides', async ({ apiClient }) => {
    allure.story('List Overrides'); allure.severity('normal');
    const response = await apiClient.get(`${BASE_URL}${HMS.AVAILABILITY_OVERRIDES}`, { headers: AuthHelper.getAuthHeaders() });
    ResponseValidator.validateStatusCode(response, 200);
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Published%20Availability/PublishedAvailabilityController_getSlots
  test('TC-API-AVAIL-003 GET /api/v1/public/availability/slots — Public patient-facing slots', async ({ apiClient }) => {
    allure.story('Public Slots'); allure.severity('critical');
    const response = await apiClient.get(`${BASE_URL}${HMS.PUBLIC_AVAILABILITY_SLOTS}`, { headers: AuthHelper.getAuthHeaders() });
    ResponseValidator.validateStatusCode(response, 200);
  });
});



