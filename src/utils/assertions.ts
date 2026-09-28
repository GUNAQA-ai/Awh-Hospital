import { expect, Locator, Page } from '@playwright/test';
import { CustomAssertionError, mapPlaywrightError } from './exceptions';

/**
 * Utility: Custom Framework Assertions.
 * Wraps Playwright's native `expect` with built-in try-catch blocks.
 * WHY: When a standard Playwright assertion fails, it throws a generic error.
 * These custom wrappers catch those errors and throw our `CustomAssertionError`,
 * allowing us to format, intercept, or handle assertion failures globally if needed.
 */

// Confirms the target element is visibly rendered in the DOM.
export async function assertElementVisible(locator: Locator, message?: string): Promise<void> {
  try {
    await expect(locator).toBeVisible();
  } catch (error: any) {
    throw new CustomAssertionError(message || `Element expected to be visible but was hidden/non-existent: ${error.message}`, 'assertElementVisible');
  }
}

export async function assertElementHidden(locator: Locator, message?: string): Promise<void> {
  try {
    await expect(locator).toBeHidden();
  } catch (error: any) {
    throw new CustomAssertionError(message || `Element expected to be hidden but was visible: ${error.message}`, 'assertElementHidden');
  }
}

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

export async function assertUrlContains(page: Page, expectedSubstring: string, message?: string): Promise<void> {
  try {
    await expect(page).toHaveURL(new RegExp(expectedSubstring));
  } catch (error: any) {
    throw new CustomAssertionError(message || `Expected URL containing "${expectedSubstring}" but got [${page.url()}]`, 'assertUrlContains');
  }
}

export function assertValuesEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new CustomAssertionError(message || `Expected [${expected}] but got [${actual}]`, 'assertValuesEqual');
  }
}
