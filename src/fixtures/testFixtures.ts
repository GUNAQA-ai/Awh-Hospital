import { test as baseTest } from '@playwright/test';
import { AwhBookingPage, AwhBookingPage as BookingPage } from '../pages/AwhBookingPage';
import { getEnvConfig, EnvConfig } from '../utils/env';
import { setupAllureEnvironment } from '../utils/allureSetup';
import { ApiClient } from '../api/core/ApiClient';

// Central fixture configuration for Playwright.
// Extends Playwright's base test object to inject Page Objects and configuration.

type PageFixtures = {
  // AWH Hospital Booking Page Object
  bookingPage: BookingPage;
  config: EnvConfig;
  apiClient: ApiClient;
};

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

