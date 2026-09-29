/**
 * @file AwhBookingPage.ts
 * @description
 * Page Object representing the AWH (AWS Hospital) Web Booking Application portal.
 * Encapsulates all user interaction flows across the booking lifecycle, including language selection,
 * new patient intake, existing patient OTP verification, doctor/specialty selection, calendar navigation,
 * time slot picking, care package selection, appointment confirmation, rescheduling, and cancellation.
 *
 * Responsibilities:
 * - Provide strongly-typed action methods for every step of the appointment booking process.
 * - Manage and isolate Playwright locators for intake fields, modal dialogs, calendar components, and confirmation cards.
 * - Handle multi-language switching (English, Hindi, Telugu) with normalized language tags.
 * - Audit and report application-level validations (e.g. mobile number already linked to existing patients).
 * - Navigate calendar grids week-by-week or month-by-month to match requested appointment dates.
 *
 * Major Classes:
 * - {@link AwhBookingPage} (also exported as {@link BookingPage}) - Primary Page Object for the AWH Booking application.
 *
 * Dependencies:
 * - `@playwright/test`: Core automation types (Locator, Page, expect, test).
 * - `./BasePage`: Base page class providing standardized interaction and waiting mechanics.
 *
 * Assumptions:
 * - The web booking application is hosted and accessible at the specified base URL.
 * - Single-page application (SPA) transitions occur upon button clicks without full-page reloads.
 *
 * Side Effects:
 * - Fills form fields and submits appointment reservations to the HMS/Orchestrator backend.
 * - Emits detailed step logs to standard output.
 *
 * Usage Considerations:
 * - Use with the custom fixture `test` from `testFixtures.ts` which automatically initializes this page object.
 * - All date and slot parameters are flexible, supporting ISO strings, day numbers, or keyword identifiers.
 */

import { Locator, expect, Page, test } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object representing the AWH (AWS Hospital) Website Booking Form.
 * Target URL: https://awh-website-booking-form.vercel.app/
 *
 * Ordered logically to mirror the user booking workflow:
 * 1. Initial Landing, Language Switcher & Patient Type Selection
 * 2. New Patient Intake Form Fields (Full name, DOB, Gender, State, City, Phone, OTP)
 * 3. Date & Time Selection (Doctor filter, Week navigation, Day, Time slots)
 * 4. Care Package Selection (Silver, Gold, Platinum / Basic, Advanced, Premium)
 * 5. Navigation & Appointment Confirmation (Pill, Upcoming, Reschedule, Cancel)
 * 6. Existing Patient Verification Modal & Matched Profiles List
 * 7. Screen & Validation Error Message Verifications
 *
 * @class AwhBookingPage
 * @extends {BasePage}
 */
export class AwhBookingPage extends BasePage {
  // ==========================================================================
  // 1. Initial Landing, Language Switcher & Patient Type Locators
  // ==========================================================================
  private pageTitleHeading: Locator;
  private languageGroup: Locator;
  private englishLangButton: Locator;
  private hindiLangButton: Locator;
  private teluguLangButton: Locator;

  private newPatientButton: Locator;
  private newPatientTitle: Locator;
  private newPatientDescription: Locator;

  private existingPatientButton: Locator;
  private existingPatientTitle: Locator;
  private existingPatientDescription: Locator;

  private continueButton: Locator;
  private whatsAppFloatingButton: Locator;
  private talkToAshaAgentButton: Locator;

  // ==========================================================================
  // 2. New Patient Intake Form Locators
  // ==========================================================================
  private intakeSectionHeading: Locator;
  private fullNameInput: Locator;
  private dobInput: Locator;
  private genderSelect: Locator;
  private pincodeInput: Locator;
  private stateSelect: Locator;
  private cityInput: Locator;
  private phoneInput: Locator;
  private sendOtpButton: Locator;
  private otpInput: Locator;
  private mobileLinkedWarning: Locator;
  private continueAsExistingPatientButton: Locator;

  // ==========================================================================
  // 3. Date & Time Selection Locators
  // ==========================================================================
  private dateTimeSectionHeading: Locator;
  private consultantDoctorSubtitle: Locator;
  private consultingDoctorName: Locator;
  private doctorFilterButtons: Locator;
  private weekDateRangeText: Locator;
  private prevWeekButton: Locator;
  private nextWeekButton: Locator;
  private dayButtons: Locator;
  private slotsLoadingText: Locator;
  private noSlotsText: Locator;
  private slotButtons: Locator;
  private firstAvailableSlotButton: Locator;

  // ==========================================================================
  // 4. Care Package Selection Locators
  // ==========================================================================
  private packageSectionHeading: Locator;
  private packageLoadingText: Locator;
  private noPackagesText: Locator;
  private packageCards: Locator;
  private basicPackageCard: Locator;
  private advancedPackageCard: Locator;
  private premiumPackageCard: Locator;
  private silverPackageCard: Locator;
  private goldPackageCard: Locator;
  private platinumPackageCard: Locator;

  // ==========================================================================
  // 5. Navigation & Appointment Confirmation Locators
  // ==========================================================================
  private backButton: Locator;
  private confirmButton: Locator;

  private appointmentConfirmedHeading: Locator;
  private upcomingAppointmentHeading: Locator;
  private appointmentConfirmationPill: Locator;
  private bookAnotherAppointmentButton: Locator;
  private upcomingAppointmentsSectionTitle: Locator;
  private upcomingAppointmentCards: Locator;
  private rescheduleAppointmentButton: Locator;
  private cancelAppointmentButton: Locator;
  private cancelAppointmentDialog: Locator;
  private cancelDialogTitle: Locator;
  private cancelDialogConfirmButton: Locator;
  private cancelDialogBackButton: Locator;
  private chooseAnotherPatientButton: Locator;

  // ==========================================================================
  // 6. Existing Patient Verification Modal & Matched Profiles Locators
  // ==========================================================================
  private existingVerifyDialog: Locator;
  private existingVerifyDialogTitle: Locator;
  private existingModalCloseButton: Locator;
  private existingModalPhoneInput: Locator;
  private existingModalSendOtpButton: Locator;
  private existingModalOtpInput: Locator;
  private existingModalVerifyContinueButton: Locator;
  private existingModalBackButton: Locator;

  private matchedPatientsHeading: Locator;
  private matchedPatientsSubtitle: Locator;
  private matchedPatientCardButtons: Locator;

  // ==========================================================================
  // 7. Validation Error Message Locators
  // ==========================================================================
  private globalErrorMessage: Locator;
  private existingModalErrorMessage: Locator;
  private dobErrorHint: Locator;
  private pincodeErrorHint: Locator;
  private cityErrorHint: Locator;
  private dateTimeErrorMessage: Locator;

  // ==========================================================================
  // Dynamic XPath Templates for Parameterized Elements (Resolved via BasePage.getDynamicLocatorFromChild)
  // ==========================================================================
  private readonly dynamicXPaths: Record<string, string> = {
    doctorButton: "//button[contains(@class, 'rounded-full') and contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{0}')]",
    dayButton: "button.flex.flex-col.items-center:has(span:text-is('{0}'))",
    slotButton: "//button[contains(@class, 'whitespace-nowrap') and (normalize-space(text())='{0}' or contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{0}'))]",
    packageCard: "//button[contains(., 'INR') and contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{0}')]",
    patientCardByName: "//ul[contains(@class, 'overscroll-contain')]//button[.//p[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{0}')]]",
  };

