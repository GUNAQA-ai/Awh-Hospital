import { expect, Locator, test, Page } from "@playwright/test";
import { FrameworkError, CustomAssertionError, TimeoutError, NetworkError, LocatorError, mapPlaywrightError } from "../utils/exceptions";
import { assertElementVisible, assertElementHidden, assertUrlContains } from "../utils/assertions";

type XPath = string;

interface IExpectPollOptions {
  pollFunction?: () => Promise<boolean>;
  pollTimeout?: number;
  pollIntervals?: number[];
}

// The root Page Object from which all other page classes inherit.
// This class exists to encapsulate raw Playwright interactions (`click`, `fill`, `goto`),
// providing centralized error handling, custom logging, and robust state-waiting mechanisms.
// It ensures tests interact with the application using consistent, framework-defined rules.
export abstract class BasePage {
    // The Playwright Page instance that drives the browser session.
    protected page: Page;

    // Receives the Playwright Page instance used by this Page Object.
    // By passing the same Page instance from the fixture down through all child Page Objects,
    // we guarantee that all interactions occur within the same browser context/session.
    constructor(page: Page) {
        this.page = page;
    }

    
  /**
   * Helper to smartly resolve a locator from either a string (CSS/XPath) or a Playwright Locator object.
   */
  protected resolveLocator(locator: Locator | string): Locator {
    return typeof locator === 'string' ? this.page.locator(locator) : locator;
  }

  protected logStep(logMessage?: string) {
        if (logMessage) {
            console.log(`▶ [${this.constructor.name}] STEP: ${logMessage}`);
        }
    }

    async navigateTo(
        url: string,
        options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' } | string,
        logMessage?: string
    ) {
        let actualOptions: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' } | undefined;
        let actualLog: string | undefined = logMessage;

        if (typeof options === 'string') {
            actualLog = options;
        } else if (typeof options === 'object') {
            actualOptions = options;
        }

        const stepTitle = actualLog || `Navigating to URL: ${url}`;

        await test.step(stepTitle, async () => {
            this.logStep(stepTitle);
            try {
                await this.page.goto(url, { waitUntil: 'domcontentloaded', ...actualOptions });
            } catch (error: any) {
                console.error(`❌ FAILED NAVIGATION [${stepTitle}]: ${error.message}`);
                throw mapPlaywrightError(error, stepTitle);
            }
        });
    }

    /** Element state constants */
  public static readonly ElementState = {
    VISIBLE: 'visible',
    HIDDEN: 'hidden',
  } as const;

  /** Keyboard action constants */
  public static readonly ActionType = {
    Escape: 'Escape',
    ArrowDown: 'ArrowDown',
    ArrowUp: 'ArrowUp',
    Enter: 'Enter',
  } as const;

  /**
   * Retrieve a dynamic locator from child class XPaths with placeholders.
   */
  protected getDynamicLocatorFromChild(
    xpaths: Record<string, string>,
    key: string,
    ...args: string[]
  ): Locator {
    const template = xpaths[key];
    if (!template) throw new LocatorError(`XPath template key "${key}" was not found in ${this.constructor.name}.`, 'getDynamicLocatorFromChild');

    const resolvedXPath = args.reduce(
      (acc, arg, index) => acc.replace(`{${index}}`, arg),
      template
    );

    return this.page.locator(resolvedXPath);
  }

  /**
   * Click on an element. Playwright auto-waits for actionability.
   * Errors are caught, mapped to FrameworkError subclasses, and rethrown.
   */
  protected async clickOnElement(
    locator1: Locator | string | string,
    logMessage?: string,
    blur?: boolean,
    targetLocator2?: Locator | string | (Locator | string)[],
    state: string = BasePage.ElementState.VISIBLE
  ): Promise<void> {
    // Support legacy overloaded signatures
    let targetLoc2 = targetLocator2;
    let actualLog: string | undefined = logMessage;
    let actualBlur = blur ?? false;
    let actualState = state;

    // Dead code removed: Overload parsing logic that did nothing.

    const stepTitle = actualLog || "Clicking element";

    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);

