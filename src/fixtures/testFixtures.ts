/**
 * @file testFixtures.ts
 * @description
 * Custom Playwright Test Fixture Configuration and Dependency Injection Module.
 *
 * Responsibilities:
 * - Extend Playwright's core `baseTest` runner with custom test fixtures
 * - Inject Page Object Model instances (`bookingPage`) into UI test specifications
 * - Inject active environment configuration (`config`) and trigger Allure report metadata setup
 * - Inject strongly-typed REST API client (`apiClient`) into API and hybrid integration tests
 * - Re-export Playwright's `expect` assertion library for streamlined imports
 *
 * Major Exports:
 * - test: Extended Playwright test instance providing `bookingPage`, `config`, and `apiClient`
 * - expect: Re-exported Playwright expectation assertion function
 * - PageFixtures: TypeScript type interface defining available fixture properties
 *
 * Dependencies:
 * - @playwright/test: base test, expect
 * - ../pages/AwhBookingPage: AwhBookingPage (BookingPage)
 * - ../utils/env: getEnvConfig, EnvConfig
 * - ../utils/allureSetup: setupAllureEnvironment
 * - ../api/core/ApiClient: ApiClient
 *
 * Assumptions:
 * - Tests consume fixtures via object destructuring in test signatures: `async ({ bookingPage, config }) => { ... }`
 *
 * Side Effects:
 * - Invokes `setupAllureEnvironment()` upon initial `config` fixture instantiation
 *
 * Usage Considerations:
 * - Every test spec in `src/tests/` should import `{ test, expect }` from this module.
 */

import { test as baseTest } from '@playwright/test';
import { AwhBookingPage, AwhBookingPage as BookingPage } from '../pages/AwhBookingPage';
import { getEnvConfig, EnvConfig } from '../utils/env';
import { setupAllureEnvironment } from '../utils/allureSetup';
import { ApiClient } from '../api/core/ApiClient';

/**
 * Interface defining the custom fixtures injected into Playwright test functions.
 *
 * @interface PageFixtures
 * @property {BookingPage} bookingPage - Pre-instantiated Page Object for the AWH Hospital visit booking workflow.
 * @property {EnvConfig} config - Strongly typed runtime environment configuration (URLs, service endpoints).
 * @property {ApiClient} apiClient - Pre-configured REST API client wrapped around Playwright's APIRequestContext.
 */
export type PageFixtures = {
  bookingPage: BookingPage;
  config: EnvConfig;
  apiClient: ApiClient;
};

/**
 * Extended Playwright `test` runner equipped with project-specific fixtures.
 *
 * Fixtures Lifecycle:
 * - `config`: Executes before the test runs, writes Allure metadata, and provides `EnvConfig`.
 * - `bookingPage`: Creates a fresh `BookingPage` instance wrapping the test's isolated `page` context.
 * - `apiClient`: Creates a fresh `ApiClient` instance wrapping the test's isolated `request` context.
 *
 * @constant {TestType<PageFixtures, {}>} test
 *
 * @example
 * import { test, expect } from '../../fixtures/testFixtures';
 *
 * test('Verify booking page loads', async ({ bookingPage, config }) => {
 *   await bookingPage.navigateToBooking(config.baseURL);
 *   await bookingPage.verifyBookingPageLoaded();
 * });
 */
export const test = baseTest.extend<PageFixtures>({
  // Loads environment-specific variables and sets up Allure reporting
  config: async ({}, use) => {
    setupAllureEnvironment();
    const cfg = getEnvConfig();
    await use(cfg);
  },

  // Injects the BookingPage into any test requesting { bookingPage }
  bookingPage: async ({ page }, use) => {
    const booking = new BookingPage(page);
    await use(booking);
  },

  // Injects the custom ApiClient for API testing
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    await use(client);
  },
});

// Re-export `expect` so specs don't need to import it separately from Playwright.
export { expect } from '@playwright/test';


