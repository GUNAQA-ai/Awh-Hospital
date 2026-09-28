import { defineConfig, devices } from '@playwright/test';
import { getEnvConfig } from './src/utils/env';
import dotenv from 'dotenv';
import fs from 'fs';

// Only load .env file if it exists on disk (local development).
// In CI environments (Jenkins/GitHub Actions), secrets MUST be injected via secure environment variables.
if (fs.existsSync('.env')) {
  dotenv.config();
}

// Fetch validated environment configuration
const config = getEnvConfig();

// Detect CI environment - CI servers use Chromium, local uses installed Chrome
const isCI = !!(process.env.CI || process.env.GITHUB_ACTIONS || process.env.JENKINS_URL || process.env.GITLAB_CI);

// Central configuration file for the Playwright automation framework.
// Defines global execution rules, reporting integrations, environment loading, and browser settings.
export default defineConfig({
  // testDir: Instructs Playwright where to look for test specification files.
  // We point this to './src/tests' so that page objects and utils are excluded from test discovery.
  testDir: './src/tests',
  
  // timeout: Maximum execution time permitted for a single test.
  // 90 seconds accommodates complex E2E flows spanning multiple pages.
  timeout: 90000,
  
  // fullyParallel: Controls whether tests within the same file execute concurrently.
  // Set to false to ensure predictable sequential execution (vital for data-dependent state).
  fullyParallel: false, 
  
  // workers: The maximum number of concurrent test runner processes.
  // Hardcoded to 1 to force strictly sequential execution of all spec files, 
  // preventing race conditions on shared test data or environment state.
  workers: 1, 
  
  // expect: Global settings for the Playwright assertion engine.
  expect: {
    // Defines how long Playwright will auto-retry dynamic assertions (like toHaveText or toBeVisible).
    timeout: 10000
  },
  
  // reporter: Defines the output formats for test execution results.
  reporter: [
    ['list'], // Real-time console output in a readable list format.
    ['html', { open: 'never' }], // Generates standard HTML report but prevents auto-opening in CI/CD.
    ['json', { outputFile: 'test-results.json' }], // Added JSON reporter to extract detailed failure data for Jira emails
    ['allure-playwright', { detail: true, suiteTitle: true }], // Integrates Allure for advanced analytic reporting.
    ['./src/utils/ConsoleStepReporter.ts'] // Custom reporter for detailed CLI step logging.
  ],
  
  // use: Defines global options injected into all Page Object instances.
  use: {
    // baseURL: Injected dynamically based on the current ENV configuration JSON file.
    // This allows seamless execution against Dev, UAT, or Prod by changing a single environment variable.
    baseURL: config.baseURL,
    actionTimeout: 15000,
    navigationTimeout: 45000,
    
    // trace: Automatically captures a comprehensive step-by-step DOM state recording for all tests.
    trace: 'on',
    
    // screenshot: Automatically captures an image of the DOM at the end of every test execution.
    screenshot: 'on',
    
    // video: Automatically records a full video of the browser session for all tests.
    video: 'on',
    
    // CI servers use bundled Chromium; local machine uses installed Google Chrome
    ...(isCI ? {} : { channel: 'chrome' }),
    
    // Explicitly define the browser engine for peace of mind
    browserName: 'chromium',
    
    // Run headed (visible) locally, headless in cloud CI
    headless: !!(process.env.GITHUB_ACTIONS || process.env.GITLAB_CI),
    viewport: null,
    launchOptions: { args: ['--start-maximized'] },
    ignoreHTTPSErrors: true,
  },
  
  // projects: Defines distinct execution matrices. 
  // Currently restricted to Chrome/Chromium to ensure consistent behavior.
  projects: [
    {
      name: 'chrome',
    }
  ],
});
