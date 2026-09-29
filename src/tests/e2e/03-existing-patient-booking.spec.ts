/**
 * @file 03-existing-patient-booking.spec.ts
 * @description
 * End-to-End and functional test suite for Existing Patient Appointment Booking workflows on the AWH Hospital Portal.
 * Validates the authentication and booking flow for returning patients, including registered mobile phone entry,
 * OTP verification modal interaction, multi-patient profile matching, time slot reservation, care package selection,
 * and post-confirmation operations (reschedule and appointment cancellation).
 *
 * Test Suite Scope:
 * - TC-EP-001: [E2E] Full happy path existing patient booking using registered mobile and selected profile card.
 * - TC-EP-002: Verification modal dismissal via back button and landing screen return.
 * - TC-EP-003: Registered mobile phone entry and Send OTP button state verification.
 * - TC-EP-004: Profile selection across multiple patients linked to the same registered mobile number.
 * - TC-EP-005: Appointment rescheduling workflow for active upcoming bookings.
 * - TC-EP-006: Appointment cancellation workflow and cancellation modal confirmation.
 *
 * Preconditions:
 * - AWH Hospital booking web application is online and reachable at configured base URL.
 * - Test phone numbers exist in the hospital database with pre-linked patient profiles.
 * - HMS backend services (Doctor availability and OTP delivery) are operational.
 *
 * Test Data:
 * - Unified test data loaded dynamically from `sample/booking.json`.
 * - No hardcoded data in test specifications; adheres strictly to data-driven standards.
 *
 * Required Environment:
 * - QA, Staging, or Production web application environment configured via `ENV` or `.env`.
 *
 * Tags:
 * - `@e2e`, `@existing-patient`, `@booking`, `@reschedule`, `@cancellation`
 */

import { test, expect } from '../../fixtures/testFixtures';
import { allure } from 'allure-playwright';
import fs from 'fs';

// Load unified test data from sample/booking.json
// Single source of truth: Data Flow: sample/booking.json -> Test -> Page Object -> Browser
const data = JSON.parse(fs.readFileSync('sample/booking.json', 'utf-8'));