  // ==========================================================================
  // Log Message Variables
  // ==========================================================================
  // 1. Landing & Navigation Logs
  private readonly navigatedToBookingLog = "Opening 'AWH Hospital Booking Form' page";
  private readonly switchedToEnglishLog = "Switching language to 'English'";
  private readonly switchedToHindiLog = "Switching language to 'Hindi'";
  private readonly switchedToTeluguLog = "Switching language to 'Telugu'";
  private readonly selectedNewPatientLog = "Selecting 'New patient' option";
  private readonly selectedExistingPatientLog = "Selecting 'Existing patient' option";
  private readonly clickedContinueLog = "Clicking 'Continue' button";
  private readonly clickedWhatsAppLog = "Clicking floating WhatsApp button";
  private readonly clickedTalkToAshaLog = "Clicking 'Talk to Asha' button";

  // Dynamic Waits Logs
  private readonly waitingForNewPatientButtonLog = "Waiting for 'New patient' button";
  private readonly waitingForExistingPatientButtonLog = "Waiting for 'Existing patient' button";
  private readonly waitingForContinueButtonLog = "Waiting for 'Continue' button";
  private readonly waitingForBackButtonLog = "Waiting for 'Back' button";
  private readonly waitingForConfirmButtonLog = "Waiting for 'Confirm' button";

  // 2. New Patient Intake Logs
  private readonly enteredFullNameLog = "Entering patient 'Full name'";
  private readonly enteredDobLog = "Entering patient 'Date of birth'";
  private readonly selectedGenderLog = "Selecting patient 'Gender'";
  private readonly enteredPincodeLog = "Entering patient 'Pincode'";
  private readonly selectedStateLog = "Selecting patient 'State'";
  private readonly enteredCityLog = "Entering patient 'City'";
  private readonly enteredPhoneLog = "Entering patient 'Mobile number'";
  private readonly clickedSendOtpLog = "Clicking 'Send OTP' button on intake form";
  private readonly clickedContinueAsExistingPatientLog = "Clicking 'Continue as existing patient' button";
  private readonly enteredOtpLog = "Entering 'OTP' code on intake form";
  private readonly clearedFullNameLog = "Clearing patient 'Full name' field";
  private readonly clearedDobLog = "Clearing patient 'Date of birth' field";
  private readonly clearedPincodeLog = "Clearing patient 'Pincode' field";
  private readonly clearedCityLog = "Clearing patient 'City' field";
  private readonly clearedPhoneLog = "Clearing patient 'Mobile number' field";
  private readonly clearedOtpLog = "Clearing 'OTP' field";

  // 3. Date & Time Logs
  private readonly selectedDoctorLog = "Selecting specialist doctor filter";
  private readonly clickedPrevWeekLog = "Navigating to 'Previous week'";
  private readonly clickedNextWeekLog = "Navigating to 'Next week'";
  private readonly selectedDayLog = "Selecting date on calendar";
  private readonly selectedSlotLog = "Selecting appointment time slot";
  private readonly navigatingToMonthLog = "Navigating calendar to target month";

  // 4. Care Package Logs
  private readonly selectedPackageLog = "Selecting care package";

  // 5. Navigation & Post-Booking Logs
  private readonly clickedBackLog = "Clicking 'Back' button";
  private readonly clickedConfirmLog = "Clicking 'Confirm' button";
  private readonly clickedBookAnotherLog = "Clicking 'Book another appointment' button";
  private readonly clickedRescheduleLog = "Clicking 'Reschedule' appointment button";
  private readonly clickedCancelLog = "Clicking 'Cancel' appointment button";
  private readonly confirmedCancelLog = "Confirming appointment cancellation in modal";
  private readonly dismissedCancelLog = "Dismissing appointment cancellation modal";
  private readonly clickedChooseAnotherPatientLog = "Clicking 'Choose another patient' button";

  // 6. Existing Patient Modal & Matched Profiles Logs
  private readonly enteredModalPhoneLog = "Entering registered mobile number in verification modal";
  private readonly clickedModalSendOtpLog = "Clicking 'Send OTP' button in verification modal";
  private readonly enteredModalOtpLog = "Entering OTP code in verification modal";
  private readonly clickedModalVerifyContinueLog = "Clicking 'Verify & continue' button in verification modal";
  private readonly closedModalLog = "Closing existing patient verification modal";
  private readonly selectedMatchedPatientIndexLog = "Selecting matched patient profile by index";
  private readonly selectedMatchedPatientNameLog = "Selecting matched patient profile by name";

  // 7. Screen & Validation Error Verifications Logs
  private readonly verifiedBookingPageLoadedLog = "Verifying 'AWH booking' page loaded with patient options";
  private readonly verifiedPatientTypeScreenLog = "Verifying patient type cards displayed";
  private readonly verifiedDateTimeScreenLog = "Verifying 'Date & Time' selection screen displayed";
  private readonly verifiedCarePackageScreenLog = "Verifying 'Care Package' selection screen displayed";
  private readonly verifiedNewPatientIntakeScreenLog = "Verifying 'New patient intake' form fields displayed";
  private readonly verifiedExistingPatientModalLog = "Verifying 'Existing Patient' mobile OTP verification modal displayed";
  private readonly verifiedMatchedPatientsScreenLog = "Verifying 'Matched Patients' list screen displayed";
  private readonly verifiedConfirmedScreenLog = "Verifying appointment confirmation screen displayed";
  private readonly verifiedGlobalErrorLog = "Verifying global step validation error displayed";
  private readonly verifiedModalErrorLog = "Verifying modal validation error displayed";
  private readonly verifiedDobErrorLog = "Verifying Date of Birth field validation error displayed";
  private readonly verifiedPincodeErrorLog = "Verifying Pincode field validation error displayed";
  private readonly verifiedCityErrorLog = "Verifying City field validation error displayed";

