import { test, expect } from '../../../fixtures/testFixtures';
import { AuthHelper } from '../../../api/core/AuthHelper';
import { HMS } from '../../../api/endpoints/HmsEndpoints';
import { ResponseValidator } from '../../../api/core/ResponseValidator';
import { allure } from 'allure-playwright';

/**
 * HMS Core API — Doctors
 * Swagger: http://13.205.179.0:3000/api/docs#/Doctors
 */
const BASE_URL = process.env.API_BASE_URL || 'http://13.205.179.0:3000';

test.describe('HMS Core API — Doctors', () => {

  test.beforeAll(async ({ apiClient }) => {
    await AuthHelper.login(apiClient, BASE_URL);
  });

  test.beforeEach(async () => {
    allure.epic('HMS Core API');
    allure.feature('Doctors');
  });

  // Docs: http://13.205.179.0:3000/api/docs#/Doctors/DoctorController_list
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

  // Docs: http://13.205.179.0:3000/api/docs#/Doctors/DoctorController_getById
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

  // Docs: http://13.205.179.0:3000/api/docs#/Doctors/DoctorController_getById
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