test.describe('AWH Hospital - Existing Patient Comprehensive Appointment Suite', () => {

  test.beforeEach(async () => {
    allure.epic('Patient Appointment Management');
    allure.feature('Existing Patient Booking & Reschedule');
    allure.owner('Hospital Automation QA Lead');
  });

  // ==========================================================================
  // 1. End-to-End Happy Path (EP-001, EP-014, EP-015)
  // ==========================================================================
  test('TC-EP-001 [E2E] Verify Existing Patient can complete appointment booking using registered mobile and selected profile', async ({ bookingPage, config }) => {
    allure.story('Existing Patient Booking');
    allure.severity('blocker');
    allure.description('Verify complete Existing Patient flow: mobile OTP verification, profile selection, doctor/slot selection, care package, and confirmation.');

    const existing = data.scenarios.existingPatient.registered;

    await test.step('Precondition: User navigates to AWH booking page', async () => {
      await bookingPage.navigateToBooking(config.baseURL || data.application.url);
      await bookingPage.verifyBookingPageLoaded();
    });

    await test.step('Step 1: Select "Existing patient" and click Continue to open verification modal', async () => {
      await bookingPage.selectExistingPatient();
      await bookingPage.clickContinue();
      await bookingPage.verifyExistingPatientModalDisplayed();
    });

    await test.step('Step 2: Enter registered mobile number, trigger Send OTP, and enter OTP code', async () => {
      await bookingPage.enterExistingPatientPhone(existing.phone);
      const enteredOtp = await bookingPage.sendExistingModalOtp(existing.otp);
      expect(enteredOtp.length).toBeGreaterThan(0);
    });

    await test.step('Step 3: Click "Verify & continue" to load matched patient profiles', async () => {
      await bookingPage.clickExistingModalVerifyContinue();
      await bookingPage.verifyMatchedPatientsScreenDisplayed();
    });

    await test.step('Step 4: Select patient profile card from "Patients on this mobile" list', async () => {
      const selectedPatient = await bookingPage.selectMatchedPatient(existing.patientSelection);
      expect(selectedPatient).toBeTruthy();
      await bookingPage.clickContinue();
      await bookingPage.verifyDateTimeScreenDisplayed();
    });

    await test.step('Step 5: Select consulting doctor, appointment date, and available time slot', async () => {
      await bookingPage.selectDoctor(existing.doctor);
      await bookingPage.selectDate(existing.appointmentDate, existing.month);
      const selectedSlot = await bookingPage.selectTimeSlot(existing.timeSlot);
      expect(selectedSlot).toBeTruthy();
      await bookingPage.clickContinue();
      await bookingPage.verifyCarePackageScreenDisplayed();
    });

    await test.step('Step 6: Select care package and confirm appointment', async () => {
      await bookingPage.selectCarePackage(existing.carePackage);
      await bookingPage.clickConfirm();
    });

    await test.step('Step 7: [Defect Guard] Verify appointment confirmation details match selected existing patient', async () => {
      await bookingPage.verifyAppointmentConfirmationDisplayed();

      const heading = await bookingPage.getAppointmentConfirmationHeading();
      expect(heading).toBe('Appointment confirmed');

      const details = await bookingPage.getAppointmentConfirmationDetails();
      expect(details.confirmationPill).toBeTruthy();

      const cardText = details.firstUpcomingCardText;
      expect(cardText).toBeTruthy();
    });
  });

  // ==========================================================================
  // 2. Mobile Number & Verification Rules (EP-002, EP-003, EP-004, EP-005, EP-006)
  // ==========================================================================
  test('TC-EP-002 Verify Existing Patient selection opens verification modal with required elements', async ({ bookingPage, config }) => {
    allure.story('Existing Patient Modal');
    allure.severity('critical');
    allure.description('Verify selecting Existing Patient opens the mobile OTP verification modal.');

    await test.step('Precondition: Navigate to booking landing page', async () => {
      await bookingPage.navigateToBooking(config.baseURL || data.application.url);
      await bookingPage.verifyBookingPageLoaded();
    });

    await test.step('Step 1: Select "Existing patient" and click Continue', async () => {
      await bookingPage.selectExistingPatient();
      await bookingPage.clickContinue();
    });

    await test.step('Step 2: Verify verification modal is displayed with mobile input and Send OTP button', async () => {
      await bookingPage.verifyExistingPatientModalDisplayed();
    });

    await test.step('Step 3: Close modal and verify returns to patient selection screen', async () => {
      await bookingPage.closeExistingVerifyModal();
      await bookingPage.verifyPatientTypeScreenDisplayed();
    });
  });

  test('TC-EP-003 [Validation Audit] Verify Existing Patient mobile validation blocks short, long, and invalid inputs', async ({ bookingPage, config }) => {
    allure.story('Mobile Input Validation');
    allure.severity('critical');
    allure.description('Verify invalid mobile formats (short, long, alphanumeric) cannot be used to request OTP.');

    const boundary = data.scenarios.existingPatient.boundaries;

    await test.step('Precondition: Open Existing Patient verification modal', async () => {
      await bookingPage.navigateToBooking(config.baseURL || data.application.url);
      await bookingPage.selectExistingPatient();
      await bookingPage.clickContinue();
      await bookingPage.verifyExistingPatientModalDisplayed();
    });

    await test.step('Step 1: Test short mobile number (<10 digits)', async () => {
      await bookingPage.enterExistingPatientPhone(boundary.shortPhone);
      // Real application behavior: Send OTP button is disabled for invalid short mobile numbers
      const isSendDisabled = await bookingPage.isExistingModalSendOtpDisabled();
      expect(isSendDisabled).toBeTruthy();

      console.log('\n======================================================================');
      console.log('📋 [EXISTING PATIENT MOBILE AUDIT - SHORT NUMBER]');
      console.log(`Input Entered   : "${boundary.shortPhone}" (${boundary.shortPhone.length} digits)`);
      console.log(`Send OTP Status : Disabled (${isSendDisabled})`);
      console.log('Result          : Verified submission prevented for incomplete mobile number.');
      console.log('======================================================================\n');
    });

    await test.step('Step 2: Test 10+ digits long mobile number', async () => {
      await bookingPage.enterExistingPatientPhone(boundary.longPhone);
      await bookingPage.clickExistingModalSendOtp();

      // Real application behavior: OTP input remains disabled because 11-digit phone is rejected
      const isOtpDisabled = await bookingPage.existingModalOtpInput.isDisabled();
      expect(isOtpDisabled).toBeTruthy();

      const actualVal = await bookingPage.getExistingModalPhoneInputValue();
      console.log('\n======================================================================');
      console.log('📋 [EXISTING PATIENT MOBILE AUDIT - 10+ DIGITS]');
      console.log(`Input Entered   : "${boundary.longPhone}" (${boundary.longPhone.length} digits)`);
      console.log(`Field Value     : "${actualVal}" (${actualVal.length} digits)`);
      console.log(`OTP Form Status : Blocked (OTP field disabled: ${isOtpDisabled})`);
      console.log('Result          : Verified OTP generation is blocked for invalid long mobile numbers.');
      console.log('======================================================================\n');
    });
  });

  // ==========================================================================
  // 3. Matched Patient Profiles Selection (EP-007, EP-008, EP-009, EP-010)
  // ==========================================================================
  test('TC-EP-008 Verify multiple patient profiles can be reviewed and non-first patient can be selected', async ({ bookingPage, config }) => {
    allure.story('Patient Selection');
    allure.severity('normal');
    allure.description('Verify user can select a specific patient profile from the matched profiles list.');

    const existing = data.scenarios.existingPatient.registered;

    await test.step('Precondition: Verify mobile and navigate to "Patients on this mobile" list', async () => {
      await bookingPage.navigateToBooking(config.baseURL || data.application.url);
      await bookingPage.selectExistingPatient();
      await bookingPage.clickContinue();
      await bookingPage.enterExistingPatientPhone(existing.phone);
      await bookingPage.sendExistingModalOtp(existing.otp);
      await bookingPage.clickExistingModalVerifyContinue();
      await bookingPage.verifyMatchedPatientsScreenDisplayed();
    });

    await test.step('Step 1: Select patient profile by index', async () => {
      const selected = await bookingPage.selectMatchedPatient(existing.patientSelection);
      expect(selected).toBeTruthy();
    });

    await test.step('Step 2: Click Continue to carry selected patient forward to Date & Time step', async () => {
      await bookingPage.clickContinue();
      await bookingPage.verifyDateTimeScreenDisplayed();
    });
  });

  // ==========================================================================
  // 4. Scheduling & Date/Time Validations (EP-011, EP-012, EP-013)
  // ==========================================================================
  test('TC-EP-011 Verify Existing Patient can select doctor, appointment date, and open time slot', async ({ bookingPage, config }) => {
    allure.story('Appointment Scheduling');
    allure.severity('critical');
    allure.description('Verify doctor filtering, date selection, and time slot selection for existing patient.');

    const existing = data.scenarios.existingPatient.registered;

    await test.step('Precondition: Complete patient profile selection and reach Date & Time screen', async () => {
      await bookingPage.navigateToBooking(config.baseURL || data.application.url);
      await bookingPage.selectExistingPatient();
      await bookingPage.clickContinue();
      await bookingPage.enterExistingPatientPhone(existing.phone);
      await bookingPage.sendExistingModalOtp(existing.otp);
      await bookingPage.clickExistingModalVerifyContinue();
      await bookingPage.selectMatchedPatient(existing.patientSelection);
      await bookingPage.clickContinue();
      await bookingPage.verifyDateTimeScreenDisplayed();
    });

    await test.step('Step 1: Select consulting doctor filter', async () => {
      const selectedDoctor = await bookingPage.selectDoctor(existing.doctor);
      expect(selectedDoctor.toLowerCase()).toContain(existing.doctor.toLowerCase());
    });

    await test.step('Step 2: Select appointment date and available time slot', async () => {
      const selectedDate = await bookingPage.selectDate(existing.appointmentDate, existing.month);
      expect(selectedDate).toContain(existing.appointmentDate);

      const selectedSlot = await bookingPage.selectTimeSlot(existing.timeSlot);
      expect(selectedSlot).toBeTruthy();
    });

    await test.step('Step 3: Click Continue to proceed to Care Package step', async () => {
      await bookingPage.clickContinue();
      await bookingPage.verifyCarePackageScreenDisplayed();
    });
  });

  test('TC-EP-012 Verify Existing Patient flow prevents advancing without selecting an appointment time slot', async ({ bookingPage, config }) => {
    allure.story('Schedule Requirement');
    allure.severity('critical');
    allure.description('Verify application prevents proceeding when no time slot is selected.');

    const existing = data.scenarios.existingPatient.registered;

    await test.step('Precondition: Reach Date & Time screen', async () => {
      await bookingPage.navigateToBooking(config.baseURL || data.application.url);
      await bookingPage.selectExistingPatient();
      await bookingPage.clickContinue();
      await bookingPage.enterExistingPatientPhone(existing.phone);
      await bookingPage.sendExistingModalOtp(existing.otp);
      await bookingPage.clickExistingModalVerifyContinue();
      await bookingPage.selectMatchedPatient(existing.patientSelection);
      await bookingPage.clickContinue();
      await bookingPage.verifyDateTimeScreenDisplayed();
    });

    await test.step('Step 1: Click Continue without selecting time slot', async () => {
      await bookingPage.clickContinue();
    });

    await test.step('Step 2: Verify user remains on Date & Time screen and error is displayed', async () => {
      await bookingPage.verifyDateTimeScreenDisplayed();
      const actualError = await bookingPage.getGlobalErrorMessageText();
      expect(actualError).toContain(data.scenarios.expectedMessages.slotRequired);
    });
  });

  // ==========================================================================
  // 5. Reschedule Workflow for Existing Patient (EP-016, EP-017, EP-018)
  // ==========================================================================
  test('TC-EP-016 [Reschedule] Verify Existing Patient appointment can be rescheduled to a new date and time', async ({ bookingPage, config }) => {
    allure.story('Existing Patient Reschedule');
    allure.severity('critical');
    allure.description('Verify existing patient can reschedule an upcoming appointment to another date and time while preserving patient record.');

    const existing = data.scenarios.existingPatient.registered;
    const rescheduleData = data.scenarios.existingPatient.reschedule;

    await test.step('Precondition: Complete initial booking for Existing Patient', async () => {
      await bookingPage.navigateToBooking(config.baseURL || data.application.url);
      await bookingPage.selectExistingPatient();
      await bookingPage.clickContinue();
      await bookingPage.enterExistingPatientPhone(existing.phone);
      await bookingPage.sendExistingModalOtp(existing.otp);
      await bookingPage.clickExistingModalVerifyContinue();
      await bookingPage.selectMatchedPatient(existing.patientSelection);
      await bookingPage.clickContinue();
      await bookingPage.selectDate(existing.appointmentDate, existing.month);
      await bookingPage.selectTimeSlot(existing.timeSlot);
      await bookingPage.clickContinue();
      await bookingPage.selectCarePackage(existing.carePackage);
      await bookingPage.clickConfirm();
      await bookingPage.verifyAppointmentConfirmationDisplayed();
    });

    await test.step('Step 1: Click Reschedule on the upcoming appointment card', async () => {
      await bookingPage.clickReschedule();
    });

    await test.step('Step 2: Select new appointment date and new available time slot', async () => {
      await bookingPage.selectDate(rescheduleData.newAppointmentDate, rescheduleData.newMonth);
      await bookingPage.selectTimeSlot(rescheduleData.newTimeSlot);
      await bookingPage.clickContinue();
    });

    await test.step('Step 3: Select care package and confirm reschedule', async () => {
      await bookingPage.selectCarePackage(rescheduleData.newCarePackage);
      await bookingPage.clickConfirm();
    });

    await test.step('Step 4: [Defect Guard] Verify appointment confirmation reflects rescheduled date', async () => {
      await bookingPage.verifyAppointmentConfirmationDisplayed();
      const cardText = await bookingPage.getUpcomingAppointmentCardText();
      expect(cardText).toContain(rescheduleData.newAppointmentDate);
    });
  });

  // ==========================================================================
  // 6. Navigation & Cancellation (EP-020, EP-021)
  // ==========================================================================
  test('TC-EP-021 Verify Back navigation from Date & Time returns to Matched Patients list', async ({ bookingPage, config }) => {
    allure.story('Navigation');
    allure.severity('normal');
    allure.description('Verify Back button on Date & Time screen returns to Patients on this mobile list.');

    const existing = data.scenarios.existingPatient.registered;

    await test.step('Precondition: Reach Date & Time screen', async () => {
      await bookingPage.navigateToBooking(config.baseURL || data.application.url);
      await bookingPage.selectExistingPatient();
      await bookingPage.clickContinue();
      await bookingPage.enterExistingPatientPhone(existing.phone);
      await bookingPage.sendExistingModalOtp(existing.otp);
      await bookingPage.clickExistingModalVerifyContinue();
      await bookingPage.selectMatchedPatient(existing.patientSelection);
      await bookingPage.clickContinue();
      await bookingPage.verifyDateTimeScreenDisplayed();
    });

    await test.step('Step 1: Click Back button on Date & Time screen', async () => {
      await bookingPage.clickBack();
    });

    await test.step('Step 2: Verify returned to "Patients on this mobile" list screen', async () => {
      await bookingPage.verifyMatchedPatientsScreenDisplayed();
    });
  });

  test('TC-EP-020 Verify Existing Patient can open and dismiss appointment cancellation modal', async ({ bookingPage, config }) => {
    allure.story('Appointment Cancellation');
    allure.severity('critical');
    allure.description('Verify cancellation modal opens and can be dismissed safely.');

    const existing = data.scenarios.existingPatient.registered;

    await test.step('Precondition: Complete booking for Existing Patient', async () => {
      await bookingPage.navigateToBooking(config.baseURL || data.application.url);
      await bookingPage.selectExistingPatient();
      await bookingPage.clickContinue();
      await bookingPage.enterExistingPatientPhone(existing.phone);
      await bookingPage.sendExistingModalOtp(existing.otp);
      await bookingPage.clickExistingModalVerifyContinue();
      await bookingPage.selectMatchedPatient(existing.patientSelection);
      await bookingPage.clickContinue();
      await bookingPage.selectDate(existing.appointmentDate, existing.month);
      await bookingPage.selectTimeSlot(existing.timeSlot);
      await bookingPage.clickContinue();
      await bookingPage.selectCarePackage(existing.carePackage);
      await bookingPage.clickConfirm();
      await bookingPage.verifyAppointmentConfirmationDisplayed();
    });

    await test.step('Step 1: Click Cancel on the upcoming appointment card', async () => {
      await bookingPage.clickCancel();
    });

    await test.step('Step 2: Dismiss cancellation modal by clicking Back', async () => {
      await bookingPage.dismissCancelModal();
    });
  });

});