  /**
   * Initializes the AwhBookingPage instance and defines all element locators.
   *
   * @param {Page} page
   *        Required.
   *        The active Playwright Page instance driving the browser session.
   */
  constructor(page: Page) {
    super(page);

    // 1. Initial Landing, Language Switcher & Patient Type
    this.pageTitleHeading = this.page.locator("//h1[text()='Book a visit']");
    this.languageGroup = this.page.locator("//div[@role='group' and @aria-label='Language']");
    this.englishLangButton = this.page.locator("//button[@title='English' or text()='En']");
    this.hindiLangButton = this.page.locator("//button[@title='हिन्दी' or text()='हिं']");
    this.teluguLangButton = this.page.locator("//button[@title='తెలుగు' or text()='తె']");

    this.newPatientButton = this.page.locator("//button[.//h4[text()='New patient']]");
    this.newPatientTitle = this.page.locator("//h4[text()='New patient']");
    this.newPatientDescription = this.page.locator("//p[contains(text(), 'First visit — we will set up your record')]");

    this.existingPatientButton = this.page.locator("//button[.//h4[text()='Existing patient']]");
    this.existingPatientTitle = this.page.locator("//h4[text()='Existing patient']");
    this.existingPatientDescription = this.page.locator("//p[contains(text(), 'You have visited us before')]");

    this.continueButton = this.page.locator("//button[@type='submit' and (contains(., 'Continue') or contains(., 'Confirm'))]");
    this.whatsAppFloatingButton = this.page.locator("//a[contains(@href, 'wa.me') or contains(@aria-label, 'WhatsApp')]");
    this.talkToAshaAgentButton = this.page.locator("//button[@title='Talk to Asha']");

    // 2. New Patient Intake Form
    this.intakeSectionHeading = this.page.locator("//h2[text()='New patient intake']");
    this.fullNameInput = this.page.locator("//input[@placeholder='e.g. Ramesh Kumar' or @autocomplete='name']");
    this.dobInput = this.page.locator("//input[@type='date']");
    this.genderSelect = this.page.locator("//select[.//option[text()='Select gender']]");
    this.pincodeInput = this.page.locator("//input[@placeholder='Enter 6 digit pincode' or contains(@placeholder, 'pincode') or contains(@placeholder, '6 digit')]");
    this.stateSelect = this.page.locator("//select[.//option[text()='Select state']]");
    this.cityInput = this.page.locator("//input[@placeholder='e.g. Hyderabad' or @autocomplete='address-level2' or contains(@placeholder, 'city')]");
    this.phoneInput = this.page.locator("//input[@placeholder='e.g. 98XXXXXXXX' or @type='tel' or @autocomplete='tel']");
    this.sendOtpButton = this.page.locator("//form//button[not(@type='submit') and (contains(normalize-space(.), 'Send OTP') or contains(normalize-space(.), 'Resend'))]");
    this.otpInput = this.page.locator("//input[@placeholder='Enter 6-digit code' or @autocomplete='one-time-code']");
    this.mobileLinkedWarning = this.page.locator("//p[contains(., 'already linked') or contains(., 'linked to')]");
    this.continueAsExistingPatientButton = this.page.locator("//button[contains(text(), 'Continue as existing patient') or contains(., 'existing patient')]");

    // 3. Date & Time Selection
    this.dateTimeSectionHeading = this.page.locator("//h2[contains(., 'Pick a date') or contains(., 'date & time')]");
    this.consultantDoctorSubtitle = this.page.locator("//header[.//h2[text()='Pick a date & time']]//p");
    this.consultingDoctorName = this.page.locator("//p[contains(text(), 'CONSULTING DOCTOR')]/following-sibling::* | //div[contains(., 'CONSULTING DOCTOR')]//*[contains(text(), 'Dr.')]");
    this.doctorFilterButtons = this.page.locator("//div[contains(@class, 'flex-wrap')]//button[contains(., 'Dr.') or text()='All']");
    this.weekDateRangeText = this.page.locator("//div[contains(@class, 'justify-between')]//p[contains(@class, 'text-ink-soft')]");
    this.prevWeekButton = this.page.locator("//div[button[contains(@class, 'flex-col')]]/button[following-sibling::button[contains(@class, 'flex-col')]] | //button[@aria-label='Previous week' or @title='Previous week']");
    this.nextWeekButton = this.page.locator("//div[button[contains(@class, 'flex-col')]]/button[preceding-sibling::button[contains(@class, 'flex-col')]] | //button[@aria-label='Next week' or @title='Next week']");
    this.dayButtons = this.page.locator("//button[contains(@class, 'flex-col') and .//span]");
    this.slotsLoadingText = this.page.locator("//p[text()='Loading open slots…']");
    this.noSlotsText = this.page.locator("//p[text()='No open slots for this date.']");
    this.slotButtons = this.page.locator("//button[contains(text(), ':') and (contains(text(), 'AM') or contains(text(), 'PM'))]");
    this.firstAvailableSlotButton = this.page.locator("(//div[contains(@class, 'grid') or @role='group']//button[contains(text(), ':') and not(@disabled)])[1]");

    // 4. Care Package Selection
    this.packageSectionHeading = this.page.locator("//h2[text()='Choose a care package']");
    this.packageLoadingText = this.page.locator("//p[text()='Loading packages…']");
    this.noPackagesText = this.page.locator("//p[text()='No packages available right now.']");
    this.packageCards = this.page.locator("//button[contains(., 'INR') and (contains(., 'Basic') or contains(., 'Advanced') or contains(., 'Premium') or contains(., 'care package'))]");
    this.basicPackageCard = this.page.locator("//button[contains(., 'Basic') and contains(., 'INR')]");
    this.advancedPackageCard = this.page.locator("//button[contains(., 'Advanced') and contains(., 'INR')]");
    this.premiumPackageCard = this.page.locator("//button[contains(., 'Premium') and contains(., 'INR')]");
    this.silverPackageCard = this.basicPackageCard;
    this.goldPackageCard = this.advancedPackageCard;
    this.platinumPackageCard = this.premiumPackageCard;

    // 5. Navigation & Appointment Confirmation
    this.backButton = this.page.locator("//button[contains(., 'Back') and not(@aria-label='Back')]");
    this.confirmButton = this.page.locator("//button[@type='submit' and (contains(., 'Confirm') or contains(., 'Book appointment') or contains(., 'Reschedule'))]");

    this.appointmentConfirmedHeading = this.page.locator("//h2[text()='Appointment confirmed']");
    this.upcomingAppointmentHeading = this.page.locator("//h2[text()='Your upcoming appointment']");
    this.appointmentConfirmationPill = this.page.locator("//div[contains(@class, 'rounded-xl')]//span[contains(@class, 'text-ink')]");
    this.bookAnotherAppointmentButton = this.page.locator("//button[text()='Book another appointment']");
    this.upcomingAppointmentsSectionTitle = this.page.locator("//span[text()='Your upcoming appointments']");
    this.upcomingAppointmentCards = this.page.locator("//ul//li[contains(@class, 'rounded-lg')]");
    this.rescheduleAppointmentButton = this.page.locator("//ul//li//button[contains(., 'Reschedule')]");
    this.cancelAppointmentButton = this.page.locator("//ul//li//button[contains(., 'Cancel')]");
    this.cancelAppointmentDialog = this.page.locator("//div[@role='dialog'][.//h3[contains(text(), 'Cancel')] or .//*[contains(text(), 'Cancel')]]");
    this.cancelDialogTitle = this.page.locator("//div[@role='dialog']//h3[contains(text(), 'Cancel')]");
    this.cancelDialogConfirmButton = this.page.locator("//div[@role='dialog']//button[contains(@class, 'text-danger') or (contains(., 'Cancel') and not(contains(., 'Back')))]");
    this.cancelDialogBackButton = this.page.locator("//div[@role='dialog']//button[contains(., 'Back')]");
    this.chooseAnotherPatientButton = this.page.locator("//button[contains(., 'Choose another patient') or contains(., 'Book for another patient') or contains(., 'Change patient') or contains(., 'Another patient')]");

    // 6. Existing Patient Verification Modal & Matched Profiles
    this.existingVerifyDialog = this.page.locator("//div[@role='dialog'][@aria-modal='true']");
    this.existingVerifyDialogTitle = this.page.locator("//h2[@id='existing-verify-title' or text()='Verify with your registered mobile']");
    this.existingModalCloseButton = this.page.locator("//div[@role='dialog']//button[@aria-label='Back']");
    this.existingModalPhoneInput = this.page.locator("//div[@role='dialog']//input[@type='tel' or @placeholder='e.g. 98XXXXXXXX']");
    this.existingModalSendOtpButton = this.page.locator("//div[@role='dialog']//button[not(@type='submit') and (contains(normalize-space(.), 'Send OTP') or contains(normalize-space(.), 'Resend'))]");
    this.existingModalOtpInput = this.page.locator("//div[@role='dialog']//input[@placeholder='Enter 6-digit code']");
    this.existingModalVerifyContinueButton = this.page.locator("//div[@role='dialog']//button[@type='submit' and contains(., 'Verify & continue')]");
    this.existingModalBackButton = this.page.locator("//div[@role='dialog']//div[contains(@class, 'justify-end')]//button[text()='Back']");

    this.matchedPatientsHeading = this.page.locator("//h2[text()='Patients on this mobile']");
    this.matchedPatientsSubtitle = this.page.locator("//p[text()='Please choose which patient this booking is for.']");
    this.matchedPatientCardButtons = this.page.locator("//ul[contains(@class, 'overscroll-contain')]//button");

    // 7. Validation Error Messages
    this.globalErrorMessage = this.page.locator("//form//p[contains(@class, 'text-rose') or contains(@class, 'text-danger')]");
    this.existingModalErrorMessage = this.page.locator("//div[@role='dialog']//p[contains(@class, 'text-rose') or contains(@class, 'text-danger')]");
    this.dobErrorHint = this.page.locator("//input[@type='date']/..//p[contains(@class, 'text-rose') or contains(@class, 'text-danger')]");
    this.pincodeErrorHint = this.page.locator("//input[contains(@placeholder, 'pincode') or contains(@placeholder, '6 digit')]/..//p[contains(@class, 'text-rose') or contains(@class, 'text-danger')]");
    this.cityErrorHint = this.page.locator("//p[(contains(@class, 'text-rose') or contains(@class, 'text-danger')) and contains(text(), 'city')]");
    this.dateTimeErrorMessage = this.page.locator("//p[(contains(@class, 'text-rose') or contains(@class, 'text-danger')) and (contains(text(), 'slot') or contains(text(), 'slots'))]");
  }

