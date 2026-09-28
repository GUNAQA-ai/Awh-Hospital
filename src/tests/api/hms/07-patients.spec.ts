import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/**
 * HMS Core API — Patients
 * Swagger: http://13.205.179.0:3000/api/docs#/Patients
 */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Patients', () => {
  test.beforeAll(async ({ apiClient }) => { await AuthHelper.login(apiClient, BASE_URL); });
  test.beforeEach(async () => { allure.epic('HMS Core API'); allure.feature('Patients'); });

  test('TC-API-PAT-001 GET /api/v1/patients — List patients', async ({ apiClient }) => {
    allure.story('List Patients'); allure.severity('critical');
    const response = await apiClient.get(`${BASE_URL}${HMS.PATIENTS}`, { headers: AuthHelper.getAuthHeaders() });
    ResponseValidator.validateStatusCode(response, 200);
  });

  test('TC-API-PAT-002 GET /api/v1/patients/search — Search patients', async ({ apiClient }) => {
    allure.story('Search Patients'); allure.severity('critical');
    const response = await apiClient.get(`${BASE_URL}${HMS.PATIENT_SEARCH}`, { headers: AuthHelper.getAuthHeaders(), params: { q: 'test' } });
    ResponseValidator.validateStatusCode(response, 200);
  });

  test('TC-API-PAT-003 GET /api/v1/patients/check-duplicates — Check duplicates', async ({ apiClient }) => {
    allure.story('Duplicate Check'); allure.severity('normal');
    const response = await apiClient.get(`${BASE_URL}${HMS.PATIENT_CHECK_DUPLICATES}`, { headers: AuthHelper.getAuthHeaders(), params: { phone: '9390406658', email: '' } });
    ResponseValidator.validateStatusCode(response, 200);
  });

  test('TC-API-PAT-004 GET /api/v1/patients/{id} — Invalid ID returns 404', async ({ apiClient }) => {
    allure.story('Get Patient - Negative'); allure.severity('normal');
    const response = await apiClient.get(`${BASE_URL}${HMS.PATIENT_BY_ID('00000000-0000-0000-0000-000000000000')}`, { headers: AuthHelper.getAuthHeaders() });
    ResponseValidator.validateStatusCode(response, 404);
  });
});



