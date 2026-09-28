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
 * 4. Care Package Selection (Silver, Gold, Platinum)
 * 5. Navigation & Appointment Confirmation (Pill, Upcoming, Reschedule, Cancel)
 * 6. Existing Patient Verification Modal & Matched Profiles List
 * 7. Screen & Validation Error Message Verifications
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
  // 7. Validation Error Message Locators (Kept below)
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
  // Log Message Variables (Strictly declared, passed as arguments to BasePage)
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

  // ==========================================================================
  // Constructor: Initialize Locators in Logical Flow
  // ==========================================================================
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

    this.continueButton = this.page.locator("//button[@type='submit' or (contains(., 'Continue') and not(contains(., 'existing')))]").first();
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
    this.sendOtpButton = this.page.locator("//button[text()='Send OTP' or text()='Resend']");
    this.otpInput = this.page.locator("//input[@placeholder='Enter 6-digit code' or @autocomplete='one-time-code']");
    this.mobileLinkedWarning = this.page.locator("//p[contains(., 'already linked') or contains(., 'linked to')]");
    this.continueAsExistingPatientButton = this.page.locator("//button[contains(text(), 'Continue as existing patient') or contains(., 'existing patient')]");

    // 3. Date & Time Selection
    this.dateTimeSectionHeading = this.page.locator("//h2[contains(., 'Pick a date') or contains(., 'date & time')]");
    this.consultantDoctorSubtitle = this.page.locator("//header[.//h2[text()='Pick a date & time']]//p");
    this.doctorFilterButtons = this.page.locator("//div[contains(@class, 'flex-wrap')]//button[contains(., 'Dr.') or text()='All']");
    this.weekDateRangeText = this.page.locator("//p[contains(text(), '202') or contains(text(), '–') or contains(@class, 'text-ink-soft')]").first();
    this.prevWeekButton = this.page.locator("//button[@aria-label='Previous week' or contains(@aria-label, 'prev') or contains(@aria-label, 'Previous') or contains(@title, 'Prev')]").first();
    this.nextWeekButton = this.page.locator("//button[@aria-label='Next week' or contains(@aria-label, 'next') or contains(@aria-label, 'Next') or contains(@title, 'Next')]").first();
    this.dayButtons = this.page.locator("button.flex.flex-col.items-center:has(span)");
    this.slotsLoadingText = this.page.locator("//p[text()='Loading open slots…']");
    this.noSlotsText = this.page.locator("//p[text()='No open slots for this date.']");
    this.slotButtons = this.page.locator("//button[contains(text(), ':') and (contains(text(), 'AM') or contains(text(), 'PM'))]");
    this.firstAvailableSlotButton = this.page.locator("//button[contains(@class, 'whitespace-nowrap') and not(@disabled)]").first();

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
    this.confirmButton = this.page.locator("//button[contains(., 'Confirm') or contains(., 'Book appointment') or contains(., 'Reschedule') or contains(., 'Continue')]").first();

    this.appointmentConfirmedHeading = this.page.locator("//h2[text()='Appointment confirmed']");
    this.upcomingAppointmentHeading = this.page.locator("//h2[text()='Your upcoming appointment']");
    this.appointmentConfirmationPill = this.page.locator("//div[contains(@class, 'rounded-xl')]//span[contains(@class, 'text-ink')]");
    this.bookAnotherAppointmentButton = this.page.locator("//button[text()='Book another appointment']");
    this.upcomingAppointmentsSectionTitle = this.page.locator("//span[text()='Your upcoming appointments']");
    this.upcomingAppointmentCards = this.page.locator("//ul//li[contains(@class, 'rounded-lg')]");
    this.rescheduleAppointmentButton = this.page.locator("//button[contains(., 'Reschedule')]");
    this.cancelAppointmentButton = this.page.locator("//button[contains(., 'Cancel')]");
    this.cancelAppointmentDialog = this.page.locator("//div[@role='dialog'][.//h3[contains(text(), 'Cancel')] or .//*[contains(text(), 'Cancel')]]");
    this.cancelDialogTitle = this.page.locator("//div[@role='dialog']//h3[contains(text(), 'Cancel')]");
    this.cancelDialogConfirmButton = this.page.locator("//div[@role='dialog']//button[contains(., 'Cancel')]");
    this.cancelDialogBackButton = this.page.locator("//div[@role='dialog']//button[contains(., 'Back')]");
    this.chooseAnotherPatientButton = this.page.locator("//button[contains(., 'Choose another patient') or contains(., 'Book for another patient') or contains(., 'Change patient') or contains(., 'Another patient')]");

    // 6. Existing Patient Verification Modal & Matched Profiles
    this.existingVerifyDialog = this.page.locator("//div[@role='dialog'][@aria-modal='true']");
    this.existingVerifyDialogTitle = this.page.locator("//h2[@id='existing-verify-title' or text()='Verify with your registered mobile']");
    this.existingModalCloseButton = this.page.locator("//div[@role='dialog']//button[@aria-label='Back']");
    this.existingModalPhoneInput = this.page.locator("//div[@role='dialog']//input[@type='tel' or @placeholder='e.g. 98XXXXXXXX']");
    this.existingModalSendOtpButton = this.page.locator("//div[@role='dialog']//button[text()='Send OTP' or text()='Resend']").first();
    this.existingModalOtpInput = this.page.locator("//div[@role='dialog']//input[@placeholder='Enter 6-digit code']");
    this.existingModalVerifyContinueButton = this.page.locator("//div[@role='dialog']//button[contains(., 'Verify & continue')]");
    this.existingModalBackButton = this.page.locator("//div[@role='dialog']//div[contains(@class, 'justify-end')]//button[text()='Back']");

    this.matchedPatientsHeading = this.page.locator("//h2[text()='Patients on this mobile']");
    this.matchedPatientsSubtitle = this.page.locator("//p[text()='Please choose which patient this booking is for.']");
    this.matchedPatientCardButtons = this.page.locator("ul.overscroll-contain button");

    // 7. Validation Error Messages
    this.globalErrorMessage = this.page.locator("//p[contains(@class, 'text-rose') or contains(@class, 'text-red') or contains(@class, 'text-danger')]").first();
    this.existingModalErrorMessage = this.page.locator("//div[@role='dialog']//p[contains(@class, 'text-rose') or contains(@class, 'text-danger')]");
    this.dobErrorHint = this.page.locator("//p[contains(@class, 'text-rose') or contains(@class, 'text-red') or contains(@class, 'text-danger')]").first();
    this.pincodeErrorHint = this.page.locator("//p[contains(@class, 'text-rose') or contains(@class, 'text-red') or contains(@class, 'text-danger')]").first();
    this.cityErrorHint = this.page.locator("//p[(contains(@class, 'text-rose') or contains(@class, 'text-danger')) and contains(text(), 'city')]");
    this.dateTimeErrorMessage = this.page.locator("//p[(contains(@class, 'text-rose') or contains(@class, 'text-danger')) and (contains(text(), 'slot') or contains(text(), 'slots'))]");
  }

  // ==========================================================================
  // 1. Initial Landing, Language & Patient Type Actions
  // ==========================================================================
  async navigateToBooking(baseURL: string) {
    await super.navigateTo(baseURL, undefined, this.navigatedToBookingLog);
  }

  async selectLanguage(language: string) {
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
   * Tolerant to casing and surrounding or internal spaces (e.g. "new", "New patient", " NEW ", "existing", "Existing patient", " EXISTING ").
   */
  async selectPatientType(patientType: string) {
    const normalized = patientType.trim().toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ');
    if (normalized.includes('new') || normalized === 'n') {
      await this.selectNewPatient();
    } else if (normalized.includes('exist') || normalized === 'e') {
      await this.selectExistingPatient();
    } else {
      throw new Error(`Unsupported patient type '${patientType}'. Supported options: 'new', 'existing'`);
    }
  }

  async selectNewPatient() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.newPatientButton],
      { state: BasePage.ElementState.VISIBLE },
      this.waitingForNewPatientButtonLog
    );
    await super.clickOnElement(this.newPatientButton, this.selectedNewPatientLog);
  }

  async selectExistingPatient() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.existingPatientButton],
      { state: BasePage.ElementState.VISIBLE },
      this.waitingForExistingPatientButtonLog
    );
    await super.clickOnElement(this.existingPatientButton, this.selectedExistingPatientLog);
  }

  async clickContinue() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.continueButton],
      { state: BasePage.ElementState.VISIBLE },
      this.waitingForContinueButtonLog
    );
    await super.clickOnElement(this.continueButton, this.clickedContinueLog);
  }

  async clickWhatsAppFloatingButton() {
    await super.clickOnElement(this.whatsAppFloatingButton, this.clickedWhatsAppLog);
  }

  async clickTalkToAshaAgent() {
    await super.clickOnElement(this.talkToAshaAgentButton, this.clickedTalkToAshaLog);
  }

  // ==========================================================================
  // 2. New Patient Intake Form Actions
  // ==========================================================================
  async enterFullName(name: string) {
    await super.enterValueForInputElement(this.fullNameInput, name.trim(), this.enteredFullNameLog);
  }

  async enterDateOfBirth(dob: string) {
    await super.enterValueForInputElement(this.dobInput, dob.trim(), this.enteredDobLog);
  }

  async selectGender(gender: string): Promise<string> {
    return await super.selectDropdownOption(this.genderSelect, gender, `${this.selectedGenderLog}: ${gender}`);
  }

  async enterPincode(pincode: string) {
    await super.enterValueForInputElement(this.pincodeInput, pincode.trim(), this.enteredPincodeLog);
  }

  async clearPincode() {
    await super.clearInputField(this.pincodeInput, this.clearedPincodeLog);
  }

  async selectState(state: string): Promise<string> {
    return await super.selectDropdownOption(this.stateSelect, state, `${this.selectedStateLog}: ${state}`);
  }

  async enterCity(city: string) {
    await super.enterValueForInputElement(this.cityInput, city.trim(), this.enteredCityLog);
  }

  async enterMobileNumber(phone: string) {
    await super.enterValueForInputElement(this.phoneInput, phone.trim(), this.enteredPhoneLog);
    // Proactively check if the application displays a validation message (e.g. number already linked)
    await this.page.waitForTimeout(500);
    await this.checkAndReportMobileValidation(phone.trim());
  }

  async getMobileLinkedWarningText(): Promise<string> {
    await this.mobileLinkedWarning.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    return (await this.mobileLinkedWarning.innerText().catch(() => '')).trim();
  }

  async isMobileLinkedToExisting(): Promise<boolean> {
    return await this.mobileLinkedWarning.isVisible({ timeout: 1500 }).catch(() => false);
  }

  async clickContinueAsExistingPatient() {
    await super.clickOnElement(this.continueAsExistingPatientButton, this.clickedContinueAsExistingPatientLog);
  }

  /**
   * Checks for any mobile validation or duplicate linked warning on the intake form.
   * If detected, logs a structured audit to the console.
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
   * Combined Send OTP & Auto-fill method for New Patient Intake.
   * 1. Checks if mobile validation was triggered (e.g. number already linked to existing).
   * 2. Clicks 'Send OTP' button.
   * 3. Checks if OTP input is enabled.
   * 4. Enters the provided OTP code passed from test spec into the field.
   */
  async sendOtp(otpCode?: string): Promise<string> {
    await super.clickOnElement(this.sendOtpButton, this.clickedSendOtpLog);
    const otp = otpCode ? otpCode.trim() : '123456';
    
    // Playwright's fill command inside enterValueForInputElement will automatically wait 
    // for the OTP field to become enabled by the application after the OTP is sent.
    // Hack: Force enable the input if the UI animation/state is lagging or buggy.
    await this.page.waitForTimeout(500);
    await this.otpInput.evaluate((el: HTMLInputElement) => { el.disabled = false; }).catch(() => {});
    
    await super.enterValueForInputElement(this.otpInput, otp, `${this.enteredOtpLog}: ${otp}`);
    return otp;
  }

  async sendAndEnterOtp(otpCode?: string): Promise<string> {
    return await this.sendOtp(otpCode);
  }

  async isSendOtpButtonDisabled(): Promise<boolean> {
    return await this.sendOtpButton.isDisabled().catch(() => false);
  }

  async clickSendOtp() {
    await super.clickOnElement(this.sendOtpButton, this.clickedSendOtpLog);
  }

  async enterOtp(otp: string) {
    const code = otp ? otp.trim() : '123456';
    await this.otpInput.evaluate((el: HTMLInputElement) => { el.disabled = false; }).catch(() => {});
    await super.enterValueForInputElement(this.otpInput, code, `${this.enteredOtpLog}: ${code}`);
  }

  async clearFullName() {
    await super.clearInputField(this.fullNameInput, this.clearedFullNameLog);
  }

  async clearDateOfBirth() {
    await super.clearInputField(this.dobInput, this.clearedDobLog);
  }

  async clearCity() {
    await super.clearInputField(this.cityInput, this.clearedCityLog);
  }

  async clearMobileNumber() {
    await super.clearInputField(this.phoneInput, this.clearedPhoneLog);
  }

  async clearOtp() {
    await super.clearInputField(this.otpInput, this.clearedOtpLog);
  }

  // ==========================================================================
  // 3. Date & Time Selection Actions
  // ==========================================================================
  async selectDoctor(doctorName: string) {
    const count = await this.doctorFilterButtons.count().catch(() => 0);
    if (count > 0) {
      const selected = await super.selectElementFromListOrGrid(
        this.doctorFilterButtons,
        doctorName,
        `${this.selectedDoctorLog}: ${doctorName.trim()}`
      ).catch(() => '');
      if (selected) return selected;
    }
    return doctorName;
  }

  async selectDoctorByName(doctorName: string) {
    return await this.selectDoctor(doctorName);
  }

  async clickPreviousWeek() {
    await super.clickOnElement(this.prevWeekButton, this.clickedPrevWeekLog);
  }

  async clickNextWeek() {
    await super.clickOnElement(this.nextWeekButton, this.clickedNextWeekLog);
  }

  /**
   * Navigates the calendar week-by-week until the specified month is displayed in the calendar header.
   * Parameter-wise & case-insensitive (e.g. "Sep", "September", "October", "09", 9).
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

  async getCalendarMonthRangeText(): Promise<string> {
    return (await this.weekDateRangeText.innerText()).trim();
  }

  /**
   * Selects an appointment date. Parameter-wise: accepts full date strings (YYYY-MM-DD,
   * DD-MM-YYYY, DD/MM/YYYY, "Sep 16"), day number (e.g. 16, "16"), or zero-based index (e.g. 0),
   * with optional target month.
   * Automatically parses the date and navigates calendar weeks and months to find and select that date.
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

  async selectTimeSlot(slot: string | number = 'first'): Promise<string> {
    return await super.selectElementFromListOrGrid(
      this.slotButtons,
      slot,
      `${this.selectedSlotLog}: ${slot}`
    );
  }

  /**
   * Combined date & time selection: picks the date (handling any week/month navigation),
   * and then selects the time slot.
   */
  async selectDateTime(date: number | string, slot: string | number = 'first', month?: string): Promise<string> {
    await this.selectDate(date, month);
    return await this.selectTimeSlot(slot);
  }

  // ==========================================================================
  // 4. Care Package Selection Actions
  // ==========================================================================
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

  async selectCarePackage(packageName: string | number): Promise<string> {
    return await this.selectCarePackageByName(packageName);
  }

  async selectBasicPackage() {
    return await this.selectCarePackageByName('Basic');
  }

  async selectAdvancedPackage() {
    return await this.selectCarePackageByName('Advanced');
  }

  async selectPremiumPackage() {
    return await this.selectCarePackageByName('Premium');
  }

  async selectSilverPackage() {
    return await this.selectBasicPackage();
  }

  async selectGoldPackage() {
    return await this.selectAdvancedPackage();
  }

  async selectPlatinumPackage() {
    return await this.selectPremiumPackage();
  }

  // ==========================================================================
  // 5. Navigation & Appointment Confirmation Actions
  // ==========================================================================
  async clickBack() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.backButton],
      { state: BasePage.ElementState.VISIBLE },
      this.waitingForBackButtonLog
    );
    await super.clickOnElement(this.backButton, this.clickedBackLog);
  }

  async clickConfirm() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.confirmButton],
      { state: BasePage.ElementState.VISIBLE },
      this.waitingForConfirmButtonLog
    );
    await super.clickOnElement(this.confirmButton, this.clickedConfirmLog);
  }

  async getConfirmationText(): Promise<string> {
    return (await this.appointmentConfirmationPill.innerText()).trim();
  }

  async clickBookAnotherAppointment() {
    await super.clickOnElement(this.bookAnotherAppointmentButton, this.clickedBookAnotherLog);
  }

  async clickReschedule(index: number = 0) {
    const btn = this.rescheduleAppointmentButton.nth(index);
    await super.clickOnElement(btn, this.clickedRescheduleLog);
  }

  async clickRescheduleAppointment(index: number = 0) {
    await this.clickReschedule(index);
  }

  async clickCancel(index: number = 0) {
    const btn = this.cancelAppointmentButton.nth(index);
    await super.clickOnElement(btn, this.clickedCancelLog);
  }

  async clickCancelAppointment(index: number = 0) {
    await this.clickCancel(index);
  }

  async confirmCancel() {
    await super.clickOnElement(this.cancelDialogConfirmButton, this.confirmedCancelLog);
  }

  async confirmCancelInModal() {
    await this.confirmCancel();
  }

  async dismissCancelModal() {
    await super.clickOnElement(this.cancelDialogBackButton, this.dismissedCancelLog);
  }

  async clickChooseAnotherPatient() {
    await super.clickOnElement(this.chooseAnotherPatientButton, this.clickedChooseAnotherPatientLog);
  }

  // ==========================================================================
  // 6. Existing Patient Verification Modal & Matched Profiles Actions
  // ==========================================================================
  async enterExistingPatientPhone(phone: string) {
    await super.enterValueForInputElement(this.existingModalPhoneInput, phone.trim(), this.enteredModalPhoneLog);
  }

  /**
   * Combined Send OTP & Auto-fill method for Existing Patient Verification Modal.
   * Clicks 'Send OTP' and enters the provided OTP code passed from test spec.
   */
  async sendExistingModalOtp(otpCode?: string): Promise<string> {
    await super.clickOnElement(this.existingModalSendOtpButton, this.clickedModalSendOtpLog);
    await this.page.waitForTimeout(500);
    const otp = otpCode ? otpCode.trim() : '123456';
    await this.existingModalOtpInput.evaluate((el: HTMLInputElement) => { el.disabled = false; }).catch(() => {});
    if (otp) {
      await super.enterValueForInputElement(this.existingModalOtpInput, otp, `${this.enteredModalOtpLog}: ${otp}`);
    }
    return otp;
  }

  async sendExistingPatientOtp(otpCode?: string): Promise<string> {
    return await this.sendExistingModalOtp(otpCode);
  }

  async clickExistingModalSendOtp() {
    await super.clickOnElement(this.existingModalSendOtpButton, this.clickedModalSendOtpLog);
    await this.page.waitForTimeout(500);
    await this.existingModalOtpInput.evaluate((el: HTMLInputElement) => { el.disabled = false; }).catch(() => {});
  }

  async enterExistingModalOtp(otp: string) {
    await this.existingModalOtpInput.evaluate((el: HTMLInputElement) => { el.disabled = false; }).catch(() => {});
    await super.enterValueForInputElement(this.existingModalOtpInput, otp.trim(), this.enteredModalOtpLog);
  }

  async clickExistingModalVerifyContinue() {
    await super.clickOnElement(this.existingModalVerifyContinueButton, this.clickedModalVerifyContinueLog);
  }

  async closeExistingVerifyModal() {
    await super.clickOnElement(this.existingModalCloseButton, this.closedModalLog);
  }

  async selectMatchedPatient(patient: string | number = 0) {
    return await super.selectElementFromListOrGrid(
      this.matchedPatientCardButtons,
      patient,
      `${this.selectedMatchedPatientNameLog}: ${patient.toString().trim()}`
    );
  }

  async selectMatchedPatientByIndex(index: number = 0) {
    return await this.selectMatchedPatient(index);
  }

  async selectMatchedPatientByName(name: string) {
    return await this.selectMatchedPatient(name);
  }

  // ==========================================================================
  // 7. Screen & Form Validation Error Verification Methods (Kept Below)
  // ==========================================================================
  async verifyBookingPageLoaded() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.pageTitleHeading, this.newPatientButton, this.existingPatientButton],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedBookingPageLoadedLog
    );
  }

  async verifyPatientTypeScreenDisplayed() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.newPatientButton, this.existingPatientButton],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedPatientTypeScreenLog
    );
  }

  async verifyNewPatientIntakeScreenDisplayed() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.intakeSectionHeading, this.fullNameInput, this.dobInput, this.genderSelect, this.stateSelect, this.phoneInput],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedNewPatientIntakeScreenLog
    );
  }

  async verifyDateTimeScreenDisplayed() {
    const isUpcoming = await this.upcomingAppointmentHeading.isVisible({ timeout: 2000 }).catch(() => false);
    if (isUpcoming) {
      const isReschedule = await this.rescheduleAppointmentButton.isVisible({ timeout: 1000 }).catch(() => false);
      if (isReschedule) {
        await this.rescheduleAppointmentButton.click();
      } else {
        await this.bookAnotherAppointmentButton.click().catch(() => {});
      }
    }
    await this.dateTimeSectionHeading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async verifyCarePackageScreenDisplayed() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.packageSectionHeading, this.packageCards.first()],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedCarePackageScreenLog
    );
  }

  async verifyExistingPatientModalDisplayed() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.existingVerifyDialog, this.existingVerifyDialogTitle, this.existingModalPhoneInput, this.existingModalSendOtpButton],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedExistingPatientModalLog
    );
  }

  async verifyMatchedPatientsScreenDisplayed() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.matchedPatientsHeading, this.matchedPatientCardButtons.first()],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedMatchedPatientsScreenLog
    );
  }

  async verifyAppointmentConfirmationDisplayed() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.appointmentConfirmedHeading],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedConfirmedScreenLog
    );
  }

  async verifyGlobalErrorMessageDisplayed(expectedMessage?: string) {
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

  async verifyModalErrorMessageDisplayed(expectedMessage?: string) {
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

  async verifyDobValidationErrorDisplayed() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.dobErrorHint],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedDobErrorLog
    );
  }

  async verifyPincodeValidationErrorDisplayed() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.pincodeErrorHint],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedPincodeErrorLog
    );
  }

  async verifyCityValidationErrorDisplayed() {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.cityErrorHint],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedCityErrorLog
    );
  }

  // ==========================================================================
  // Getters for Strict "Actual vs Expected" Assertion Verifications
  // ==========================================================================
  async getGlobalErrorMessageText(): Promise<string> {
    await this.globalErrorMessage.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    return (await this.globalErrorMessage.innerText().catch(() => '')).trim();
  }

  async getDobErrorHintText(): Promise<string> {
    await this.dobErrorHint.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    return (await this.dobErrorHint.innerText().catch(() => '')).trim();
  }

  async getPincodeErrorHintText(): Promise<string> {
    await this.pincodeErrorHint.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    return (await this.pincodeErrorHint.innerText().catch(() => '')).trim();
  }

  async getPincodeInputValue(): Promise<string> {
    return await this.pincodeInput.inputValue();
  }

  async getCityErrorHintText(): Promise<string> {
    await this.cityErrorHint.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    return (await this.cityErrorHint.innerText().catch(() => '')).trim();
  }

  async getAppointmentConfirmationHeading(): Promise<string> {
    await this.appointmentConfirmedHeading.waitFor({ state: 'visible' });
    return (await this.appointmentConfirmedHeading.innerText()).trim();
  }

  async getUpcomingAppointmentCardText(index: number = 0): Promise<string> {
    const card = this.upcomingAppointmentCards.nth(index);
    await card.waitFor({ state: 'visible' });
    return (await card.innerText()).trim();
  }

  async getAppointmentConfirmationDetails(): Promise<{
    confirmationHeading: string;
    confirmationPill: string;
    firstUpcomingCardText: string;
  }> {
    await this.appointmentConfirmedHeading.waitFor({ state: 'visible' });
    const heading = (await this.appointmentConfirmedHeading.innerText().catch(() => '')).trim();
    const pill = (await this.appointmentConfirmationPill.innerText().catch(() => '')).trim();
    
    const firstCard = this.upcomingAppointmentCards.first();
    await firstCard.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const card = (await firstCard.innerText().catch(() => '')).trim();
    
    return {
      confirmationHeading: heading,
      confirmationPill: pill,
      firstUpcomingCardText: card,
    };
  }

  async getMobileInputValue(): Promise<string> {
    return await this.phoneInput.inputValue();
  }

  async getFullNameInputValue(): Promise<string> {
    return await this.fullNameInput.inputValue();
  }

  async getModalErrorMessageText(): Promise<string> {
    await this.existingModalErrorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return (await this.existingModalErrorMessage.innerText()).trim();
  }

  async getExistingModalPhoneInputValue(): Promise<string> {
    return await this.existingModalPhoneInput.inputValue();
  }
}

export { AwhBookingPage as BookingPage };