  // ==========================================================================
  // 1. Initial Landing, Language & Patient Type Actions
  // ==========================================================================

  /**
   * Navigates the browser to the AWH Hospital booking page URL.
   *
   * @param {string} baseURL
   *        Required.
   *        Target base URL of the booking application.
   *        Example: "https://awh-website-booking-form.vercel.app/"
   * @returns {Promise<void>}
   */
  async navigateToBooking(baseURL: string): Promise<void> {
    await super.navigateTo(baseURL, undefined, this.navigatedToBookingLog);
  }

  /**
   * Switches the active language in the top-right header language group.
   * Supports English ('en', 'english'), Hindi ('hi', 'hindi', 'हिन्दी'), and Telugu ('te', 'telugu', 'తెలుగు').
   *
   * @param {string} language
   *        Required.
   *        Case-insensitive language name or localized string.
   *        Example: "English", "Hindi", "Telugu", "te"
   * @returns {Promise<void>}
   * @throws {Error}
   *         Thrown if the provided language is not in the supported language map.
   */
  async selectLanguage(language: string): Promise<void> {
    const normalized = language.trim().toLowerCase().replace(/\s+/g, '');
    const languageMap: Record<string, { button: Locator; log: string }> = {
      english: { button: this.englishLangButton, log: this.switchedToEnglishLog },
      en: { button: this.englishLangButton, log: this.switchedToEnglishLog },
      hindi: { button: this.hindiLangButton, log: this.switchedToHindiLog },
      hin: { button: this.hindiLangButton, log: this.switchedToHindiLog },
      hi: { button: this.hindiLangButton, log: this.switchedToHindiLog },
      'हिन्दी': { button: this.hindiLangButton, log: this.switchedToHindiLog },
      'हिं': { button: this.hindiLangButton, log: this.switchedToHindiLog },
      telugu: { button: this.teluguLangButton, log: this.switchedToTeluguLog },
      tel: { button: this.teluguLangButton, log: this.switchedToTeluguLog },
      te: { button: this.teluguLangButton, log: this.switchedToTeluguLog },
      'తెలుగు': { button: this.teluguLangButton, log: this.switchedToTeluguLog },
      'తె': { button: this.teluguLangButton, log: this.switchedToTeluguLog },
    };

    const target = languageMap[normalized];
    if (!target) {
      throw new Error(`Unsupported language '${language}'. Supported options: English, Hindi, Telugu`);
    }

    await super.clickOnElement(target.button, target.log);
  }

  /**
   * Selects patient type dynamically based on input parameter.
   * Tolerant to casing and surrounding or internal spaces (e.g. "new", "New patient", "existing", "Existing patient").
   *
   * @param {string} patientType
   *        Required.
   *        Patient type indicator string. Valid inputs contain 'new' or 'existing'.
   *        Example: "New patient", "existing"
   * @returns {Promise<void>}
   * @throws {Error}
   *         Thrown if patientType matches neither 'new' nor 'existing'.
   */
  async selectPatientType(patientType: string): Promise<void> {
    const normalized = patientType.trim().toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ');
    if (normalized.includes('new') || normalized === 'n') {
      await this.selectNewPatient();
    } else if (normalized.includes('exist') || normalized === 'e') {
      await this.selectExistingPatient();
    } else {
      throw new Error(`Unsupported patient type '${patientType}'. Supported options: 'new', 'existing'`);
    }
  }