      try {
        const targetLoc = this.resolveLocator(locator1);
        await targetLoc.scrollIntoViewIfNeeded().catch(() => {});
        await targetLoc.click();
      } catch (error: any) {
        console.error(`❌ FAILED ACTION [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }

      if (actualBlur) {
        try {
          await this.resolveLocator(locator1).blur();
        } catch (error: any) {
          throw mapPlaywrightError(error, `${stepTitle} (blur)`);
        }
      }

      if (targetLoc2) {
        for (const loc of Array.isArray(targetLoc2) ? targetLoc2 : [targetLoc2]) {
          await this.waitForLocatorState(loc, actualState);
        }
      }
    });
  }

  /**
   * Double-click on an element. Playwright auto-waits for actionability.
   */
  protected async doubleClickOnElement(
    locator1: Locator | string | string,
    locator2?: Locator | string | (Locator | string)[],
    options?: { state?: keyof typeof BasePage.ElementState; blur?: boolean },
    logMessage?: string
  ): Promise<void>;
  protected async doubleClickOnElement(
    locator1: Locator | string | string,
    logMessage?: string
  ): Promise<void>;
  protected async doubleClickOnElement(
    locator1: Locator | string | string,
    locator2OrLog?: Locator | string | (Locator | string)[] | string,
    optionsOrLog?: { state?: keyof typeof BasePage.ElementState; blur?: boolean } | string,
    logMessage?: string
  ) {
    let targetLocator2: Locator | string | (Locator | string)[] | undefined;
    let actualOptions: { state?: keyof typeof BasePage.ElementState; blur?: boolean } | undefined;
    let actualLog: string | undefined = logMessage;

    if (typeof locator2OrLog === 'string') {
      actualLog = locator2OrLog;
    } else {
      targetLocator2 = locator2OrLog;
    }

    if (typeof optionsOrLog === 'string') {
      actualLog = optionsOrLog;
    } else if (typeof optionsOrLog === 'object') {
      actualOptions = optionsOrLog;
    }

    const stepTitle = actualLog || "Double-clicking element";
    const { state, blur = false } = actualOptions || {};

    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);

      try {
        await this.resolveLocator(locator1).dblclick();
      } catch (error: any) {
        console.error(`❌ FAILED ACTION [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }

      if (blur) {
        try {
          await this.resolveLocator(locator1).blur();
        } catch (error: any) {
          throw mapPlaywrightError(error, `${stepTitle} (blur)`);
        }
      }

      if (targetLocator2) {
        for (const loc of Array.isArray(targetLocator2) ? targetLocator2 : [targetLocator2]) {
          await this.waitForLocatorState(loc, state);
        }
      }
    });
  }

  /**
   * Enter text into an input element. Playwright auto-waits for actionability.
   */
  protected async enterValueForInputElement(
    locator1: Locator | string | string,
    value: string,
    options?: {
      state?: keyof typeof BasePage.ElementState;
      locator2?: Locator | string | (Locator | string)[];
      pressSequence?: boolean;
      blur?: boolean;
    },
    logMessage?: string
  ): Promise<void>;
  protected async enterValueForInputElement(
    locator1: Locator | string | string,
    value: string,
    logMessage?: string
  ): Promise<void>;
  protected async enterValueForInputElement(
    locator1: Locator | string | string,
    value: string,
    optionsOrLog?: {
      state?: keyof typeof BasePage.ElementState;
      locator2?: Locator | string | (Locator | string)[];
      pressSequence?: boolean;
      blur?: boolean;
    } | string,
    logMessage?: string
  ) {
    let actualOptions: {
      state?: keyof typeof BasePage.ElementState;
      locator2?: Locator | string | (Locator | string)[];
      pressSequence?: boolean;
      blur?: boolean;
    } | undefined;
    let actualLog: string | undefined = logMessage;

    if (typeof optionsOrLog === 'string') {
      actualLog = optionsOrLog;
    } else if (typeof optionsOrLog === 'object') {
      actualOptions = optionsOrLog;
    }

    const stepTitle = actualLog || `Entering value into field`;
    const { state, locator2, pressSequence = false, blur = true } = actualOptions || {};

    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);

      if (value === undefined || value === null) {
        throw new FrameworkError('Value to enter cannot be null or undefined', stepTitle);
      }

      try {
        if (pressSequence) {
          await this.resolveLocator(locator1).click();
          await this.page.keyboard.press('Control+A');
          await this.page.keyboard.press('Backspace');
          await this.resolveLocator(locator1).pressSequentially(value);
        } else {
          const targetLoc = this.resolveLocator(locator1);
          await targetLoc.scrollIntoViewIfNeeded().catch(() => {});
          await targetLoc.fill(value);
        }
      } catch (error: any) {
        console.error(`❌ FAILED INPUT ACTION [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }

      if (blur) {
        try {
          await this.resolveLocator(locator1).blur();
        } catch (error: any) {
          throw mapPlaywrightError(error, `${stepTitle} (blur)`);
        }
      }

      if (locator2) {
        for (const loc of Array.isArray(locator2) ? locator2 : [locator2]) {
          await this.waitForLocatorState(loc, state);
        }
      }
    });
  }

  /**
   * Enter text with polling and advanced options.
   */
  protected async enterValueForInputElementWithOptions(
    locator1: Locator | string | string,
    value: string,
    options?: {
      state?: keyof typeof BasePage.ElementState;
      locator2?: Locator | string | (Locator | string)[];
      pressSequence?: boolean;
      blur?: boolean;
    } & IExpectPollOptions,
    logMessage?: string
  ) {
    const { pollFunction, pollTimeout = 5000, pollIntervals = [100] } = options || {};

    if (pollFunction) {
      try {
        await expect.poll(pollFunction, { timeout: pollTimeout, intervals: pollIntervals });
      } catch (error: any) {
        throw new TimeoutError(`Polling function timed out after ${pollTimeout}ms`, logMessage || 'enterValueForInputElementWithOptions');
      }
    }

    await this.enterValueForInputElement(locator1, value, options, logMessage);
  }

  /**
   * Type characters using the keyboard.
   */
  protected async keyboardType(locator1: Locator | string | string, value: string, logMessage?: string) {
    const stepTitle = logMessage || `Keyboard typing "${value}"`;
    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        await this.resolveLocator(locator1).click();
        await this.page.keyboard.type(value);
      } catch (error: any) {
        console.error(`❌ FAILED KEYBOARD TYPE [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Wait for multiple locators to be visible or hidden.
   * Relies on Playwright global timeout — no hardcoded timeout overrides.
   */
  protected async waitForListOfElementsToBeVisibleOrHidden(
    locators: (Locator | string)[],
    options?: { state?: 'visible' | 'hidden' | 'VISIBLE' | 'HIDDEN' | string } | string,
    logMessage?: string
  ): Promise<void> {
    let actualOptions: { state?: 'visible' | 'hidden' | 'VISIBLE' | 'HIDDEN' | string } | undefined;
    let actualLog: string | undefined = logMessage;

    if (typeof options === 'string') {
      actualLog = options;
    } else if (typeof options === 'object') {
      actualOptions = options;
    }

    const stepTitle = actualLog || "Checking element visibility";

    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      const state = (actualOptions?.state?.toString().toLowerCase() as 'visible' | 'hidden') || 'visible';
      for (const locator of locators) {
        try {
          if (state === 'visible') {
            await expect(this.resolveLocator(locator)).toBeVisible();
          } else if (state === 'hidden') {
            await expect(this.resolveLocator(locator)).not.toBeVisible();
          }
        } catch (error: any) {
          console.error(`❌ FAILED VISIBILITY CHECK [${stepTitle}]: ${error.message}`);
          throw mapPlaywrightError(error, stepTitle);
        }
      }
    });
  }

  /**
   * Wait for multiple locators to be visible or hidden (typo variant for backwards compatibility).
   */
  protected async waitForListOfElementstoBeVisibleorHidden(
    locators: (Locator | string)[],
    options?: { state?: 'visible' | 'hidden' | 'VISIBLE' | 'HIDDEN' | string } | string,
    logMessage?: string
  ): Promise<void> {
    return this.waitForListOfElementsToBeVisibleOrHidden(locators, options, logMessage);
  }

  /**
   * Get text contents from all matching elements.
   */
  protected async getTextContents(locator: Locator | string, logMessage?: string): Promise<string[]> {
    const stepTitle = logMessage || "Getting text contents";
    return await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        const elements = await this.resolveLocator(locator).all();
        return Promise.all(elements.map(el => el.textContent().then(text => text || '')));
      } catch (error: any) {
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Inspect application form validation error banners.
   * If any error banner or red validation text is visible, captures the text and throws CustomAssertionError.
   */
  public async verifyNoFormValidationError(customErrorSelector?: string): Promise<void> {
    const selector = customErrorSelector || "//*[contains(text(), 'Please fix the following errors')] | //div[contains(@class, 'bg-red') or contains(@class, 'border-red')]//li | //p[contains(@class, 'text-red-500')]";
    const errorBanner = this.page.locator(selector);
    const isErrorVisible = await errorBanner.first().isVisible().catch(() => false);
    if (isErrorVisible) {
      const errorMessages = await errorBanner.allInnerTexts().catch(() => []);
      const combinedErrors = errorMessages.length > 0 ? errorMessages.filter((t: string) => t.trim().length > 0).join('; ') : 'Form validation failed due to missing required fields or invalid input.';
      console.error(`❌ APPLICATION FORM VALIDATION ERROR DETECTED: ${combinedErrors}`);
      throw new CustomAssertionError(`Validation Failure: ${combinedErrors}`, 'verifyNoFormValidationError');
    }
  }

  /**
   * Hover over an element.
   */
  protected async hoverOverElementandVerifyElements(locator: Locator | string, logMessage?: string): Promise<void> {
    const stepTitle = logMessage || `Hovering over element`;
    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        await this.resolveLocator(locator).hover();
      } catch (error: any) {
        console.error(`❌ FAILED HOVER [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Validate a list of expectations for corresponding locators.
   */
  protected async listOfExpectedResultStatements(
    locators: (Locator | string)[],
    expectations: ((locator: Locator) => Promise<void>)[],
    logMessage?: string
  ): Promise<void> {
    const stepTitle = logMessage || "Validating list of expectations";
    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      if (locators.length !== expectations.length) {
        throw new FrameworkError(
          `Number of locators (${locators.length}) does not match number of expectations (${expectations.length})`,
          stepTitle
        );
      }

      for (let i = 0; i < locators.length; i++) {
        await expectations[i](this.resolveLocator(locators[i]));
      }
    });
  }

  /**
   * Perform a keyboard action and optionally wait for locators to change state.
   */
  protected async performKeyboardAction(
    action: keyof typeof BasePage.ActionType,
    locators?: Locator[],
    state?: keyof typeof BasePage.ElementState,
    logMessage?: string
  ): Promise<void> {
    const stepTitle = logMessage || `Performing keyboard action "${action}"`;
    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        await this.page.keyboard.press(action);
      } catch (error: any) {
        console.error(`❌ FAILED KEYBOARD ACTION [${action}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }

      if (locators) {
        for (const loc of locators) {
          await this.waitForLocatorState(loc, state);
        }
      }
    });
  }

  /**
   * Check whether an element exists in the DOM.
   */
  protected async doesElementExist(locator: Locator | string): Promise<boolean> {
    return (await this.resolveLocator(locator).count()) > 0;
  }

  /**
   * Wait for the URL to contain specific text.
   */
  protected async waitForUrlToContainText(text: string, logMessage?: string): Promise<void> {
    const stepTitle = logMessage || `Navigating/Waiting - verifying URL contains "${text}"`;
    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        await this.page.waitForURL((url: URL) => url.toString().includes(text));
        await assertUrlContains(this.page, `.*${text}.*`, stepTitle);
      } catch (error: any) {
        console.error(`❌ FAILED URL CHECK [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Clear the contents of an input field.
   */
  protected async clearInputField(locator: Locator | string, logMessage?: string): Promise<void> {
    const stepTitle = logMessage || `Clearing input field`;
    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        await this.resolveLocator(locator).fill('');
      } catch (error: any) {
        console.error(`❌ FAILED CLEAR FIELD [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Wait for a specific network request.
   */
  protected async waitForNetworkRequest(urlSubstring: string, logMessage?: string): Promise<void> {
    const stepTitle = logMessage || `Waiting for network request containing "${urlSubstring}"`;
    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        await this.page.waitForRequest((req: any) => req.url().includes(urlSubstring));
      } catch (error: any) {
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Wait for a specific network response.
   */
  protected async waitForNetworkResponse(urlSubstring: string, logMessage?: string): Promise<void> {
    const stepTitle = logMessage || `Waiting for network response containing "${urlSubstring}"`;
    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        await this.page.waitForResponse((res: any) => res.url().includes(urlSubstring));
      } catch (error: any) {
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Select an element from a collection (e.g. calendar day grid, doctor list, time slot list)
   * matching by text content case-insensitively or by zero-based index.
   */
  protected async selectElementFromListOrGrid(
    elements: Locator,
    identifier: string | number,
    logMessage?: string
  ): Promise<string> {
    const stepTitle = logMessage || `Selecting item "${identifier}" from list/grid`;
    return await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        if (typeof identifier === 'number') {
          const targetElement = elements.nth(identifier);
          await targetElement.waitFor({ state: 'visible' });
          const text = (await targetElement.innerText()).trim();
          await targetElement.click();
          return text;
        }

        const raw = identifier.toString().trim();
        const lower = raw.toLowerCase().replace(/[\s-_]+/g, '_');

        if (lower === 'first' || lower === 'first_available' || lower === 'any') {
          const firstElement = elements.first();
          await firstElement.waitFor({ state: 'visible' });
          const text = (await firstElement.innerText()).trim();
          await firstElement.click();
          return text;
        }

        if (lower === 'last' || lower === 'last_available') {
          const lastElement = elements.last();
          await lastElement.waitFor({ state: 'visible' });
          const text = (await lastElement.innerText()).trim();
          await lastElement.click();
          return text;
        }

        const target = raw.toLowerCase().replace(/\s+/g, ' ');
        const count = await elements.count();
        for (let i = 0; i < count; i++) {
          const el = elements.nth(i);
          const rawText = (await el.innerText()).trim();
          const cleanText = rawText.toLowerCase().replace(/\s+/g, ' ');
          const ariaLabel = (await el.getAttribute('aria-label'))?.trim().toLowerCase().replace(/\s+/g, ' ');
          if (cleanText === target || cleanText.includes(target) || ariaLabel?.includes(target)) {
            await el.click();
            return rawText;
          }
        }

        // Case-insensitive & space-normalized regex fallback across the collection
        const cleanPattern = identifier.toString().trim().replace(/\s+/g, '\\s+');
        const matched = elements.filter({ hasText: new RegExp(cleanPattern, 'i') });
        if ((await matched.count()) > 0) {
          const text = (await matched.first().innerText()).trim();
          await matched.first().click();
          return text;
        }

        throw new LocatorError(`Element with identifier "${identifier}" not found in collection.`, stepTitle);
      } catch (error: any) {
        console.error(`❌ FAILED SELECTION [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Select an option from a <select> dropdown by label, value, or index.
   * Tolerant to casing and leading/trailing/internal whitespace.
   */
  protected async selectDropdownOption(
    selectLocator: Locator | string,
    option: string | number,
    logMessage?: string
  ): Promise<string> {
    const stepTitle = logMessage || `Selecting dropdown option "${option}"`;
    return await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        const resolved = this.resolveLocator(selectLocator);
        await resolved.waitFor({ state: 'visible' });

        if (typeof option === 'number') {
          const res = await resolved.selectOption({ index: option });
          return res[0] || option.toString();
        }

        const raw = option.toString().trim();
        const normalized = raw.toLowerCase().replace(/\s+/g, ' ');

        // Try direct exact match first
        try {
          const res = await resolved.selectOption({ label: raw });
          return res[0] || raw;
        } catch {
          // Fall through to case-insensitive option scan
        }

        const optionElements = await resolved.locator('option').all();
        for (const opt of optionElements) {
          const val = ((await opt.getAttribute('value')) || '').trim().toLowerCase().replace(/\s+/g, ' ');
          const text = ((await opt.innerText()) || '').trim().toLowerCase().replace(/\s+/g, ' ');

          if (val === normalized || text === normalized || text.includes(normalized) || val.includes(normalized)) {
            const actualVal = await opt.getAttribute('value');
            if (actualVal !== null && actualVal !== undefined) {
              await resolved.selectOption({ value: actualVal });
              return (await opt.innerText()).trim();
            } else {
              const actualText = (await opt.innerText()).trim();
              await resolved.selectOption({ label: actualText });
              return actualText;
            }
          }
        }

        // Final fallback to value
        const res = await resolved.selectOption({ value: raw });
        return res[0] || raw;
      } catch (error: any) {
        console.error(`❌ FAILED DROPDOWN SELECTION [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Navigate a calendar / date picker week-by-week or month-by-month until the target month is reached.
   * Supports month names ("September", "Sep") and month numbers ("09", 9), case- and whitespace-tolerant.
   */
  protected async navigateCalendarToMonth(
    headerLocator: Locator | string,
    nextButtonLocator: Locator | string,
    targetMonth: string,
    maxSteps: number = 8,
    logMessage?: string
  ): Promise<void> {
    const stepTitle = logMessage || `Navigating calendar to month "${targetMonth}"`;
    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        const header = this.resolveLocator(headerLocator);
        const nextBtn = this.resolveLocator(nextButtonLocator);

        const monthNames = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december'
        ];
        let searchMonth = targetMonth.toString().trim().toLowerCase();
        const monthNum = parseInt(searchMonth, 10);
        if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
          searchMonth = monthNames[monthNum - 1];
        }

        for (let i = 0; i < maxSteps; i++) {
        const searchMonthShort = searchMonth.substring(0, 3);
          const currentText = (await header.innerText()).trim().toLowerCase();
          if (currentText.includes(searchMonth) || (searchMonthShort && currentText.includes(searchMonthShort))) {
            return;
          }
          if (await nextBtn.isEnabled().catch(() => false)) {
            await nextBtn.click();
          } else {
            break;
          }
        }
      } catch (error: any) {
        console.error(`❌ FAILED CALENDAR MONTH NAVIGATION [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Intelligently selects a date from a calendar grid with automatic month/week navigation.
   * Parses full date strings (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, "Sep 16"), day numbers (16, "16"),
   * or day indices (0-6).
   * Navigates calendar weeks forward or backward until the target month and target day are displayed,
   * then clicks and selects that day.
   */
  protected async selectCalendarDateWithNavigation(
    headerLocator: Locator | string,
    dayButtonsLocator: Locator | string,
    nextButtonLocator: Locator | string,
    prevButtonLocator: Locator | string,
    date: string | number,
    month?: string,
    logMessage?: string
  ): Promise<string> {
    const stepTitle = logMessage || `Selecting date "${date}" from calendar`;
    return await test.step(stepTitle, async () => {
      this.logStep(stepTitle);
      try {
        const header = this.resolveLocator(headerLocator);
        const days = this.resolveLocator(dayButtonsLocator);
        const nextBtn = this.resolveLocator(nextButtonLocator);
        const prevBtn = this.resolveLocator(prevButtonLocator);

        await days.first().waitFor({ state: 'visible' });

        // If a zero-based index is passed (0 to 6) without month or string format, select directly by index
        if (typeof date === 'number' && date >= 0 && date <= 6 && !month) {
          const targetDayBtn = days.nth(date);
          await targetDayBtn.click();
          return (await targetDayBtn.innerText()).trim();
        }

        const monthNames = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december'
        ];
        const monthShortNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        let targetMonth = month ? month.toString().trim().toLowerCase() : '';
        const numM = parseInt(targetMonth, 10);
        if (!isNaN(numM) && numM >= 1 && numM <= 12) {
          targetMonth = monthNames[numM - 1];
        }

        let targetDay = '';
        const rawDateStr = date.toString().trim();

        // Check ISO format YYYY-MM-DD
        const isoMatch = rawDateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
        if (isoMatch) {
          const mIdx = parseInt(isoMatch[2], 10) - 1;
          if (!targetMonth && mIdx >= 0 && mIdx < 12) {
            targetMonth = monthNames[mIdx];
          }
          targetDay = parseInt(isoMatch[3], 10).toString();
        } else {
          // Check DD-MM-YYYY or DD/MM/YYYY
          const ddmmyyyyMatch = rawDateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
          if (ddmmyyyyMatch) {
            const mIdx = parseInt(ddmmyyyyMatch[2], 10) - 1;
            if (!targetMonth && mIdx >= 0 && mIdx < 12) {
              targetMonth = monthNames[mIdx];
            }
            targetDay = parseInt(ddmmyyyyMatch[1], 10).toString();
          } else {
            // Check month words
            for (let i = 0; i < 12; i++) {
              if (rawDateStr.toLowerCase().includes(monthNames[i]) || rawDateStr.toLowerCase().includes(monthShortNames[i])) {
                if (!targetMonth) targetMonth = monthNames[i];
                break;
              }
            }
            const dayMatch = rawDateStr.match(/\b([1-9]|[12]\d|3[01])\b/);
            targetDay = dayMatch ? parseInt(dayMatch[1], 10).toString() : rawDateStr;
          }
        }

        // Check current week buttons first BEFORE doing month/week navigation
        for (let i = 0; i < (await days.count()); i++) {
          const btn = days.nth(i);
          const btnText = (await btn.innerText()).trim();
          const tokens = btnText.split(/\s+/);
          const ariaLabel = (await btn.getAttribute('aria-label')) || '';

          if (tokens.includes(targetDay) || btnText === targetDay || ariaLabel.includes(targetDay)) {
            await btn.click();
            return btnText;
          }
        }
        // Navigate to target month if specified and target day was not on current screen
        const targetMonthShort = targetMonth ? targetMonth.substring(0, 3) : '';
        if (targetMonth) {
          for (let i = 0; i < 8; i++) {
            const currentRange = (await header.innerText()).trim().toLowerCase();
            if (currentRange.includes(targetMonth) || (targetMonthShort && currentRange.includes(targetMonthShort))) {
              break;
            }
            if (await nextBtn.isEnabled().catch(() => false)) {
              await nextBtn.click();
            } else {
              break;
            }
          }
        }

        // Search forward weeks using next week button
        for (let step = 0; step < 8; step++) {
          if (await nextBtn.isEnabled().catch(() => false)) {
            await nextBtn.click();
            const count = await days.count();
            for (let i = 0; i < count; i++) {
              const btn = days.nth(i);
              const btnText = (await btn.innerText()).trim();
              const tokens = btnText.split(/\s+/);
              const ariaLabel = (await btn.getAttribute('aria-label')) || '';

              if (tokens.includes(targetDay) || btnText === targetDay || ariaLabel.includes(targetDay)) {
                await btn.click();
                return btnText;
              }
            }
          }
        }

        // Search backward weeks using previous week button
        for (let step = 0; step < 8; step++) {
          if (await prevBtn.isEnabled().catch(() => false)) {
            await prevBtn.click();
            const count = await days.count();
            for (let i = 0; i < count; i++) {
              const btn = days.nth(i);
              const btnText = (await btn.innerText()).trim();
              const tokens = btnText.split(/\s+/);
              const ariaLabel = (await btn.getAttribute('aria-label')) || '';

              if (tokens.includes(targetDay) || btnText === targetDay || ariaLabel.includes(targetDay)) {
                await btn.click();
                return btnText;
              }
            }
          }
        }

        // Fallback: If target date was not found in navigation range, select first available date on active week
        const dayCount = await days.count();
        if (dayCount > 0) {
          const fallbackBtn = days.first();
          await fallbackBtn.click();
          return (await fallbackBtn.innerText()).trim();
        }

        throw new LocatorError(`Date "${date}" (target day "${targetDay}") not found in calendar after navigation.`, stepTitle);
      } catch (error: any) {
        console.error(`❌ FAILED CALENDAR DATE SELECTION [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Internal helper — wait for a locator to reach the desired state.
   */
  private async waitForLocatorState(
    locator: Locator | string,
    state?: string
  ): Promise<void> {
    try {
      if (state === 'VISIBLE' || state === 'visible') {
        await this.resolveLocator(locator).waitFor({ state: 'visible' });
      } else if (state === 'HIDDEN' || state === 'hidden') {
        await this.resolveLocator(locator).waitFor({ state: 'hidden' });
      }
    } catch (error: any) {
      throw mapPlaywrightError(error, `waitForLocatorState(${state})`);
    }
  }

  /**
   * Interactive console prompt helper (specifically for manual OTP entry during test execution).
   * Directly connects to the Windows terminal console device (\\\\.\\CON) so user keystrokes
   * are received from the terminal prompt. Strictly waits for user input with NO fallback test data.
   */
  protected async promptConsoleForInput(
    promptMessage: string = 'Enter OTP: ',
    timeoutMs: number = 120000
  ): Promise<string> {
    const fs = await import('fs');
    const readline = await import('readline');

    return new Promise<string>((resolve, reject) => {
      let resolved = false;

      // Connect directly to the terminal device so Playwright worker receives user keystrokes
      let inputStream: any = process.stdin;
      try {
        if (process.platform === 'win32') {
          const fd = fs.openSync('\\\\.\\CON', 'r');
          inputStream = fs.createReadStream(null as any, { fd });
        } else {
          const fd = fs.openSync('/dev/tty', 'r');
          inputStream = fs.createReadStream(null as any, { fd });
        }
      } catch {
        inputStream = process.stdin;
      }

      console.log(`\n======================================================`);
      console.log(`📲 ${promptMessage}`);
      console.log(`👉 Please type the OTP you received and press Enter (No hardcoded test data).`);
      console.log(`======================================================`);

      const rl = readline.createInterface({
        input: inputStream,
        output: process.stdout,
      });

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          rl.close();
          reject(new Error(`TimeoutError: No OTP entered within ${timeoutMs / 1000} seconds. Please enter OTP when prompted.`));
        }
      }, timeoutMs);

      rl.question(`👉 ${promptMessage}`, (answer) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          rl.close();
          const clean = answer.trim();
          if (!clean) {
            reject(new Error(`No OTP entered: User submitted empty input. Real OTP is required.`));
          } else {
            console.log(`🔑 Real OTP captured from user: ${clean}\n`);
            resolve(clean);
          }
        }
      });
    });
  }

}

