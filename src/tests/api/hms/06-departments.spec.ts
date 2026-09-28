import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/**
 * HMS Core API — Departments
 * Swagger: http://13.205.179.0:3000/api/docs#/Departments
 */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Departments', () => {
  test.beforeAll(async ({ apiClient }) => { await AuthHelper.login(apiClient, BASE_URL); });
  test.beforeEach(async () => { allure.epic('HMS Core API'); allure.feature('Departments'); });

  test('TC-API-DEPT-001 GET /api/v1/departments — List departments', async ({ apiClient }) => {
    allure.story('List Departments'); allure.severity('critical');
    const response = await apiClient.get(`${BASE_URL}${HMS.DEPARTMENTS}`, { headers: AuthHelper.getAuthHeaders() });
    ResponseValidator.validateStatusCode(response, 200);
  });

  test('TC-API-DEPT-002 GET /api/v1/departments/{id} — Get department by valid ID', async ({ apiClient }) => {
    allure.story('Get Department'); allure.severity('normal');
    const listResp = await apiClient.get(`${BASE_URL}${HMS.DEPARTMENTS}`, { headers: AuthHelper.getAuthHeaders() });
    const depts = await listResp.json();
    const items = Array.isArray(depts) ? depts : depts.data || [];
    expect(items.length).toBeGreaterThan(0);
    const response = await apiClient.get(`${BASE_URL}${HMS.DEPARTMENT_BY_ID(items[0].id)}`, { headers: AuthHelper.getAuthHeaders() });
    ResponseValidator.validateStatusCode(response, 200);
  });

  test('TC-API-DEPT-003 GET /api/v1/departments/{id} — Invalid ID returns 404', async ({ apiClient }) => {
    allure.story('Get Department - Negative'); allure.severity('normal');
    const response = await apiClient.get(`${BASE_URL}${HMS.DEPARTMENT_BY_ID('00000000-0000-0000-0000-000000000000')}`, { headers: AuthHelper.getAuthHeaders() });
    ResponseValidator.validateStatusCode(response, 404);
  });
});