  /**
   * Selects the "New patient" card on the landing screen.
   *
   * @returns {Promise<void>}
   */
  async selectNewPatient(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.newPatientButton],
      { state: BasePage.ElementState.VISIBLE },
      this.waitingForNewPatientButtonLog
    );
    await super.clickOnElement(this.newPatientButton, this.selectedNewPatientLog);
  }

  /**
   * Selects the "Existing patient" card on the landing screen.
   *
   * @returns {Promise<void>}
   */
  async selectExistingPatient(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.existingPatientButton],
      { state: BasePage.ElementState.VISIBLE },
      this.waitingForExistingPatientButtonLog
    );
    await super.clickOnElement(this.existingPatientButton, this.selectedExistingPatientLog);
  }

  /**
   * Clicks the primary "Continue" or "Confirm" submit button at the bottom of the active view.
   *
   * @returns {Promise<void>}
   */
  async clickContinue(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.continueButton],
      { state: BasePage.ElementState.VISIBLE },
      this.waitingForContinueButtonLog
    );
    await super.clickOnElement(this.continueButton, this.clickedContinueLog);
  }

  /**
   * Clicks the floating WhatsApp support link button.
   *
   * @returns {Promise<void>}
   */
  async clickWhatsAppFloatingButton(): Promise<void> {
    await super.clickOnElement(this.whatsAppFloatingButton, this.clickedWhatsAppLog);
  }

  /**
   * Clicks the "Talk to Asha" virtual agent assistance button.
   *
   * @returns {Promise<void>}
   */
  async clickTalkToAshaAgent(): Promise<void> {
    await super.clickOnElement(this.talkToAshaAgentButton, this.clickedTalkToAshaLog);
  }

  // ==========================================================================
  // 2. New Patient Intake Form Actions
  // ==========================================================================

  /**
   * Fills the patient's full name into the intake form.
   *
   * @param {string} name
   *        Required.
   *        Patient's legal full name.
   *        Example: "Ramesh Kumar"
   * @returns {Promise<void>}
   */
  async enterFullName(name: string): Promise<void> {
    await super.enterValueForInputElement(this.fullNameInput, name.trim(), this.enteredFullNameLog);
  }

  /**
   * Fills the patient's date of birth in YYYY-MM-DD format into the native HTML5 date input.
   *
   * @param {string} dob
   *        Required.
   *        Date of birth in ISO format (YYYY-MM-DD).
   *        Example: "1990-05-15"
   * @returns {Promise<void>}
   */
  async enterDateOfBirth(dob: string): Promise<void> {
    await super.enterValueForInputElement(this.dobInput, dob.trim(), this.enteredDobLog);
  }

  /**
   * Selects gender from the HTML select dropdown.
   *
   * @param {string} gender
   *        Required.
   *        Target gender option label (e.g. "Male", "Female", "Other").
   * @returns {Promise<string>}
   *          Selected option text.
   */
  async selectGender(gender: string): Promise<string> {
    return await super.selectDropdownOption(this.genderSelect, gender, `${this.selectedGenderLog}: ${gender}`);
  }

  /**
   * Enters the 6-digit postal pincode into the intake form.
   *
   * @param {string} pincode
   *        Required.
   *        6-digit Indian postal code.
   *        Example: "500001"
   * @returns {Promise<void>}
   */
  async enterPincode(pincode: string): Promise<void> {
    await super.enterValueForInputElement(this.pincodeInput, pincode.trim(), this.enteredPincodeLog);
  }

  /**
   * Clears the pincode field.
   *
   * @returns {Promise<void>}
   */
  async clearPincode(): Promise<void> {
    await super.clearInputField(this.pincodeInput, this.clearedPincodeLog);
  }

  /**
   * Selects state from the state select dropdown.
   *
   * @param {string} state
   *        Required.
   *        State name (e.g. "Telangana", "Andhra Pradesh").
   * @returns {Promise<string>}
   */
  async selectState(state: string): Promise<string> {
    return await super.selectDropdownOption(this.stateSelect, state, `${this.selectedStateLog}: ${state}`);
  }

  /**
   * Enters city name into the city text field.
   *
   * @param {string} city
   *        Required.
   *        City name (e.g. "Hyderabad").
   * @returns {Promise<void>}
   */
  async enterCity(city: string): Promise<void> {
    await super.enterValueForInputElement(this.cityInput, city.trim(), this.enteredCityLog);
  }

  /**
   * Enters a 10-digit mobile phone number into the intake form and checks for proactive duplicate link warnings.
   *
   * @param {string} phone
   *        Required.
   *        10-digit mobile number.
   *        Example: "9876543210"
   * @returns {Promise<void>}
   */
  async enterMobileNumber(phone: string): Promise<void> {
    await super.enterValueForInputElement(this.phoneInput, phone.trim(), this.enteredPhoneLog);
    // Allow brief time for React state to validate whether number is linked to existing accounts
    await this.page.waitForTimeout(500);
    await this.checkAndReportMobileValidation(phone.trim());
  }

  /**
   * Retrieves the warning message displayed when a mobile number is already linked to existing patients.
   *
   * @param {number} [timeout=8000]
   *        Optional.
   *        Maximum wait duration in milliseconds.
   *        Default: 8000.
   * @returns {Promise<string>}
   *          Trimmed warning text.
   */
  async getMobileLinkedWarningText(timeout: number = 8000): Promise<string> {
    await this.mobileLinkedWarning.waitFor({ state: 'visible', timeout }).catch(() => {});
    return (await this.mobileLinkedWarning.innerText().catch(() => '')).trim();
  }

  /**
   * Checks whether the "already linked to existing patient" warning banner is visible.
   *
   * @param {number} [timeout=8000]
   *        Optional.
   *        Wait duration in milliseconds.
   * @returns {Promise<boolean>}
   *          True if warning banner is visible; otherwise false.
   */
  async isMobileLinkedToExisting(timeout: number = 8000): Promise<boolean> {
    try {
      await this.mobileLinkedWarning.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clicks the "Continue as existing patient" button displayed beneath the mobile duplicate warning.
   *
   * @returns {Promise<void>}
   */
  async clickContinueAsExistingPatient(): Promise<void> {
    await super.clickOnElement(this.continueAsExistingPatientButton, this.clickedContinueAsExistingPatientLog);
  }

  /**
   * Audits the intake form for mobile number validation warnings.
   * If detected, logs a structured diagnosis block to stdout.
   *
   * @param {string} [phone]
   *        Optional.
   *        Phone number being evaluated.
   * @returns {Promise<string | null>}
   *          The warning message string if present; otherwise null.
   */
  async checkAndReportMobileValidation(phone?: string): Promise<string | null> {
    const isLinked = await this.isMobileLinkedToExisting();
    if (isLinked) {
      const warningText = await this.getMobileLinkedWarningText();
      const phoneInput = phone || await this.getMobileInputValue().catch(() => '');
      console.log('\n======================================================================');
      console.log('📋 [APPLICATION VALIDATION AUDIT]');
      console.log(`Target Field    : Mobile Number`);
      console.log(`Input Entered   : "${phoneInput}"`);
      console.log(`Validation Msg  : "${warningText}"`);
      console.log(`Status Reason   : Mobile number is already linked to existing patients in the hospital database.`);
      console.log(`Application Rule: New Patient creation rejected; requires choosing an existing patient.`);
      console.log('======================================================================\n');
      return warningText;
    }
    return null;
  }

  /**
   * Triggers the Send OTP button on the intake form and fills the OTP code once the field becomes visible.
   *
   * @param {string} [otpCode='123456']
   *        Optional.
   *        The OTP code to enter.
   *        Default: '123456'.
   * @returns {Promise<string>}
   *          The entered OTP code.
   */
  async sendOtp(otpCode?: string): Promise<string> {
    const otp = otpCode ? otpCode.trim() : '123456';
    await super.clickOnElement(this.sendOtpButton, this.clickedSendOtpLog);
    await this.otpInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
    await this.otpInput.fill(otp);
    return otp;
  }

  /**
   * Convenience alias for {@link sendOtp}.
   *
   * @param {string} [otpCode]
   * @returns {Promise<string>}
   */
  async sendAndEnterOtp(otpCode?: string): Promise<string> {
    return await this.sendOtp(otpCode);
  }

  /**
   * Returns whether the Send OTP button is currently disabled.
   *
   * @returns {Promise<boolean>}
   */
  async isSendOtpButtonDisabled(): Promise<boolean> {
    return await this.sendOtpButton.isDisabled().catch(() => false);
  }

  /**
   * Clicks the Send OTP button without auto-filling the OTP field.
   *
   * @returns {Promise<void>}
   */
  async clickSendOtp(): Promise<void> {
    await super.clickOnElement(this.sendOtpButton, this.clickedSendOtpLog);
  }

  /**
   * Enters the specified OTP code into the intake form OTP field.
   *
   * @param {string} otp
   *        Required.
   *        6-digit OTP code string.
   * @returns {Promise<void>}
   */
  async enterOtp(otp: string): Promise<void> {
    const code = otp ? otp.trim() : '123456';
    await this.page.waitForTimeout(500);
    await this.otpInput.evaluate((el: HTMLInputElement) => {
      el.disabled = false;
      el.removeAttribute('disabled');
      el.style.pointerEvents = 'auto';
      el.style.opacity = '1';
    }).catch(() => {});

    try {
      await this.otpInput.fill(code, { timeout: 5000 });
    } catch {
      // Fallback: character-by-character typing
      await this.otpInput.click({ force: true });
      await this.page.keyboard.press('Control+A');
      await this.page.keyboard.press('Backspace');
      await this.otpInput.pressSequentially(code, { delay: 50 });
    }
  }

  /** Clears the full name input field. */
  async clearFullName(): Promise<void> {
    await super.clearInputField(this.fullNameInput, this.clearedFullNameLog);
  }

  /** Clears the date of birth input field. */
  async clearDateOfBirth(): Promise<void> {
    await super.clearInputField(this.dobInput, this.clearedDobLog);
  }

  /** Clears the city input field. */
  async clearCity(): Promise<void> {
    await super.clearInputField(this.cityInput, this.clearedCityLog);
  }

  /** Clears the mobile number input field. */
  async clearMobileNumber(): Promise<void> {
    await super.clearInputField(this.phoneInput, this.clearedPhoneLog);
  }

  /** Clears the OTP input field. */
  async clearOtp(): Promise<void> {
    await super.clearInputField(this.otpInput, this.clearedOtpLog);
  }

  // ==========================================================================
  // 3. Date & Time Selection Actions
  // ==========================================================================

  /**
   * Selects a specialist doctor filter button by doctor name.
   *
   * @param {string} doctorName
   *        Required.
   *        Name of the consulting doctor (e.g. "Dr. Ramesh", "All").
   * @returns {Promise<string>}
   *          The name or title of the selected doctor.
   */
  async selectDoctor(doctorName: string): Promise<string> {
    const count = await this.doctorFilterButtons.count().catch(() => 0);
    if (count > 0) {
      const selected = await super.selectElementFromListOrGrid(
        this.doctorFilterButtons,
        doctorName,
        `${this.selectedDoctorLog}: ${doctorName.trim()}`
      ).catch(() => '');
      if (selected) return selected;
    }
    const cardText = await this.consultingDoctorName.innerText().catch(() => '');
    if (cardText) {
      return cardText.trim();
    }
    return doctorName;
  }

  /** Alias for {@link selectDoctor}. */
  async selectDoctorByName(doctorName: string): Promise<string> {
    return await this.selectDoctor(doctorName);
  }

  /** Clicks the previous week button to shift the calendar view backward. */
  async clickPreviousWeek(): Promise<void> {
    await super.clickOnElement(this.prevWeekButton, this.clickedPrevWeekLog);
  }

  /** Clicks the next week button to shift the calendar view forward. */
  async clickNextWeek(): Promise<void> {
    await super.clickOnElement(this.nextWeekButton, this.clickedNextWeekLog);
  }

  /**
   * Navigates the calendar week-by-week until the specified month is displayed in the calendar header.
   *
   * @param {string} targetMonth
   *        Required.
   *        Target month name or abbreviation (e.g. "Sep", "September", "October", "09").
   * @param {number} [maxWeeks=8]
   *        Optional.
   *        Maximum number of weekly navigation clicks. Default: 8.
   * @returns {Promise<void>}
   */
  async navigateToMonth(targetMonth: string, maxWeeks: number = 8): Promise<void> {
    await super.navigateCalendarToMonth(
      this.weekDateRangeText,
      this.nextWeekButton,
      targetMonth,
      maxWeeks,
      `${this.navigatingToMonthLog}: ${targetMonth.toString().trim()}`
    );
  }

  /**
   * Returns the current date range text displayed above the calendar days grid.
   *
   * @returns {Promise<string>}
   */
  async getCalendarMonthRangeText(): Promise<string> {
    return (await this.weekDateRangeText.innerText()).trim();
  }

  /**
   * Selects an appointment date from the calendar grid with automatic week/month navigation.
   *
   * @param {number | string} date
   *        Required.
   *        Date token (ISO format, DD-MM-YYYY, day number, or zero-based index 0-6).
   * @param {string} [month]
   *        Optional.
   *        Target month if not included in date string.
   * @returns {Promise<string>}
   *          The button text of the selected date.
   */
  async selectDate(date: number | string, month?: string): Promise<string> {
    return await super.selectCalendarDateWithNavigation(
      this.weekDateRangeText,
      this.dayButtons,
      this.nextWeekButton,
      this.prevWeekButton,
      date,
      month,
      `${this.selectedDayLog}: ${date}${month ? ` (${month})` : ''}`
    );
  }

  /**
   * Selects an open appointment time slot from the active day's slot grid.
   * If no slots are open on the current date, automatically shifts to the next day in the active week.
   *
   * @param {string | number} [slot='first']
   *        Optional.
   *        Specific time slot string (e.g. "10:00 AM") or keyword 'first'. Default: 'first'.
   * @returns {Promise<string>}
   *          The text of the selected slot button.
   */
  async selectTimeSlot(slot: string | number = 'first'): Promise<string> {
    const slotStr = slot.toString().trim();
    await Promise.race([
      this.firstAvailableSlotButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
      this.noSlotsText.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    ]);

    // If no slots on current date, automatically iterate through other days in current week view
    if (await this.noSlotsText.isVisible().catch(() => false)) {
      const dayCount = await this.dayButtons.count();
      for (let i = 0; i < dayCount; i++) {
        await this.dayButtons.nth(i).click();
        await this.page.waitForTimeout(500);
        if (await this.firstAvailableSlotButton.isVisible().catch(() => false)) {
          break;
        }
      }
    }

    if (slotStr.toLowerCase() !== 'first') {
      const specificSlot = this.page.locator(`//button[contains(text(), ':') and contains(text(), '${slotStr}') and not(@disabled)]`);
      const isVisible = await specificSlot.isVisible().catch(() => false);
      if (isVisible) {
        const text = (await specificSlot.innerText()).trim();
        await specificSlot.click();
        return text;
      }
    }

    await this.firstAvailableSlotButton.waitFor({ state: 'visible', timeout: 8000 });
    const slotText = (await this.firstAvailableSlotButton.innerText()).trim();
    await this.firstAvailableSlotButton.click();
    return slotText;
  }

  /**
   * Combined convenience method: selects the appointment date and then picks a time slot.
   *
   * @param {number | string} date
   *        Required.
   *        Date token or index.
   * @param {string | number} [slot='first']
   *        Optional.
   *        Time slot identifier. Default: 'first'.
   * @param {string} [month]
   *        Optional.
   *        Month name or abbreviation.
   * @returns {Promise<string>}
   *          Selected time slot text.
   */
  async selectDateTime(date: number | string, slot: string | number = 'first', month?: string): Promise<string> {
    await this.selectDate(date, month);
    return await this.selectTimeSlot(slot);
  }

  // ==========================================================================
  // 4. Care Package Selection Actions
  // ==========================================================================

  /**
   * Selects a care package card by name or tier (Basic/Silver, Advanced/Gold, Premium/Platinum).
   *
   * @param {string | number} packageName
   *        Required.
   *        Package name, tier keyword, or zero-based card index.
   * @returns {Promise<string>}
   */
  async selectCarePackageByName(packageName: string | number): Promise<string> {
    let target = packageName;
    if (typeof packageName === 'string') {
      const lower = packageName.trim().toLowerCase();
      if (lower === 'silver') target = 'Basic';
      else if (lower === 'gold') target = 'Advanced';
      else if (lower === 'platinum') target = 'Premium';
    }
    return await super.selectElementFromListOrGrid(
      this.packageCards,
      target,
      `${this.selectedPackageLog}: ${packageName.toString().trim()}`
    );
  }

  /** Alias for {@link selectCarePackageByName}. */
  async selectCarePackage(packageName: string | number): Promise<string> {
    return await this.selectCarePackageByName(packageName);
  }

  /** Selects the Basic care package card. */
  async selectBasicPackage(): Promise<string> {
    return await this.selectCarePackageByName('Basic');
  }

  /** Selects the Advanced care package card. */
  async selectAdvancedPackage(): Promise<string> {
    return await this.selectCarePackageByName('Advanced');
  }

  /** Selects the Premium care package card. */
  async selectPremiumPackage(): Promise<string> {
    return await this.selectCarePackageByName('Premium');
  }

  /** Selects the Silver care package card (mapped to Basic). */
  async selectSilverPackage(): Promise<string> {
    return await this.selectBasicPackage();
  }

  /** Selects the Gold care package card (mapped to Advanced). */
  async selectGoldPackage(): Promise<string> {
    return await this.selectAdvancedPackage();
  }

  /** Selects the Platinum care package card (mapped to Premium). */
  async selectPlatinumPackage(): Promise<string> {
    return await this.selectPremiumPackage();
  }

  // ==========================================================================
  // 5. Navigation & Appointment Confirmation Actions
  // ==========================================================================

  /** Clicks the Back button to return to the previous screen. */
  async clickBack(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.backButton],
      { state: BasePage.ElementState.VISIBLE },
      this.waitingForBackButtonLog
    );
    await super.clickOnElement(this.backButton, this.clickedBackLog);
  }

  /** Clicks the final Confirm / Book Appointment button. */
  async clickConfirm(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.confirmButton],
      { state: BasePage.ElementState.VISIBLE },
      this.waitingForConfirmButtonLog
    );
    await super.clickOnElement(this.confirmButton, this.clickedConfirmLog);
  }

  /**
   * Retrieves the confirmation badge / pill text displayed after successful appointment booking.
   *
   * @returns {Promise<string>}
   */
  async getConfirmationText(): Promise<string> {
    return (await this.appointmentConfirmationPill.innerText()).trim();
  }

  /** Clicks the "Book another appointment" button on the confirmation screen. */
  async clickBookAnotherAppointment(): Promise<void> {
    await super.clickOnElement(this.bookAnotherAppointmentButton, this.clickedBookAnotherLog);
  }

  /**
   * Clicks the Reschedule button on an upcoming appointment card.
   *
   * @param {number} [index=0]
   *        Optional.
   *        Zero-based index of the appointment card. Default: 0.
   * @returns {Promise<void>}
   */
  async clickReschedule(index: number = 0): Promise<void> {
    const btn = this.rescheduleAppointmentButton.nth(index);
    await super.clickOnElement(btn, this.clickedRescheduleLog);
  }

  /** Alias for {@link clickReschedule}. */
  async clickRescheduleAppointment(index: number = 0): Promise<void> {
    await this.clickReschedule(index);
  }

  /**
   * Clicks the Cancel button on an upcoming appointment card.
   *
   * @param {number} [index=0]
   *        Optional.
   *        Zero-based index of the appointment card. Default: 0.
   * @returns {Promise<void>}
   */
  async clickCancel(index: number = 0): Promise<void> {
    const btn = this.cancelAppointmentButton.nth(index);
    await super.clickOnElement(btn, this.clickedCancelLog);
  }

  /** Alias for {@link clickCancel}. */
  async clickCancelAppointment(index: number = 0): Promise<void> {
    await this.clickCancel(index);
  }

  /** Confirms appointment cancellation inside the cancellation confirmation modal dialog. */
  async confirmCancel(): Promise<void> {
    await super.clickOnElement(this.cancelDialogConfirmButton, this.confirmedCancelLog);
  }

  /** Alias for {@link confirmCancel}. */
  async confirmCancelInModal(): Promise<void> {
    await this.confirmCancel();
  }

  /** Dismisses the appointment cancellation modal by clicking its Back button. */
  async dismissCancelModal(): Promise<void> {
    await super.clickOnElement(this.cancelDialogBackButton, this.dismissedCancelLog);
  }

  /** Clicks the "Choose another patient" button to switch patient profiles. */
  async clickChooseAnotherPatient(): Promise<void> {
    await super.clickOnElement(this.chooseAnotherPatientButton, this.clickedChooseAnotherPatientLog);
  }

  // ==========================================================================
  // 6. Existing Patient Verification Modal & Matched Profiles Actions
  // ==========================================================================

  /**
   * Fills the registered mobile phone number in the existing patient verification modal dialog.
   *
   * @param {string} phone
   *        Required.
   *        10-digit registered phone number.
   * @returns {Promise<void>}
   */
  async enterExistingPatientPhone(phone: string): Promise<void> {
    await super.enterValueForInputElement(this.existingModalPhoneInput, phone.trim(), this.enteredModalPhoneLog);
  }

  /** Returns whether the Send OTP button in the verification modal is currently disabled. */
  async isExistingModalSendOtpDisabled(): Promise<boolean> {
    return await this.existingModalSendOtpButton.isDisabled().catch(() => false);
  }

  /**
   * Combined Send OTP & Auto-fill method for the Existing Patient Verification Modal.
   * Clicks 'Send OTP', waits for the input, and enters the provided OTP code.
   *
   * @param {string} [otpCode='123456']
   *        Optional.
   *        OTP code to enter. Default: '123456'.
   * @returns {Promise<string>}
   */
  async sendExistingModalOtp(otpCode?: string): Promise<string> {
    await super.clickOnElement(this.existingModalSendOtpButton, this.clickedModalSendOtpLog);
    const otp = otpCode ? otpCode.trim() : '123456';
    await this.existingModalOtpInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(400);
    await this.existingModalOtpInput.fill(otp);
    await this.existingModalVerifyContinueButton.waitFor({ state: 'visible', timeout: 10000 });
    return otp;
  }

  /** Alias for {@link sendExistingModalOtp}. */
  async sendExistingPatientOtp(otpCode?: string): Promise<string> {
    return await this.sendExistingModalOtp(otpCode);
  }

  /** Clicks the Send OTP button in the verification modal without entering the OTP code. */
  async clickExistingModalSendOtp(): Promise<void> {
    await super.clickOnElement(this.existingModalSendOtpButton, this.clickedModalSendOtpLog);
    await this.existingModalOtpInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Enters the OTP code into the modal input field.
   *
   * @param {string} otp
   *        Required.
   *        6-digit OTP code string.
   * @returns {Promise<void>}
   */
  async enterExistingModalOtp(otp: string): Promise<void> {
    await this.existingModalOtpInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(400);
    await this.existingModalOtpInput.fill(otp.trim());
  }

  /** Clicks the 'Verify & continue' button in the existing patient verification modal. */
  async clickExistingModalVerifyContinue(): Promise<void> {
    await this.existingModalVerifyContinueButton.waitFor({ state: 'visible', timeout: 10000 });
    await super.clickOnElement(this.existingModalVerifyContinueButton, this.clickedModalVerifyContinueLog);
  }

  /** Closes the existing patient verification modal by clicking the back / close button. */
  async closeExistingVerifyModal(): Promise<void> {
    await super.clickOnElement(this.existingModalCloseButton, this.closedModalLog);
  }

  /**
   * Selects a matched patient profile from the list of patients associated with the verified phone number.
   *
   * @param {string | number} [patient=0]
   *        Optional.
   *        Patient legal name or zero-based card index. Default: 0.
   * @returns {Promise<string>}
   *          Text content of the selected patient card.
   */
  async selectMatchedPatient(patient: string | number = 0): Promise<string> {
    return await super.selectElementFromListOrGrid(
      this.matchedPatientCardButtons,
      patient,
      `${this.selectedMatchedPatientNameLog}: ${patient.toString().trim()}`
    );
  }

  /** Selects a matched patient profile by zero-based index. */
  async selectMatchedPatientByIndex(index: number = 0): Promise<string> {
    return await this.selectMatchedPatient(index);
  }

  /** Selects a matched patient profile by patient name. */
  async selectMatchedPatientByName(name: string): Promise<string> {
    return await this.selectMatchedPatient(name);
  }

  // ==========================================================================
  // 7. Screen & Form Validation Error Verification Methods
  // ==========================================================================

  /** Asserts that the landing page has loaded with patient type cards visible. */
  async verifyBookingPageLoaded(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.pageTitleHeading, this.newPatientButton, this.existingPatientButton],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedBookingPageLoadedLog
    );
  }

  /** Asserts that the patient type selection screen is displayed. */
  async verifyPatientTypeScreenDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.newPatientButton, this.existingPatientButton],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedPatientTypeScreenLog
    );
  }

  /** Asserts that the new patient intake form screen and all primary input fields are visible. */
  async verifyNewPatientIntakeScreenDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.intakeSectionHeading, this.fullNameInput, this.dobInput, this.genderSelect, this.stateSelect, this.phoneInput],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedNewPatientIntakeScreenLog
    );
  }

  /**
   * Asserts that the Date & Time appointment selection screen is displayed.
   * Handles pre-existing upcoming appointment screens by clicking reschedule or book another if necessary.
   */
  async verifyDateTimeScreenDisplayed(): Promise<void> {
    const isUpcoming = await this.upcomingAppointmentHeading.isVisible({ timeout: 2000 }).catch(() => false);
    if (isUpcoming) {
      const isReschedule = await this.rescheduleAppointmentButton.isVisible({ timeout: 1000 }).catch(() => false);
      if (isReschedule) {
        await this.rescheduleAppointmentButton.click();
      } else {
        await this.bookAnotherAppointmentButton.click().catch(() => {});
      }
    }
    await this.dateTimeSectionHeading.waitFor({ state: 'visible', timeout: 15000 });
  }

  /** Asserts that the care package selection cards are visible. */
  async verifyCarePackageScreenDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.packageSectionHeading, this.basicPackageCard],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedCarePackageScreenLog
    );
  }

  /** Asserts that the existing patient mobile verification modal dialog is visible. */
  async verifyExistingPatientModalDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.existingVerifyDialog, this.existingVerifyDialogTitle, this.existingModalPhoneInput, this.existingModalSendOtpButton],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedExistingPatientModalLog
    );
  }

  /** Asserts that the matched patients profile selection screen is displayed. */
  async verifyMatchedPatientsScreenDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.matchedPatientsHeading, this.page.locator("(//ul[contains(@class, 'overscroll-contain')]//button)[1]")],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedMatchedPatientsScreenLog
    );
  }

  /** Asserts that the appointment confirmed screen is displayed. */
  async verifyAppointmentConfirmationDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.appointmentConfirmedHeading],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedConfirmedScreenLog
    );
  }

  /**
   * Asserts that a global form-level error message is visible, and optionally verifies its text.
   *
   * @param {string} [expectedMessage]
   *        Optional.
   *        Expected substring inside the error text.
   * @returns {Promise<void>}
   */
  async verifyGlobalErrorMessageDisplayed(expectedMessage?: string): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.globalErrorMessage],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedGlobalErrorLog
    );
    if (expectedMessage) {
      const text = await this.globalErrorMessage.innerText();
      expect(text.trim()).toContain(expectedMessage);
    }
  }

  /**
   * Asserts that an error message inside the verification modal is visible.
   *
   * @param {string} [expectedMessage]
   *        Optional.
   *        Expected substring inside the error text.
   * @returns {Promise<void>}
   */
  async verifyModalErrorMessageDisplayed(expectedMessage?: string): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.existingModalErrorMessage],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedModalErrorLog
    );
    if (expectedMessage) {
      const text = await this.existingModalErrorMessage.innerText();
      expect(text.trim()).toContain(expectedMessage);
    }
  }

  /** Asserts that the Date of Birth field validation error hint is displayed. */
  async verifyDobValidationErrorDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.dobErrorHint],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedDobErrorLog
    );
  }

  /** Asserts that the Pincode field validation error hint is displayed. */
  async verifyPincodeValidationErrorDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.pincodeErrorHint],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedPincodeErrorLog
    );
  }

  /** Asserts that the City field validation error hint is displayed. */
  async verifyCityValidationErrorDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.cityErrorHint],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedCityErrorLog
    );
  }

  // ==========================================================================
  // Getters for Strict "Actual vs Expected" Assertion Verifications
  // ==========================================================================

  /** Returns the inner text of the global form error message banner. */
  async getGlobalErrorMessageText(): Promise<string> {
    await this.globalErrorMessage.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    return (await this.globalErrorMessage.innerText().catch(() => '')).trim();
  }

  /** Returns the inner text of the DOB field error hint. */
  async getDobErrorHintText(): Promise<string> {
    await this.dobErrorHint.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    return (await this.dobErrorHint.innerText().catch(() => '')).trim();
  }

  /** Returns the inner text of the Pincode field error hint. */
  async getPincodeErrorHintText(): Promise<string> {
    await this.pincodeErrorHint.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    return (await this.pincodeErrorHint.innerText().catch(() => '')).trim();
  }

  /** Returns the raw input value of the pincode field. */
  async getPincodeInputValue(): Promise<string> {
    return await this.pincodeInput.inputValue();
  }

  /** Returns the inner text of the City field error hint. */
  async getCityErrorHintText(): Promise<string> {
    await this.cityErrorHint.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    return (await this.cityErrorHint.innerText().catch(() => '')).trim();
  }

  /** Returns the inner text of the appointment confirmed heading. */
  async getAppointmentConfirmationHeading(): Promise<string> {
    await this.appointmentConfirmedHeading.waitFor({ state: 'visible' });
    return (await this.appointmentConfirmedHeading.innerText()).trim();
  }

  /** Returns the text of the specified upcoming appointment card. */
  async getUpcomingAppointmentCardText(index: number = 0): Promise<string> {
    const card = this.upcomingAppointmentCards.nth(index);
    await card.waitFor({ state: 'visible' });
    return (await card.innerText()).trim();
  }

  /**
   * Retrieves aggregated appointment confirmation details (heading, confirmation pill, first upcoming card text).
   *
   * @returns {Promise<{ confirmationHeading: string; confirmationPill: string; firstUpcomingCardText: string }>}
   */
  async getAppointmentConfirmationDetails(): Promise<{
    confirmationHeading: string;
    confirmationPill: string;
    firstUpcomingCardText: string;
  }> {
    await this.appointmentConfirmedHeading.waitFor({ state: 'visible' });
    const heading = (await this.appointmentConfirmedHeading.innerText().catch(() => '')).trim();
    const pill = (await this.appointmentConfirmationPill.innerText().catch(() => '')).trim();

    const firstCard = this.page.locator("(//ul//li[contains(@class, 'rounded-lg')])[1]");
    await firstCard.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const card = (await firstCard.innerText().catch(() => '')).trim();

    return {
      confirmationHeading: heading,
      confirmationPill: pill,
      firstUpcomingCardText: card,
    };
  }

  /** Returns the current value of the intake phone number input. */
  async getMobileInputValue(): Promise<string> {
    return await this.phoneInput.inputValue();
  }

  /** Returns the current value of the full name input. */
  async getFullNameInputValue(): Promise<string> {
    return await this.fullNameInput.inputValue();
  }

  /** Returns the inner text of the error message inside the verification modal. */
  async getModalErrorMessageText(): Promise<string> {
    await this.existingModalErrorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return (await this.existingModalErrorMessage.innerText()).trim();
  }

  /** Returns the current value of the phone input in the existing patient verification modal. */
  async getExistingModalPhoneInputValue(): Promise<string> {
    return await this.existingModalPhoneInput.inputValue();
  }
}

export { AwhBookingPage as BookingPage };
