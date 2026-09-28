import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/**
 * HMS Core API — Bookings
 * Swagger: http://13.205.179.0:3000/api/docs#/Bookings
 */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Bookings', () => {
  test.beforeAll(async ({ apiClient }) => { await AuthHelper.login(apiClient, BASE_URL); });
  test.beforeEach(async () => { allure.epic('HMS Core API'); allure.feature('Bookings'); });

  test('TC-API-BOOK-001 GET /api/v1/bookings — List bookings', async ({ apiClient }) => {
    allure.story('List Bookings'); allure.severity('critical');
    const response = await apiClient.get(`${BASE_URL}${HMS.BOOKINGS}`, { headers: AuthHelper.getAuthHeaders() });
    ResponseValidator.validateStatusCode(response, 200);
  });

  test('TC-API-BOOK-002 GET /api/v1/bookings/{id} — Invalid ID returns 404', async ({ apiClient }) => {
    allure.story('Get Booking - Negative'); allure.severity('normal');
    const response = await apiClient.get(`${BASE_URL}${HMS.BOOKING_BY_ID('00000000-0000-0000-0000-000000000000')}`, { headers: AuthHelper.getAuthHeaders() });
    ResponseValidator.validateStatusCode(response, 404);
  });

  test('TC-API-BOOK-003 GET /api/v1/bookings — Verify 401 without auth', async ({ apiClient }) => {
    allure.story('Authorization Guard'); allure.severity('critical');
    const response = await apiClient.get(`${BASE_URL}${HMS.BOOKINGS}`);
    ResponseValidator.validateStatusCode(response, 401);
  });
});



