/**
 * @file AwhBookingPage.ts
 * @description
 * Primary Page Object representing the AWH (AWS Hospital) Web Booking Application portal.
 * Encapsulates all user interaction flows across the booking lifecycle:
 * - Language selection (English, Hindi, Telugu)
 * - Patient type selection (New patient / Existing patient)
 * - New patient intake form filling & OTP verification
 * - Existing patient phone authentication & profile matching
 * - Care package tier selection (Silver, Gold, Platinum)
 * - Date picker calendar navigation & time slot booking
 * - Appointment confirmation, rescheduling, and cancellation
 *
 * Target URL: https://awh-website-booking-form.vercel.app/
 */

import { Locator, expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AwhBookingPage extends BasePage {
  // ==========================================================================
  // 1. Initial Landing, Language Switcher & Patient Type Locators
  // ==========================================================================
  private readonly pageTitleHeading: Locator;
  private readonly languageGroup: Locator;
  private readonly englishLangButton: Locator;
  private readonly hindiLangButton: Locator;
  private readonly teluguLangButton: Locator;

  private readonly newPatientButton: Locator;
  private readonly newPatientTitle: Locator;
  private readonly newPatientDescription: Locator;

  private readonly existingPatientButton: Locator;
  private readonly existingPatientTitle: Locator;
  private readonly existingPatientDescription: Locator;

  private readonly continueButton: Locator;
  private readonly whatsAppFloatingButton: Locator;
  private readonly talkToAshaAgentButton: Locator;
  private readonly chatbotHeader: Locator;
  private readonly chatbotTitle: Locator;
  private readonly chatbotSubtitle: Locator;
  private readonly chatbotCloseButton: Locator;
  private readonly chatbotWelcomeMessage: Locator;
  private readonly chatbotBookAppointmentButton: Locator;
  private readonly chatbotOurDoctorsButton: Locator;
  private readonly chatbotAboutHospitalButton: Locator;
  private readonly chatbotMessageInput: Locator;

  // ==========================================================================
  // 2. New Patient Intake Form Locators
  // ==========================================================================
  private readonly intakeSectionHeading: Locator;
  private readonly fullNameInput: Locator;
  private readonly dobInput: Locator;
  private readonly genderSelect: Locator;
  private readonly pincodeInput: Locator;
  private readonly stateSelect: Locator;
  private readonly cityInput: Locator;
  private readonly phoneInput: Locator;
  private readonly sendOtpButton: Locator;
  private readonly otpInput: Locator;
  private readonly mobileLinkedWarning: Locator;
  private readonly continueAsExistingPatientButton: Locator;

  // ==========================================================================
  // 3. Date & Time Selection Locators
  // ==========================================================================
  private readonly dateTimeSectionHeading: Locator;
  private readonly consultantDoctorSubtitle: Locator;
  private readonly consultingDoctorName: Locator;
  private readonly doctorFilterButtons: Locator;
  private readonly weekDateRangeText: Locator;
  private readonly prevWeekButton: Locator;
  private readonly nextWeekButton: Locator;
  private readonly dayButtons: Locator;
  private readonly slotsLoadingText: Locator;
  private readonly noSlotsText: Locator;
  private readonly slotButtons: Locator;
  private readonly firstAvailableSlotButton: Locator;

  // ==========================================================================
  // 4. Care Package Selection Locators
  // ==========================================================================
  private readonly packageSectionHeading: Locator;
  private readonly packageLoadingText: Locator;
  private readonly noPackagesText: Locator;
  private readonly packageCards: Locator;
  private readonly silverPackageCard: Locator;
  private readonly goldPackageCard: Locator;
  private readonly platinumPackageCard: Locator;

  // ==========================================================================
  // 5. Navigation & Appointment Confirmation Locators
  // ==========================================================================
  private readonly backButton: Locator;
  private readonly confirmButton: Locator;

  private readonly appointmentConfirmedHeading: Locator;
  private readonly upcomingAppointmentHeading: Locator;
  private readonly appointmentConfirmationPill: Locator;
  private readonly bookAnotherAppointmentButton: Locator;
  private readonly upcomingAppointmentsSectionTitle: Locator;
  private readonly upcomingAppointmentCards: Locator;
  private readonly rescheduleAppointmentButton: Locator;
  private readonly cancelAppointmentButton: Locator;
  private readonly cancelAppointmentDialog: Locator;
  private readonly cancelDialogTitle: Locator;
  private readonly cancelDialogConfirmButton: Locator;
  private readonly cancelDialogBackButton: Locator;
  private readonly chooseAnotherPatientButton: Locator;

  // ==========================================================================
  // 6. Existing Patient Verification Modal & Matched Profiles Locators
  // ==========================================================================
  private readonly existingVerifyDialog: Locator;
  private readonly existingVerifyDialogTitle: Locator;
  private readonly existingModalCloseButton: Locator;
  private readonly existingModalPhoneInput: Locator;
  private readonly existingModalSendOtpButton: Locator;
  private readonly existingModalOtpInput: Locator;
  private readonly existingModalVerifyContinueButton: Locator;
  private readonly existingModalBackButton: Locator;

  private readonly matchedPatientsHeading: Locator;
  private readonly matchedPatientsSubtitle: Locator;
  private readonly matchedPatientCardButtons: Locator;

  // ==========================================================================
  // 7. Validation Error Message Locators
  // ==========================================================================
  private readonly globalErrorMessage: Locator;
  private readonly existingModalErrorMessage: Locator;
  private readonly dobErrorHint: Locator;
  private readonly pincodeErrorHint: Locator;
  private readonly cityErrorHint: Locator;
  private readonly dateTimeErrorMessage: Locator;

  // ==========================================================================
  // Structured Step Log Messages (Declared at Top of Class)
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
  private readonly verifiedWhatsAppButtonLog = "Verifying WhatsApp support floating button displayed";
  private readonly clickedTalkToAshaLog = "Clicking 'Talk to Asha' virtual assistant button";
  private readonly verifiedChatbotModalLog = "Verifying Asha Chatbot widget displayed";
  private readonly clickedChatbotCloseLog = "Clicking Close button on Chatbot widget";
  private readonly clickedChatbotBookAppointmentLog = "Clicking 'Book appointment' quick action in Chatbot";
  private readonly clickedChatbotOurDoctorsLog = "Clicking 'Our doctors' quick action in Chatbot";
  private readonly clickedChatbotAboutHospitalLog = "Clicking 'About hospital' quick action in Chatbot";
  private readonly enteredChatMessageLog = "Entering message in Chatbot input";
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
  private readonly selectedMatchedPatientLog = "Selecting matched patient profile";

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

    this.continueButton = this.page.locator("//button[@type='submit' and (contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'continue') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'confirm') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'verify'))]");
    this.whatsAppFloatingButton = this.page.locator("//a[contains(@href, 'wa.me') or contains(@aria-label, 'WhatsApp')]");
    this.talkToAshaAgentButton = this.page.locator("//button[contains(@title, 'Asha') or contains(@class, 'fab-custom') or contains(@aria-label, 'Asha')]");
    this.chatbotHeader = this.page.locator("//div[contains(@class, 'chat-header')]");
    this.chatbotTitle = this.page.locator("//span[contains(@class, 'header-title') or contains(@class, 'header-brand-name')]//span[text()='Asha'] | //div[contains(@class, 'chat-header')]//*[text()='Asha']");
    this.chatbotSubtitle = this.page.locator("//span[contains(@class, 'header-subtitle')] | //div[contains(@class, 'chat-header')]//*[contains(text(), 'Care Companion')]");
    this.chatbotCloseButton = this.page.locator("//button[@aria-label='Close' or contains(@class, 'header-action-btn')]");
    this.chatbotWelcomeMessage = this.page.locator("//div[contains(@class, 'welcome-message')] | //div[contains(@class, 'bot-bubble')]");
    this.chatbotBookAppointmentButton = this.page.locator("//div[contains(@class, 'chat-body') or contains(@class, 'chat-messages')]//button[contains(@class, 'btn-primary') and text()='Book appointment']");
    this.chatbotOurDoctorsButton = this.page.locator("//div[contains(@class, 'chat-body') or contains(@class, 'chat-messages')]//button[contains(@class, 'btn-primary') and text()='Our doctors']");
    this.chatbotAboutHospitalButton = this.page.locator("//div[contains(@class, 'chat-body') or contains(@class, 'chat-messages')]//button[contains(@class, 'btn-primary') and text()='About hospital']");
    this.chatbotMessageInput = this.page.locator("//div[contains(@class, 'chat-footer')]//input");

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
    this.weekDateRangeText = this.page.locator("//div[contains(@class, 'justify-between')]//p[contains(@class, 'text-ink-soft')] | //div[contains(@class, 'justify-between')]//p | //div[contains(@class, 'flex')]//p[contains(text(), '202')]");
    this.prevWeekButton = this.page.locator("//button[@aria-label='Previous week' or @title='Previous week' or @aria-label='Previous' or @title='Previous'] | //div[contains(@class, 'flex') and .//button[contains(., 'Oct') or contains(., 'Sep') or contains(., 'Nov') or contains(., 'Dec') or contains(@class, 'flex-col')]]/button[1] | //div[button[contains(@class, 'flex-col')]]/button[following-sibling::button[contains(@class, 'flex-col')]]");
    this.nextWeekButton = this.page.locator("//button[@aria-label='Next week' or @title='Next week' or @aria-label='Next' or @title='Next'] | //div[contains(@class, 'flex') and .//button[contains(., 'Oct') or contains(., 'Sep') or contains(., 'Nov') or contains(., 'Dec') or contains(@class, 'flex-col')]]/button[last()] | //div[button[contains(@class, 'flex-col')]]/button[preceding-sibling::button[contains(@class, 'flex-col')]]");
    this.dayButtons = this.page.locator("//button[contains(@class, 'flex-col') and .//span] | //div[contains(@class, 'flex')]//button[contains(@class, 'rounded') and (contains(., 'Oct') or contains(., 'Sep') or contains(., 'Nov') or contains(., 'Dec') or contains(., 'Jan') or contains(., 'Feb') or contains(., 'Mar') or contains(., 'Apr') or contains(., 'May') or contains(., 'Jun') or contains(., 'Jul') or contains(., 'Aug') or .//span)]");
    this.slotsLoadingText = this.page.locator("//p[text()='Loading open slots…']");
    this.noSlotsText = this.page.locator("//p[text()='No open slots for this date.']");
    this.slotButtons = this.page.locator("//button[contains(text(), ':') and (contains(text(), 'AM') or contains(text(), 'PM'))]");
    this.firstAvailableSlotButton = this.page.locator("(//div[contains(@class, 'grid') or @role='group']//button[contains(text(), ':') and not(@disabled)])[1]");

    // 4. Care Package Selection
    this.packageSectionHeading = this.page.locator("//h2[text()='Choose a care package']");
    this.packageLoadingText = this.page.locator("//p[text()='Loading packages…']");
    this.noPackagesText = this.page.locator("//p[text()='No packages available right now.']");
    this.packageCards = this.page.locator("//button[contains(., 'INR') or contains(., 'Silver') or contains(., 'Gold') or contains(., 'Platinum') or contains(., 'care package')]");
    this.silverPackageCard = this.page.locator("//button[contains(., 'Silver') or (contains(., 'Basic') and contains(., 'INR'))]");
    this.goldPackageCard = this.page.locator("//button[contains(., 'Gold') or (contains(., 'Advanced') and contains(., 'INR'))]");
    this.platinumPackageCard = this.page.locator("//button[contains(., 'Platinum') or (contains(., 'Premium') and contains(., 'INR'))]");

    // 5. Navigation & Appointment Confirmation
    this.backButton = this.page.locator("//button[contains(., 'Back') and not(@aria-label='Back')]");
    this.confirmButton = this.page.locator("//button[@type='submit' and (contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'confirm') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'book') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'reschedule') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'continue'))]");

    this.appointmentConfirmedHeading = this.page.locator("//h2[text()='Appointment confirmed' or contains(text(), 'Appointment confirmed')]");
    this.upcomingAppointmentHeading = this.page.locator("//h2[text()='Your upcoming appointment']");
    this.appointmentConfirmationPill = this.page.locator("//p[text()='Patient']/following-sibling::p | //div[contains(@class, 'rounded-xl')]//span[contains(@class, 'text-ink')] | //ul//li[1]");
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
    this.existingModalVerifyContinueButton = this.page.locator("//div[@role='dialog']//button[@type='submit' and (contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'verify') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'continue') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'confirm'))]");
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
   */
  async navigateToBooking(baseURL: string): Promise<void> {
    await super.navigateTo(baseURL, undefined, this.navigatedToBookingLog);
  }

  /**
   * Switches the active language in the top-right header language group.
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
   * Selects patient type dynamically based on input parameter ('new' or 'existing').
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
   * Verifies the floating WhatsApp support button is visible.
   */
  async verifyWhatsAppFloatingButtonDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.whatsAppFloatingButton],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedWhatsAppButtonLog
    );
  }

  /**
   * Retrieves the target URL / href of the floating WhatsApp button.
   */
  async getWhatsAppLinkHref(): Promise<string> {
    return (await this.whatsAppFloatingButton.getAttribute('href').catch(() => '')) || '';
  }

  /**
   * Clicks the floating WhatsApp support link button.
   */
  async clickWhatsAppFloatingButton(): Promise<void> {
    await super.clickOnElement(this.whatsAppFloatingButton, this.clickedWhatsAppLog);
  }

  /**
   * Clicks the "Talk to Asha" virtual agent assistance button to launch chatbot.
   */
  async clickTalkToAshaAgent(): Promise<void> {
    await super.clickOnElement(this.talkToAshaAgentButton, this.clickedTalkToAshaLog);
  }

  /**
   * Opens the Asha chatbot widget by clicking the floating assistant button.
   */
  async openChatbotWidget(): Promise<void> {
    await this.clickTalkToAshaAgent();
    await this.verifyChatbotWidgetDisplayed();
  }

  /**
   * Verifies that the Asha chatbot container and header are visible.
   */
  async verifyChatbotWidgetDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.chatbotHeader],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedChatbotModalLog
    );
  }

  /**
   * Returns whether the chatbot widget is currently visible.
   */
  async isChatbotWidgetVisible(): Promise<boolean> {
    return await this.chatbotHeader.isVisible().catch(() => false);
  }

  /**
   * Returns the welcome / greeting message rendered by the chatbot.
   */
  async getChatbotWelcomeMessage(): Promise<string> {
    return (await this.chatbotWelcomeMessage.innerText().catch(() => '')).trim();
  }

  /**
   * Verifies the presence of chatbot suggested quick action buttons.
   */
  async verifyChatbotQuickActionsDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.chatbotBookAppointmentButton, this.chatbotOurDoctorsButton, this.chatbotAboutHospitalButton],
      { state: BasePage.ElementState.VISIBLE }
    );
  }

  /**
   * Clicks the 'Book appointment' quick action button within the chatbot.
   */
  async clickChatbotBookAppointment(): Promise<void> {
    await super.clickOnElement(this.chatbotBookAppointmentButton, this.clickedChatbotBookAppointmentLog);
  }

  /**
   * Clicks the 'Our doctors' quick action button within the chatbot.
   */
  async clickChatbotOurDoctors(): Promise<void> {
    await super.clickOnElement(this.chatbotOurDoctorsButton, this.clickedChatbotOurDoctorsLog);
  }

  /**
   * Clicks the 'About hospital' quick action button within the chatbot.
   */
  async clickChatbotAboutHospital(): Promise<void> {
    await super.clickOnElement(this.chatbotAboutHospitalButton, this.clickedChatbotAboutHospitalLog);
  }

  /**
   * Types a question into the Chatbot input if enabled.
   */
  async enterChatMessage(message: string): Promise<void> {
    const isInputDisabled = await this.chatbotMessageInput.isDisabled().catch(() => true);
    if (!isInputDisabled) {
      await super.enterValueForInputElement(this.chatbotMessageInput, message, this.enteredChatMessageLog);
    }
  }

  /**
   * Closes the Asha chatbot widget.
   */
  async closeChatbotWidget(): Promise<void> {
    await super.clickOnElement(this.chatbotCloseButton, this.clickedChatbotCloseLog);
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.chatbotHeader],
      { state: BasePage.ElementState.HIDDEN }
    );
  }

  // ==========================================================================
  // 2. New Patient Intake Form Actions
  // ==========================================================================

  /**
   * Fills the patient's full name into the intake form.
   */
  async enterFullName(name: string): Promise<void> {
    await super.enterValueForInputElement(this.fullNameInput, name.trim(), this.enteredFullNameLog);
  }

  /**
   * Fills the patient's date of birth in YYYY-MM-DD format into the native HTML5 date input.
   */
  async enterDateOfBirth(dob: string): Promise<void> {
    await super.enterValueForInputElement(this.dobInput, dob.trim(), this.enteredDobLog);
  }

  /**
   * Selects gender from the HTML select dropdown.
   */
  async selectGender(gender: string): Promise<string> {
    return await super.selectDropdownOption(this.genderSelect, gender, `${this.selectedGenderLog}: ${gender}`);
  }

  /**
   * Enters the 6-digit postal pincode into the intake form.
   */
  async enterPincode(pincode: string): Promise<void> {
    await super.enterValueForInputElement(this.pincodeInput, pincode.trim(), this.enteredPincodeLog);
  }

  /**
   * Clears the pincode field.
   */
  async clearPincode(): Promise<void> {
    await super.clearInputField(this.pincodeInput, this.clearedPincodeLog);
  }

  /**
   * Selects state from the state select dropdown.
   */
  async selectState(state: string): Promise<string> {
    return await super.selectDropdownOption(this.stateSelect, state, `${this.selectedStateLog}: ${state}`);
  }

  /**
   * Enters city name into the city text field.
   */
  async enterCity(city: string): Promise<void> {
    await super.enterValueForInputElement(this.cityInput, city.trim(), this.enteredCityLog);
  }

  /**
   * Enters a 10-digit mobile phone number into the intake form and checks for duplicate link warnings.
   */
  async enterMobileNumber(phone: string): Promise<void> {
    await super.enterValueForInputElement(this.phoneInput, phone.trim(), this.enteredPhoneLog);
    await this.checkAndReportMobileValidation(phone.trim());
  }

  /**
   * Retrieves the warning message displayed when a mobile number is already linked to existing patients.
   */
  async getMobileLinkedWarningText(): Promise<string> {
    return (await this.mobileLinkedWarning.innerText().catch(() => '')).trim();
  }

  /**
   * Checks whether the "already linked to existing patient" warning banner is visible.
   */
  async isMobileLinkedToExisting(): Promise<boolean> {
    return await this.mobileLinkedWarning.isVisible().catch(() => false);
  }

  /**
   * Clicks the "Continue as existing patient" button displayed beneath the mobile duplicate warning.
   */
  async clickContinueAsExistingPatient(): Promise<void> {
    await super.clickOnElement(this.continueAsExistingPatientButton, this.clickedContinueAsExistingPatientLog);
  }

  /**
   * Audits the intake form for mobile number validation warnings.
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
   */
  async sendOtp(otpCode?: string): Promise<string> {
    const otp = otpCode ? otpCode.trim() : '123456';
    await super.clickOnElement(this.sendOtpButton, this.clickedSendOtpLog);
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.otpInput],
      { state: BasePage.ElementState.VISIBLE }
    );
    await this.enterOtp(otp);
    return otp;
  }

  /**
   * Returns whether the Send OTP button is currently disabled.
   */
  async isSendOtpButtonDisabled(): Promise<boolean> {
    return await this.sendOtpButton.isDisabled().catch(() => false);
  }

  /**
   * Clicks the Send OTP button without auto-filling the OTP field.
   */
  async clickSendOtp(): Promise<void> {
    await super.clickOnElement(this.sendOtpButton, this.clickedSendOtpLog);
  }

  /**
   * Enters the specified OTP code into the intake form OTP field.
   */
  async enterOtp(otp: string): Promise<void> {
    const code = otp ? otp.trim() : '123456';
    await super.enterValueForInputElement(this.otpInput, code, this.enteredOtpLog);
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
   * Selects a specialist doctor filter button or validates the consulting doctor.
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
   */
  async getCalendarMonthRangeText(): Promise<string> {
    return (await this.weekDateRangeText.innerText()).trim();
  }

  /**
   * Selects an appointment date from the calendar grid with automatic week/month navigation.
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
   * If no slots are open on the current date, automatically shifts across days in the active week and next week.
   */
  async selectTimeSlot(slot: string | number = 'first'): Promise<string> {
    const slotStr = slot.toString().trim();

    // 1. Quick wait for slot loading indicator to disappear and slots / no-slots to render
    const waitForSlotsToLoad = async () => {
      await this.slotsLoadingText.waitFor({ state: 'hidden', timeout: 3500 }).catch(() => {});
      await this.page.waitForSelector(
        "//button[contains(text(), ':')] | //p[contains(text(), 'No open slots')]",
        { timeout: 1800 }
      ).catch(() => {});
    };

    await waitForSlotsToLoad();

    const hasAvailableSlot = async (): Promise<boolean> => {
      return (await this.slotButtons.count()) > 0;
    };

    // 2. If no open slots on active date, search through days in active week
    if (!(await hasAvailableSlot()) || (await this.noSlotsText.isVisible().catch(() => false))) {
      const dayCount = await this.dayButtons.count();
      for (let i = 0; i < dayCount; i++) {
        await super.clickOnElement(this.dayButtons.nth(i));
        await waitForSlotsToLoad();
        if (await hasAvailableSlot()) {
          break;
        }
      }

      // 3. If still no slots in current week, advance to next week
      if (!(await hasAvailableSlot())) {
        await this.clickNextWeek();
        await waitForSlotsToLoad();
        const nextDayCount = await this.dayButtons.count();
        for (let i = 0; i < nextDayCount; i++) {
          await super.clickOnElement(this.dayButtons.nth(i));
          await waitForSlotsToLoad();
          if (await hasAvailableSlot()) {
            break;
          }
        }
      }
    }

    // 4. Try finding specific requested slot
    if (slotStr.toLowerCase() !== 'first' && slotStr.toLowerCase() !== 'any') {
      const specificSlot = this.page.locator(`//button[contains(text(), ':') and (contains(text(), '${slotStr}') or contains(translate(text(), 'AMP', 'amp'), '${slotStr.toLowerCase()}')) and not(@disabled)]`).first();
      if (await specificSlot.isVisible().catch(() => false)) {
        const text = (await specificSlot.innerText()).trim();
        await super.clickOnElement(specificSlot, `${this.selectedSlotLog}: ${slotStr}`);
        return text;
      }
    }

    // 5. Select the first available enabled slot button
    if (await this.firstAvailableSlotButton.isVisible().catch(() => false)) {
      const slotText = (await this.firstAvailableSlotButton.innerText()).trim();
      await super.clickOnElement(this.firstAvailableSlotButton, `${this.selectedSlotLog}: ${slotText}`);
      return slotText;
    }

    // 6. Fallback across all visible slot buttons
    const count = await this.slotButtons.count();
    for (let i = 0; i < count; i++) {
      const s = this.slotButtons.nth(i);
      if (!(await s.isDisabled().catch(() => false))) {
        const text = (await s.innerText()).trim();
        await super.clickOnElement(s, `${this.selectedSlotLog}: ${text}`);
        return text;
      }
    }

    if (await this.noSlotsText.isVisible().catch(() => false)) {
      const noSlotMsg = (await this.noSlotsText.innerText()).trim();
      console.log(`ℹ️ [AwhBookingPage] Validated date state: "${noSlotMsg}" (No open slots available)`);
      return noSlotMsg;
    }

    return 'No open slots';
  }

  /**
   * Combined helper: selects the appointment date and then picks a time slot.
   */
  async selectDateTime(date: number | string, slot: string | number = 'first', month?: string): Promise<string> {
    await this.selectDate(date, month);
    return await this.selectTimeSlot(slot);
  }

  // ==========================================================================
  // 4. Care Package Selection Actions
  // ==========================================================================

  /**
   * Selects a care package card by name (Silver, Gold, Platinum).
   */
  async selectCarePackageByName(packageName: string | number): Promise<string> {
    const isUpcoming = await this.bookAnotherAppointmentButton.isVisible().catch(() => false);
    if (isUpcoming) {
      await super.clickOnElement(this.bookAnotherAppointmentButton, this.clickedBookAnotherLog);
      await super.waitForListOfElementsToBeVisibleOrHidden([this.packageSectionHeading]);
    }
    return await super.selectElementFromListOrGrid(
      this.packageCards,
      packageName,
      `${this.selectedPackageLog}: ${packageName.toString().trim()}`
    );
  }

  /** Selects the Silver care package card. */
  async selectSilverPackage(): Promise<string> {
    return await this.selectCarePackageByName('Silver');
  }

  /** Selects the Gold care package card. */
  async selectGoldPackage(): Promise<string> {
    return await this.selectCarePackageByName('Gold');
  }

  /** Selects the Platinum care package card. */
  async selectPlatinumPackage(): Promise<string> {
    return await this.selectCarePackageByName('Platinum');
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
   */
  async clickReschedule(index: number = 0): Promise<void> {
    const btn = this.rescheduleAppointmentButton.nth(index);
    await super.clickOnElement(btn, this.clickedRescheduleLog);
  }

  /**
   * Clicks the Cancel button on an upcoming appointment card.
   */
  async clickCancel(index: number = 0): Promise<void> {
    const btn = this.cancelAppointmentButton.nth(index);
    await super.clickOnElement(btn, this.clickedCancelLog);
  }

  /** Confirms appointment cancellation inside the cancellation confirmation modal dialog. */
  async confirmCancel(): Promise<void> {
    await super.clickOnElement(this.cancelDialogConfirmButton, this.confirmedCancelLog);
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
   */
  async sendExistingModalOtp(otpCode?: string): Promise<string> {
    await super.clickOnElement(this.existingModalSendOtpButton, this.clickedModalSendOtpLog);
    const otp = otpCode ? otpCode.trim() : '123456';
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.existingModalOtpInput, this.existingModalVerifyContinueButton],
      { state: BasePage.ElementState.VISIBLE }
    );
    await super.enterValueForInputElement(this.existingModalOtpInput, otp, this.enteredModalOtpLog);
    return otp;
  }

  /** Clicks the Send OTP button in the verification modal without entering the OTP code. */
  async clickExistingModalSendOtp(): Promise<void> {
    await super.clickOnElement(this.existingModalSendOtpButton, this.clickedModalSendOtpLog);
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.existingModalOtpInput],
      { state: BasePage.ElementState.VISIBLE }
    );
  }

  /**
   * Enters the OTP code into the modal input field.
   */
  async enterExistingModalOtp(otp: string): Promise<void> {
    await super.enterValueForInputElement(this.existingModalOtpInput, otp.trim(), this.enteredModalOtpLog);
  }

  /** Clicks the 'Verify & continue' button in the existing patient verification modal. */
  async clickExistingModalVerifyContinue(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.existingModalVerifyContinueButton],
      { state: BasePage.ElementState.VISIBLE }
    );
    await super.clickOnElement(this.existingModalVerifyContinueButton, this.clickedModalVerifyContinueLog);
  }

  /** Closes the existing patient verification modal by clicking the back / close button. */
  async closeExistingVerifyModal(): Promise<void> {
    await super.clickOnElement(this.existingModalCloseButton, this.closedModalLog);
  }

  /**
   * Selects a matched patient profile from the list of patients associated with the verified phone number.
   */
  async selectMatchedPatient(patient: string | number = 0): Promise<string> {
    return await super.selectElementFromListOrGrid(
      this.matchedPatientCardButtons,
      patient,
      `${this.selectedMatchedPatientLog}: ${patient.toString().trim()}`
    );
  }

  // ==========================================================================
  // 5 High-Level Category Workflow Methods (Parameterized for Test Specs)
  // ==========================================================================

  /**
   * Category 1: Navigation & Patient Type Selection
   */
  async navigateAndSelectPatient(baseUrl: string, patientType: string = 'new'): Promise<void> {
    await this.navigateToBooking(baseUrl);
    await this.verifyBookingPageLoaded();
    await this.selectPatientType(patientType);
    await this.clickContinue();
    if (patientType.toLowerCase().includes('new')) {
      await this.verifyNewPatientIntakeScreenDisplayed();
    }
  }

  /**
   * Category 2: Patient Intake Form Filling & Mobile OTP Verification
   */
  async fillPatientIntake(
    fullName: string,
    dob: string,
    gender: string,
    pincode: string,
    state: string,
    city: string,
    phone: string,
    otp: string
  ): Promise<void> {
    await this.enterFullName(fullName);
    await this.enterDateOfBirth(dob);
    await this.selectGender(gender);
    await this.enterPincode(pincode);
    await this.selectState(state);
    await this.enterCity(city);
    await this.enterMobileNumber(phone);
    await this.sendOtp(otp);
    await this.clickContinue();
    await this.verifyCarePackageScreenDisplayed();
  }

  /**
   * Existing Patient: Verification Modal Login & Profile Selection Workflow
   */
  async loginExistingPatientAndSelectProfile(
    baseUrl: string,
    phone: string,
    otp: string = '123456',
    profileIndex: number = 0
  ): Promise<void> {
    await this.navigateToBooking(baseUrl);
    await this.verifyBookingPageLoaded();
    await this.selectExistingPatient();
    await this.clickContinue();
    await this.verifyExistingPatientModalDisplayed();
    await this.enterExistingPatientPhone(phone);
    await this.sendExistingModalOtp(otp);
    await this.clickExistingModalVerifyContinue();

    const isMatched = await this.matchedPatientsHeading.isVisible().catch(() => false);
    if (isMatched) {
      await this.selectMatchedPatient(profileIndex);
    }
    if (await this.bookAnotherAppointmentButton.isVisible().catch(() => false)) {
      await this.clickBookAnotherAppointment();
    }
  }

  /**
   * Category 3: Care Package / Tier Selection
   */
  async selectCarePackageTier(carePackage: string): Promise<string> {
    const selected = await this.selectCarePackageByName(carePackage);
    await this.clickContinue();
    await this.verifyDateTimeScreenDisplayed();
    return selected;
  }

  /**
   * Category 4: Doctor, Calendar Date & Time Slot Scheduling
   */
  async selectDoctorAndScheduleSlot(
    doctor: string,
    appointmentDate: string,
    month: string,
    timeSlot: string
  ): Promise<void> {
    await this.selectDoctor(doctor);
    await this.selectDate(appointmentDate, month);
    await this.selectTimeSlot(timeSlot);
    await this.clickConfirm();
    await this.verifyAppointmentConfirmationDisplayed();
  }

  /**
   * Category 5: Confirmation & Data Integrity Verification
   */
  async verifyAppointmentConfirmationDetailsMatch(expectedFullName: string): Promise<void> {
    const heading = await this.getAppointmentConfirmationHeading();
    expect(heading).toBe('Appointment confirmed');

    const details = await this.getAppointmentConfirmationDetails();
    expect(details.confirmationPill).toBeTruthy();
    expect(details.confirmationPill.toLowerCase()).toContain(expectedFullName.toLowerCase());
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
    const isUpcoming = await this.upcomingAppointmentHeading.isVisible().catch(() => false);
    if (isUpcoming) {
      const isReschedule = await this.rescheduleAppointmentButton.isVisible().catch(() => false);
      if (isReschedule) {
        await super.clickOnElement(this.rescheduleAppointmentButton, this.clickedRescheduleLog);
      } else {
        await super.clickOnElement(this.bookAnotherAppointmentButton, this.clickedBookAnotherLog);
      }
    }
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.dateTimeSectionHeading],
      { state: BasePage.ElementState.VISIBLE },
      this.verifiedDateTimeScreenLog
    );
  }

  /** Asserts that the care package selection cards are visible. */
  async verifyCarePackageScreenDisplayed(): Promise<void> {
    await super.waitForListOfElementsToBeVisibleOrHidden(
      [this.packageSectionHeading, this.silverPackageCard],
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
    return (await this.globalErrorMessage.innerText().catch(() => '')).trim();
  }

  /** Returns the inner text of the DOB field error hint. */
  async getDobErrorHintText(): Promise<string> {
    return (await this.dobErrorHint.innerText().catch(() => '')).trim();
  }

  /** Returns the inner text of the Pincode field error hint. */
  async getPincodeErrorHintText(): Promise<string> {
    return (await this.pincodeErrorHint.innerText().catch(() => '')).trim();
  }

  /** Returns the raw input value of the pincode field. */
  async getPincodeInputValue(): Promise<string> {
    return await this.pincodeInput.inputValue();
  }

  /** Returns the inner text of the City field error hint. */
  async getCityErrorHintText(): Promise<string> {
    return (await this.cityErrorHint.innerText().catch(() => '')).trim();
  }

  /** Returns the inner text of the appointment confirmed heading. */
  async getAppointmentConfirmationHeading(): Promise<string> {
    await super.waitForListOfElementsToBeVisibleOrHidden([this.appointmentConfirmedHeading]);
    return (await this.appointmentConfirmedHeading.innerText()).trim();
  }

  /** Returns the text of the specified upcoming appointment card. */
  async getUpcomingAppointmentCardText(index: number = 0): Promise<string> {
    const card = this.upcomingAppointmentCards.nth(index);
    await super.waitForListOfElementsToBeVisibleOrHidden([card]);
    return (await card.innerText()).trim();
  }

  /**
   * Retrieves aggregated appointment confirmation details (heading, confirmation pill, card text, doctor, package, date).
   */
  async getAppointmentConfirmationDetails(): Promise<{
    confirmationHeading: string;
    confirmationPill: string;
    firstUpcomingCardText: string;
    patientName: string;
    doctorName: string;
    packageName: string;
    dateTime: string;
  }> {
    await super.waitForListOfElementsToBeVisibleOrHidden([this.appointmentConfirmedHeading]);
    const heading = (await this.appointmentConfirmedHeading.innerText().catch(() => '')).trim();

    const patientName = (await this.page.locator("//p[text()='Patient']/following-sibling::p").innerText().catch(() => '')).trim();
    const doctorName = (await this.page.locator("//p[text()='Doctor']/following-sibling::p").innerText().catch(() => '')).trim();
    const packageName = (await this.page.locator("//p[text()='Package']/following-sibling::p").innerText().catch(() => '')).trim();
    const dateTime = (await this.page.locator("//p[contains(text(), 'Date & time')]/following-sibling::p").innerText().catch(() => '')).trim();

    const firstCard = this.page.locator("(//ul//li)[1]");
    const card = (await firstCard.innerText().catch(() => '')).trim();
    const pill = patientName || (await this.appointmentConfirmationPill.innerText().catch(() => '')).trim() || card;

    return {
      confirmationHeading: heading,
      confirmationPill: pill,
      firstUpcomingCardText: card,
      patientName,
      doctorName,
      packageName,
      dateTime,
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
    return (await this.existingModalErrorMessage.innerText().catch(() => '')).trim();
  }

  /** Returns the current value of the phone input in the existing patient verification modal. */
  async getExistingModalPhoneInputValue(): Promise<string> {
    return await this.existingModalPhoneInput.inputValue();
  }

  /** Returns the current value of the date of birth input. */
  async getDobInputValue(): Promise<string> {
    return await this.dobInput.inputValue();
  }

  /** Returns the current value of the gender select. */
  async getGenderInputValue(): Promise<string> {
    return await this.genderSelect.inputValue();
  }

  /** Returns the current value of the state select. */
  async getStateInputValue(): Promise<string> {
    return await this.stateSelect.inputValue();
  }

  /** Returns the current value of the city input. */
  async getCityInputValue(): Promise<string> {
    return await this.cityInput.inputValue();
  }

  /** Returns the current value of the OTP input. */
  async getOtpInputValue(): Promise<string> {
    return await this.otpInput.inputValue();
  }

  /** Checks if the Silver package card is visible. */
  async isSilverPackageDisplayed(): Promise<boolean> {
    return await this.silverPackageCard.isVisible().catch(() => false);
  }

  /** Checks if the Gold package card is visible. */
  async isGoldPackageDisplayed(): Promise<boolean> {
    return await this.goldPackageCard.isVisible().catch(() => false);
  }

  /** Checks if the Platinum package card is visible. */
  async isPlatinumPackageDisplayed(): Promise<boolean> {
    return await this.platinumPackageCard.isVisible().catch(() => false);
  }

  /** Gets the text content of the Silver package card. */
  async getSilverPackageText(): Promise<string> {
    return (await this.silverPackageCard.innerText().catch(() => '')).trim();
  }

  /** Gets the text content of the Gold package card. */
  async getGoldPackageText(): Promise<string> {
    return (await this.goldPackageCard.innerText().catch(() => '')).trim();
  }

  /** Gets the text content of the Platinum package card. */
  async getPlatinumPackageText(): Promise<string> {
    return (await this.platinumPackageCard.innerText().catch(() => '')).trim();
  }

  /** Returns the list of doctor names displayed in doctor filter buttons. */
  async getDoctorList(): Promise<string[]> {
    const count = await this.doctorFilterButtons.count();
    const doctors: string[] = [];
    for (let i = 0; i < count; i++) {
      doctors.push((await this.doctorFilterButtons.nth(i).innerText()).trim());
    }
    return doctors;
  }

  /** Returns all currently visible available time slots. */
  async getAvailableSlotsList(): Promise<string[]> {
    const count = await this.slotButtons.count();
    const slots: string[] = [];
    for (let i = 0; i < count; i++) {
      const slot = this.slotButtons.nth(i);
      if (!(await slot.isDisabled().catch(() => false))) {
        slots.push((await slot.innerText()).trim());
      }
    }
    return slots;
  }

  /** Checks if a specific time slot is available and enabled. */
  async isSlotAvailable(timeSlot: string): Promise<boolean> {
    const slot = this.page.locator(`//button[contains(text(), ':') and contains(text(), '${timeSlot.trim()}') and not(@disabled)]`);
    return await slot.isVisible().catch(() => false);
  }

  /** Gets the count of upcoming appointment cards. */
  async getUpcomingAppointmentCardsCount(): Promise<number> {
    return await this.upcomingAppointmentCards.count().catch(() => 0);
  }
}

export { AwhBookingPage as BookingPage };
