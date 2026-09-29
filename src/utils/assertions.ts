/**
 * @file assertions.ts
 * @description
 * Custom Framework Assertion Library.
 *
 * Responsibilities:
 * - Wrap Playwright's native `expect` assertions with custom try-catch blocks
 * - Translate raw Playwright assertion failures into strongly typed `CustomAssertionError`
 * - Extract and report actual vs expected values (e.g., retrieving actual DOM text content upon failure)
 * - Provide domain-specific diagnostic error messages to improve CI failure readability
 *
 * Major Exports:
 * - assertElementVisible(): Asserts an element is visible in the viewport
 * - assertElementHidden(): Asserts an element is hidden or absent from DOM
 * - assertElementTextEquals(): Asserts exact text equality of an element
 * - assertElementTextContains(): Asserts substring inclusion in element text
 * - assertUrlContains(): Asserts the active browser URL matches an expected substring/pattern
 * - assertValuesEqual(): Generic value equality assertion for primitives/objects
 *
 * Dependencies:
 * - @playwright/test: expect, Locator, Page
 * - ./exceptions: CustomAssertionError
 *
 * Assumptions:
 * - Playwright assertions adhere to default auto-waiting and retry mechanics
 *
 * Side Effects:
 * - None; purely observational
 *
 * Usage Considerations:
 * - Use these helpers when you need standardized failure messages or custom exception wrapping.
 */

import { expect, Locator, Page } from '@playwright/test';
import { CustomAssertionError } from './exceptions';

/**
 * Asserts that a target DOM element is visible within the viewport.
 *
 * Automatically awaits element visibility using Playwright's default assertion timeout.
 * If the element is hidden, detached, or absent, throws a `CustomAssertionError`
 * with a contextual message.
 *
 * @function assertElementVisible
 *
 * @param {Locator} locator
 *        Required.
 *        Playwright Locator resolving to the target DOM element.
 *
 * @param {string} [message]
 *        Optional.
 *        Custom error message to display if the assertion fails.
 *        Default: Auto-generated message including locator description.
 *        Example: "Expected booking confirmation banner to be visible."
 *
 * @returns {Promise<void>}
 *          Resolves when the element is confirmed visible.
 *
 * @throws {CustomAssertionError}
 *         Thrown when the element remains hidden or non-existent within the assertion timeout.
 *
 * @example
 * await assertElementVisible(page.locator('#confirmation-heading'), 'Confirmation heading must appear');
 */
export async function assertElementVisible(locator: Locator, message?: string): Promise<void> {
  try {
    await expect(locator).toBeVisible();
  } catch (error: any) {
    throw new CustomAssertionError(message || `Element expected to be visible but was hidden/non-existent: ${error.message}`, 'assertElementVisible');
  }
}

/**
 * Asserts that a target DOM element is hidden or absent from the DOM.
 *
 * Automatically awaits element invisibility using Playwright's assertion retry loop.
 *
 * @function assertElementHidden
 *
 * @param {Locator} locator
 *        Required.
 *        Playwright Locator resolving to the target element.
 *
 * @param {string} [message]
 *        Optional.
 *        Custom failure message.
 *        Default: Auto-generated message.
 *        Example: "Loading spinner must disappear before proceeding."
 *
 * @returns {Promise<void>}
 *          Resolves when the element is confirmed hidden or detached.
 *
 * @throws {CustomAssertionError}
 *         Thrown if the element remains visible when checked.
 */
export async function assertElementHidden(locator: Locator, message?: string): Promise<void> {
  try {
    await expect(locator).toBeHidden();
  } catch (error: any) {
    throw new CustomAssertionError(message || `Element expected to be hidden but was visible: ${error.message}`, 'assertElementHidden');
  }
}

