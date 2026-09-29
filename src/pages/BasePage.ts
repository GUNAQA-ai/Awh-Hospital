/**
 * @file BasePage.ts
 * @description
 * Abstract base Page Object that encapsulates Playwright browser interactions,
 * resilient element resolution, custom error mapping, step logging, and state-waiting mechanisms.
 * All concrete page objects in the test automation framework inherit from this class.
 *
 * Responsibilities:
 * - Wrap fundamental Playwright operations (click, fill, navigate, select, wait) with consistent error handling.
 * - Map low-level Playwright errors to custom FrameworkError subclasses for uniform defect diagnosis.
 * - Provide intelligent selection mechanisms for calendar date pickers, dropdowns, and dynamic grid collections.
 * - Standardize test step reporting and console step output across all page interactions.
 * - Facilitate interactive manual OTP input via OS-level terminal streams when automated OTP bypass is not configured.
 *
 * Major Classes:
 * - {@link BasePage} - Abstract foundation class for all page objects.
 *
 * Dependencies:
 * - `@playwright/test`: Core browser automation and test step fixtures.
 * - `../utils/exceptions`: Custom framework exception hierarchy and Playwright error mapper.
 * - `../utils/assertions`: Reusable assertion utilities with defect classification.
 *
 * Assumptions:
 * - Tests run in an active browser context managed by Playwright fixtures (`Page`).
 * - All locators passed are either valid Playwright Locator objects or compliant CSS/XPath string selectors.
 *
 * Side Effects:
 * - Executes browser actions that alter DOM state, trigger network traffic, and navigate routes.
 * - Emits formatted log steps to stdout and Playwright test step reports.
 *
 * Usage Considerations:
 * - Do not instantiate BasePage directly; extend it in concrete Page Objects (e.g., AwhBookingPage).
 * - Never hardcode timeouts inside method calls; rely on configured Playwright expectations and polling.
 */

import { expect, Locator, test, Page } from "@playwright/test";
import { FrameworkError, CustomAssertionError, TimeoutError, NetworkError, LocatorError, mapPlaywrightError } from "../utils/exceptions";
import { assertElementVisible, assertElementHidden, assertUrlContains } from "../utils/assertions";

/**
 * Type alias representing an XPath selector string.
 */
type XPath = string;

/**
 * Configuration options for polling expectations in advanced input actions.
 */
interface IExpectPollOptions {
  /**
   * Predicate function returning a boolean promise to evaluate on each poll interval.
   */
  pollFunction?: () => Promise<boolean>;

  /**
   * Maximum duration in milliseconds to continue polling before timing out.
   * Default: 5000ms.
   */
  pollTimeout?: number;

  /**
   * Array of polling interval steps in milliseconds.
   * Default: [100].
   */
  pollIntervals?: number[];
}

/**
 * The root Page Object from which all other page classes inherit.
 *
 * This class encapsulates raw Playwright interactions (`click`, `fill`, `goto`),
 * providing centralized error handling, custom logging, and robust state-waiting mechanisms.
 * It ensures tests interact with the application using consistent, framework-defined rules.
 *
 * @class BasePage
 */
export abstract class BasePage {
  /**
   * The Playwright Page instance that drives the browser session.
   * Protected so that inheriting page classes can access core page features when necessary.
   */
  protected page: Page;

  /**
   * Initializes the BasePage instance with the active Playwright browser Page.
   *
   * @param {Page} page
   *        Required.
   *        The active Playwright Page object representing the open browser tab/context.
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Smartly resolves an element reference from either a raw string (CSS/XPath) or an existing Playwright Locator.
   *
   * @param {Locator | string} locator
   *        Required.
   *        Either an existing Playwright Locator instance or a CSS/XPath string selector.
   *        Example: "//button[@type='submit']" or this.page.locator("#submit-btn")
   * @returns {Locator}
   *          A resolved Playwright Locator ready for chaining or action calls.
   */
  protected resolveLocator(locator: Locator | string): Locator {
    return typeof locator === 'string' ? this.page.locator(locator) : locator;
  }