/**
 * Asserts that an element's text content exactly matches the expected string.
 *
 * If the assertion fails, attempts to read the actual `textContent()` from the locator
 * to output a clear `[Expected] vs [Actual]` comparison.
 *
 * @function assertElementTextEquals
 *
 * @param {Locator} locator
 *        Required.
 *        Playwright Locator pointing to the element whose text will be evaluated.
 *
 * @param {string} expectedText
 *        Required.
 *        The exact string expected to be present in the element.
 *        Expected format: non-empty string.
 *        Example: "Appointment confirmed"
 *
 * @param {string} [message]
 *        Optional.
 *        Custom diagnostic message on failure.
 *
 * @returns {Promise<void>}
 *          Resolves if text matches exactly.
 *
 * @throws {CustomAssertionError}
 *         Thrown when the actual text differs from the expected string.
 */
export async function assertElementTextEquals(
  locator: Locator,
  expectedText: string,
  message?: string
): Promise<void> {
  try {
    await expect(locator).toHaveText(expectedText);
  } catch (error: any) {
    const actualText = await locator.textContent().catch(() => 'unknown');
    throw new CustomAssertionError(message || `Expected text [${expectedText}] but got [${actualText}]`, 'assertElementTextEquals');
  }
}

/**
 * Asserts that an element's text content contains the specified substring.
 *
 * Performs a case-sensitive substring search within the target element's inner text.
 *
 * @function assertElementTextContains
 *
 * @param {Locator} locator
 *        Required.
 *        Playwright Locator resolving to the target element.
 *
 * @param {string} expectedSubstring
 *        Required.
 *        The substring expected to be contained within the element's text.
 *        Example: "Dr.KVNN.Santhosh Murthy"
 *
 * @param {string} [message]
 *        Optional.
 *        Custom diagnostic message on failure.
 *
 * @returns {Promise<void>}
 *          Resolves when the element text contains the substring.
 *
 * @throws {CustomAssertionError}
 *         Thrown when the substring is not found within the element text.
 */
export async function assertElementTextContains(
  locator: Locator,
  expectedSubstring: string,
  message?: string
): Promise<void> {
  try {
    await expect(locator).toContainText(expectedSubstring);
  } catch (error: any) {
    const actualText = await locator.textContent().catch(() => 'unknown');
    throw new CustomAssertionError(message || `Expected text containing "${expectedSubstring}" but got [${actualText}]`, 'assertElementTextContains');
  }
}

/**
 * Asserts that the browser page's current URL contains the expected substring or pattern.
 *
 * Uses Playwright's `toHaveURL` with RegExp matching to poll the active URL.
 *
 * @function assertUrlContains
 *
 * @param {Page} page
 *        Required.
 *        Active Playwright Page instance.
 *
 * @param {string} expectedSubstring
 *        Required.
 *        Substring or regex pattern expected in the URL.
 *        Example: "/booking/confirmed"
 *
 * @param {string} [message]
 *        Optional.
 *        Custom failure message.
 *
 * @returns {Promise<void>}
 *          Resolves when the URL contains the expected string.
 *
 * @throws {CustomAssertionError}
 *         Thrown when the page URL does not match within the timeout.
 */
export async function assertUrlContains(page: Page, expectedSubstring: string, message?: string): Promise<void> {
  try {
    await expect(page).toHaveURL(new RegExp(expectedSubstring));
  } catch (error: any) {
    throw new CustomAssertionError(message || `Expected URL containing "${expectedSubstring}" but got [${page.url()}]`, 'assertUrlContains');
  }
}

/**
 * Asserts strict equality (`===`) between two arbitrary values.
 *
 * Useful for asserting primitive values, computed strings, or counts outside of the DOM.
 *
 * @function assertValuesEqual
 * @template T
 *
 * @param {T} actual
 *        Required.
 *        The actual value produced by the test or application under test.
 *
 * @param {T} expected
 *        Required.
 *        The expected reference value to compare against.
 *
 * @param {string} [message]
 *        Optional.
 *        Custom failure message.
 *
 * @returns {void}
 *
 * @throws {CustomAssertionError}
 *         Thrown when `actual !== expected`.
 *
 * @example
 * assertValuesEqual(response.status(), 200, 'HTTP status must be 200 OK');
 */
export function assertValuesEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new CustomAssertionError(message || `Expected [${expected}] but got [${actual}]`, 'assertValuesEqual');
  }
}