  /**
   * Emits a standardized step log message to stdout prefixed with the calling class name.
   *
   * @param {string} [logMessage]
   *        Optional.
   *        The human-readable log message describing the current action or state transition.
   *        Example: "Submitting intake form"
   * @returns {void}
   */
  protected logStep(logMessage?: string): void {
    if (logMessage) {
      console.log(`▶ [${this.constructor.name}] STEP: ${logMessage}`);
    }
  }

  /**
   * Navigates the browser to the specified URL with custom wait conditions and structured error mapping.
   *
   * @param {string} url
   *        Required.
   *        The absolute or relative destination URL.
   *        Expected format: valid URL string.
   *        Example: "https://awh-website-booking-form.vercel.app/"
   * @param {{ waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' } | string} [options]
   *        Optional.
   *        Either an object specifying the navigation lifecycle event to wait for,
   *        or a string representing the step log title.
   *        Default: { waitUntil: 'domcontentloaded' }
   * @param {string} [logMessage]
   *        Optional.
   *        Custom step title used when options is passed as a configuration object.
   * @returns {Promise<void>}
   *          Resolves once navigation completes and the specified lifecycle condition is satisfied.
   * @throws {FrameworkError}
   *         Thrown if navigation fails due to DNS resolution, connection timeout, or invalid URL.
   *
   * @example
   * await this.navigateTo('https://awh-website-booking-form.vercel.app/', 'Navigating to Booking Portal');
   */
  async navigateTo(
    url: string,
    options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' } | string,
    logMessage?: string
  ): Promise<void> {
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

  /** Element state constants used for asserting visibility conditions */
  public static readonly ElementState = {
    VISIBLE: 'visible',
    HIDDEN: 'hidden',
  } as const;

  /** Keyboard action key constants for simulating standard keyboard interactions */
  public static readonly ActionType = {
    Escape: 'Escape',
    ArrowDown: 'ArrowDown',
    ArrowUp: 'ArrowUp',
    Enter: 'Enter',
  } as const;

  /**
   * Retrieves a dynamic locator by substituting positional arguments into an XPath template string.
   *
   * @param {Record<string, string>} xpaths
   *        Required.
   *        A dictionary mapping template keys to XPath strings containing `{0}`, `{1}`, etc. placeholders.
   * @param {string} key
   *        Required.
   *        The key identifying the desired XPath template in the dictionary.
   *        Example: "doctorCardByName"
   * @param {...string} args
   *        Required.
   *        Variable list of string parameters to substitute into the template placeholders in sequence.
   * @returns {Locator}
   *          The resolved Playwright Locator pointing to the constructed dynamic XPath.
   * @throws {LocatorError}
   *         Thrown when the specified template key does not exist in the provided xpaths dictionary.
   *
   * @example
   * const loc = this.getDynamicLocatorFromChild(xpaths, 'userByName', 'John Doe');
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
   * Clicks on an element, automatically scrolling it into view and mapping any Playwright actionability errors.
   * Optionally triggers a blur event and waits for subsequent locator states.
   *
   * @param {Locator | string} locator1
   *        Required.
   *        The primary target element to click. Can be a Playwright Locator or a CSS/XPath string.
   * @param {string} [logMessage]
   *        Optional.
   *        Description of the click action for test step reporting and console output.
   * @param {boolean} [blur=false]
   *        Optional.
   *        Whether to invoke `.blur()` on the element immediately after clicking.
   *        Default: false.
   * @param {Locator | string | (Locator | string)[]} [targetLocator2]
   *        Optional.
   *        One or more locators to wait for after the click operation finishes.
   * @param {string} [state=BasePage.ElementState.VISIBLE]
   *        Optional.
   *        The expected visibility state of targetLocator2 ('visible' or 'hidden').
   *        Default: 'visible'.
   * @returns {Promise<void>}
   *          Resolves once the click action and all subsequent optional waits have completed.
   * @throws {FrameworkError}
   *         Thrown if the element is not actionable, covered, detached, or fails during the click.
   *
   * @example
   * await this.clickOnElement('//button[@type="submit"]', 'Submit intake form');
   */
  protected async clickOnElement(
    locator1: Locator | string,
    logMessage?: string,
    blur?: boolean,
    targetLocator2?: Locator | string | (Locator | string)[],
    state: string = BasePage.ElementState.VISIBLE
  ): Promise<void> {
    let targetLoc2 = targetLocator2;
    let actualLog: string | undefined = logMessage;
    let actualBlur = blur ?? false;
    let actualState = state;

    const stepTitle = actualLog || "Clicking element";

    await test.step(stepTitle, async () => {
      this.logStep(stepTitle);

      try {
        const targetLoc = this.resolveLocator(locator1);
        // Scroll into view if needed to prevent elements hidden beneath sticky headers from failing
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
   * Double-clicks on an element with automatic actionability waiting and optional post-action assertions.
   *
   * @overload
   * @param {Locator | string} locator1
   * @param {Locator | string | (Locator | string)[]} [locator2]
   * @param {{ state?: keyof typeof BasePage.ElementState; blur?: boolean }} [options]
   * @param {string} [logMessage]
   * @returns {Promise<void>}
   *
   * @overload
   * @param {Locator | string} locator1
   * @param {string} [logMessage]
   * @returns {Promise<void>}
   */
  protected async doubleClickOnElement(
    locator1: Locator | string,
    locator2?: Locator | string | (Locator | string)[],
    options?: { state?: keyof typeof BasePage.ElementState; blur?: boolean },
    logMessage?: string
  ): Promise<void>;
  protected async doubleClickOnElement(
    locator1: Locator | string,
    logMessage?: string
  ): Promise<void>;
  protected async doubleClickOnElement(
    locator1: Locator | string,
    locator2OrLog?: Locator | string | (Locator | string)[] | string,
    optionsOrLog?: { state?: keyof typeof BasePage.ElementState; blur?: boolean } | string,
    logMessage?: string
  ): Promise<void> {
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
   * Enters text into an input field using either direct `.fill()` or sequential keystroke emulation.
   * Automatically clears existing content when using sequential typing, and optionally triggers a blur event
   * to ensure React/Vue/Angular onBlur validation triggers execute properly.
   *
   * @overload
   * @param {Locator | string} locator1
   * @param {string} value
   * @param {object} [options]
   * @param {string} [logMessage]
   * @returns {Promise<void>}
   *
   * @overload
   * @param {Locator | string} locator1
   * @param {string} value
   * @param {string} [logMessage]
   * @returns {Promise<void>}
   */
  protected async enterValueForInputElement(
    locator1: Locator | string,
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
    locator1: Locator | string,
    value: string,
    logMessage?: string
  ): Promise<void>;
  protected async enterValueForInputElement(
    locator1: Locator | string,
    value: string,
    optionsOrLog?: {
      state?: keyof typeof BasePage.ElementState;
      locator2?: Locator | string | (Locator | string)[];
      pressSequence?: boolean;
      blur?: boolean;
    } | string,
    logMessage?: string
  ): Promise<void> {
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
          // Emulate real user keystrokes: click, select all, clear, then type sequentially.
          // This ensures masked input fields and reactive single-page app listeners capture every key.
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
        // Blur triggers onBlur validation handlers in React controlled forms
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
   * Enters text into an input field with pre-condition polling verification.
   *
   * @param {Locator | string} locator1
   *        Required.
   *        Target input element locator or string selector.
   * @param {string} value
   *        Required.
   *        Text value to enter into the field.
   * @param {object} [options]
   *        Optional.
   *        Configuration options including input controls and polling parameters.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for logging and reporting.
   * @returns {Promise<void>}
   *          Resolves once polling passes and the value is entered.
   * @throws {TimeoutError}
   *         Thrown if the provided pollFunction does not return true within pollTimeout.
   */
  protected async enterValueForInputElementWithOptions(
    locator1: Locator | string,
    value: string,
    options?: {
      state?: keyof typeof BasePage.ElementState;
      locator2?: Locator | string | (Locator | string)[];
      pressSequence?: boolean;
      blur?: boolean;
    } & IExpectPollOptions,
    logMessage?: string
  ): Promise<void> {
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
   * Types characters into the target element using direct keyboard simulation.
   *
   * @param {Locator | string} locator1
   *        Required.
   *        Target element to receive keyboard events.
   * @param {string} value
   *        Required.
   *        String containing characters to type.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title describing the typing action.
   * @returns {Promise<void>}
   *          Resolves after keyboard events are dispatched.
   * @throws {FrameworkError}
   *         Thrown if the element cannot be focused or keyboard input fails.
   */
  protected async keyboardType(locator1: Locator | string, value: string, logMessage?: string): Promise<void> {
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
   * Verifies that each element in a given list matches the desired visibility state ('visible' or 'hidden').
   * Relies on standard Playwright expect assertion timeouts.
   *
   * @param {(Locator | string)[]} locators
   *        Required.
   *        Array of locators or string selectors to check.
   * @param {{ state?: 'visible' | 'hidden' | 'VISIBLE' | 'HIDDEN' | string } | string} [options]
   *        Optional.
   *        Configuration object specifying expected state ('visible' or 'hidden'), or a log message string.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<void>}
   *          Resolves if all elements satisfy the required state.
   * @throws {FrameworkError}
   *         Thrown if any element fails the visibility expectation.
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
   * Backward-compatibility wrapper for {@link waitForListOfElementsToBeVisibleOrHidden}.
   *
   * @param {(Locator | string)[]} locators
   * @param {{ state?: 'visible' | 'hidden' | 'VISIBLE' | 'HIDDEN' | string } | string} [options]
   * @param {string} [logMessage]
   * @returns {Promise<void>}
   */
  protected async waitForListOfElementstoBeVisibleorHidden(
    locators: (Locator | string)[],
    options?: { state?: 'visible' | 'hidden' | 'VISIBLE' | 'HIDDEN' | string } | string,
    logMessage?: string
  ): Promise<void> {
    return this.waitForListOfElementsToBeVisibleOrHidden(locators, options, logMessage);
  }

  /**
   * Retrieves the trimmed text contents of all DOM elements matching the given locator.
   *
   * @param {Locator | string} locator
   *        Required.
   *        The locator matching one or more elements.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<string[]>}
   *          Array of text strings from all matched elements.
   * @throws {FrameworkError}
   *         Thrown if element querying fails.
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
   * Inspects the page DOM for application-level form validation error banners or error messages.
   * If any error banner or red validation text is visible, captures the text and throws CustomAssertionError.
   *
   * @param {string} [customErrorSelector]
   *        Optional.
   *        Custom selector targeting specific error containers. If omitted, uses standard framework error selectors.
   * @returns {Promise<void>}
   *          Resolves if no validation errors are visible.
   * @throws {CustomAssertionError}
   *         Thrown when form validation error text is detected on screen.
   */
  public async verifyNoFormValidationError(customErrorSelector?: string): Promise<void> {
    const selector = customErrorSelector || "//*[contains(text(), 'Please fix the following errors')] | //div[contains(@class, 'bg-red') or contains(@class, 'border-red')]//li | //p[contains(@class, 'text-red-500')]";
    const errorBanner = this.page.locator(selector);
    const isErrorVisible = await errorBanner.nth(0).isVisible().catch(() => false);
    if (isErrorVisible) {
      const errorMessages = await errorBanner.allInnerTexts().catch(() => []);
      const combinedErrors = errorMessages.length > 0 ? errorMessages.filter((t: string) => t.trim().length > 0).join('; ') : 'Form validation failed due to missing required fields or invalid input.';
      console.error(`❌ APPLICATION FORM VALIDATION ERROR DETECTED: ${combinedErrors}`);
      throw new CustomAssertionError(`Validation Failure: ${combinedErrors}`, 'verifyNoFormValidationError');
    }
  }

  /**
   * Hovers over the target element.
   *
   * @param {Locator | string} locator
   *        Required.
   *        Element to hover over.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<void>}
   * @throws {FrameworkError}
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
   * Validates a paired list of locators against corresponding async expectation assertions.
   *
   * @param {(Locator | string)[]} locators
   *        Required.
   *        Array of elements to validate.
   * @param {((locator: Locator) => Promise<void>)[]} expectations
   *        Required.
   *        Array of async expectation functions corresponding 1-to-1 with the locators array.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<void>}
   * @throws {FrameworkError}
   *         Thrown if array lengths mismatch or any individual expectation assertion fails.
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
   * Dispatches a keyboard key press action and optionally waits for dependent locators to reach an expected state.
   *
   * @param {keyof typeof BasePage.ActionType} action
   *        Required.
   *        Key identifier from {@link BasePage.ActionType} (e.g. 'Escape', 'Enter', 'ArrowDown').
   * @param {Locator[]} [locators]
   *        Optional.
   *        Locators to wait for following the key press.
   * @param {keyof typeof BasePage.ElementState} [state]
   *        Optional.
   *        Desired visibility state of the locators.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<void>}
   * @throws {FrameworkError}
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
   * Checks whether at least one instance of the given locator exists in the DOM.
   *
   * @param {Locator | string} locator
   *        Required.
   *        The element to check.
   * @returns {Promise<boolean>}
   *          True if element count > 0; otherwise false.
   */
  protected async doesElementExist(locator: Locator | string): Promise<boolean> {
    return (await this.resolveLocator(locator).count()) > 0;
  }

  /**
   * Waits for the browser URL to contain the specified text substring and asserts correctness.
   *
   * @param {string} text
   *        Required.
   *        Expected substring within the URL.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<void>}
   * @throws {FrameworkError}
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
   * Clears all text from an input field by setting its value to an empty string.
   *
   * @param {Locator | string} locator
   *        Required.
   *        Input element locator or string selector.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<void>}
   * @throws {FrameworkError}
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
   * Waits for a network request whose URL contains the specified substring to be dispatched.
   *
   * @param {string} urlSubstring
   *        Required.
   *        Substring to match within requested URLs.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<void>}
   * @throws {FrameworkError}
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
   * Waits for a network response whose URL contains the specified substring to be received.
   *
   * @param {string} urlSubstring
   *        Required.
   *        Substring to match within response URLs.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<void>}
   * @throws {FrameworkError}
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
   * Selects an item from a collection (calendar day grid, doctor card list, time slot list)
   * matching by text content case-insensitively, by keyword ("first", "last", "any"), or by zero-based numeric index.
   *
   * @param {Locator} elements
   *        Required.
   *        Playwright Locator matching the collection of items.
   * @param {string | number} identifier
   *        Required.
   *        Zero-based index, keyword ('first', 'last', 'any'), or visible label/aria-label text to match.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<string>}
   *          Trimmed inner text of the selected element.
   * @throws {LocatorError}
   *         Thrown if no element matching the identifier exists in the collection.
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
        // Direct zero-based numeric index
        if (typeof identifier === 'number') {
          const targetElement = elements.nth(identifier);
          await targetElement.waitFor({ state: 'visible' });
          const text = (await targetElement.innerText()).trim();
          await targetElement.click();
          return text;
        }

        const raw = identifier.toString().trim();
        const lower = raw.toLowerCase().replace(/[\s-_]+/g, '_');

        // Keyword: first available
        if (lower === 'first' || lower === 'first_available' || lower === 'any') {
          const firstElement = elements.nth(0);
          await firstElement.waitFor({ state: 'visible' });
          const text = (await firstElement.innerText()).trim();
          await firstElement.click();
          return text;
        }

        // Keyword: last available
        if (lower === 'last' || lower === 'last_available') {
          const lastElement = elements.last();
          await lastElement.waitFor({ state: 'visible' });
          const text = (await lastElement.innerText()).trim();
          await lastElement.click();
          return text;
        }

        // Exact or substring match across text and aria-label
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

        // Case-insensitive and space-normalized regex fallback across the collection
        const cleanPattern = identifier.toString().trim().replace(/\s+/g, '\\s+');
        const matched = elements.filter({ hasText: new RegExp(cleanPattern, 'i') });
        if ((await matched.count()) > 0) {
          const text = (await matched.nth(0).innerText()).trim();
          await matched.nth(0).click();
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
   * Selects an option from a standard HTML `<select>` dropdown by visible label, option value, or numeric index.
   * Normalizes casing and whitespace to withstand dynamic React formatting variations.
   *
   * @param {Locator | string} selectLocator
   *        Required.
   *        Locator or CSS/XPath string pointing to the `<select>` element.
   * @param {string | number} option
   *        Required.
   *        Option label, value attribute, or zero-based option index.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<string>}
   *          The value or visible text of the selected option.
   * @throws {FrameworkError}
   *         Thrown if the dropdown cannot be located or the option does not exist.
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

        // Try direct exact label match first
        try {
          const res = await resolved.selectOption({ label: raw });
          return res[0] || raw;
        } catch {
          // Fall through to case-insensitive option scan
        }

        // Iterate through options to match case-insensitively across value and inner text
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

        // Final fallback: try selecting directly by value string
        const res = await resolved.selectOption({ value: raw });
        return res[0] || raw;
      } catch (error: any) {
        console.error(`❌ FAILED DROPDOWN SELECTION [${stepTitle}]: ${error.message}`);
        throw mapPlaywrightError(error, stepTitle);
      }
    });
  }

  /**
   * Navigates a calendar or date picker week-by-week or month-by-month until the target month is visible.
   * Tolerates full month names ("September"), 3-letter abbreviations ("Sep"), and numbers ("09", 9).
   *
   * @param {Locator | string} headerLocator
   *        Required.
   *        Element displaying the current calendar month/range text (e.g. "October 2026").
   * @param {Locator | string} nextButtonLocator
   *        Required.
   *        Button used to advance the calendar view forward.
   * @param {string} targetMonth
   *        Required.
   *        Target month name, abbreviation, or numeric string ("September", "Sep", "9").
   * @param {number} [maxSteps=8]
   *        Optional.
   *        Maximum number of next-button clicks before terminating the search.
   *        Default: 8.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<void>}
   * @throws {FrameworkError}
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
   * Intelligently selects a date from a calendar grid with automatic week/month navigation.
   * Parses full date strings (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, "Sep 16"), day numbers (16, "16"),
   * or zero-based day column indices (0-6).
   * Navigates calendar weeks forward or backward until the target month and target day are displayed,
   * then clicks and selects that day button.
   *
   * @param {Locator | string} headerLocator
   *        Required.
   *        Locator pointing to the calendar header displaying current month and year.
   * @param {Locator | string} dayButtonsLocator
   *        Required.
   *        Locator matching all individual day buttons in the active calendar grid.
   * @param {Locator | string} nextButtonLocator
   *        Required.
   *        Button to advance the calendar view forward by one week/month.
   * @param {Locator | string} prevButtonLocator
   *        Required.
   *        Button to advance the calendar view backward by one week/month.
   * @param {string | number} date
   *        Required.
   *        The date to select. Can be an ISO date string, DD-MM-YYYY string, day number, or 0-6 index.
   * @param {string} [month]
   *        Optional.
   *        Target month name or number if not embedded within the date string.
   * @param {string} [logMessage]
   *        Optional.
   *        Step title for reporting.
   * @returns {Promise<string>}
   *          Trimmed inner text of the clicked day button.
   * @throws {LocatorError}
   *         Thrown if the date cannot be found in the calendar after all navigation steps.
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

        await days.nth(0).waitFor({ state: 'visible' });

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
          const fallbackBtn = days.nth(0);
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
   * Internal helper waiting for a locator to transition into a specified visibility state ('visible' or 'hidden').
   *
   * @param {Locator | string} locator
   *        Required.
   *        The element locator or selector.
   * @param {string} [state]
   *        Optional.
   *        Target state ('visible' or 'hidden').
   * @returns {Promise<void>}
   * @throws {FrameworkError}
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
   * Interactive console prompt helper specifically designed for manual OTP entry during live test execution.
   * Directly opens the OS terminal console device (`\\\\.\\CON` on Windows, `/dev/tty` on Unix) to bypass
   * Playwright worker stdin redirection and ensure user keystrokes are received directly from the shell.
   * Strictly waits for real user input without falling back to mock or hardcoded test data.
   *
   * @param {string} [promptMessage='Enter OTP: ']
   *        Optional.
   *        Console message prompting the user for input.
   *        Default: 'Enter OTP: '.
   * @param {number} [timeoutMs=120000]
   *        Optional.
   *        Maximum time in milliseconds to wait for the user to submit input.
   *        Default: 120000 (2 minutes).
   * @returns {Promise<string>}
   *          Trimmed string entered by the user at the terminal prompt.
   * @throws {Error}
   *         Thrown if the timeout expires without input, or if the user submits an empty string.
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
