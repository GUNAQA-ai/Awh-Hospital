/**
 * @file playwright.config.ts
 * @description
 * Global configuration specification for the Playwright Test Runner.
 * Configures test suite directories, timeouts, worker concurrency, assertion retry thresholds,
 * reporter plugins (List, HTML, JSON, Allure, and custom ConsoleStepReporter), environment loading,
 * browser contexts, and CI/CD adaptations.
 *
 * Responsibilities:
 * - Load environment variables safely from `.env` in local development without throwing in CI.
 * - Retrieve validated environment parameters (baseURL, timeouts, API endpoints) via {@link getEnvConfig}.
 * - Enforce sequential test execution (`workers: 1`, `fullyParallel: false`) to avoid state collisions.
 * - Register comprehensive reporting tools (Allure, HTML report, JSON artifact, custom terminal step reporter).
 * - Adapt browser launch channel dynamically (installed Google Chrome locally vs bundled Chromium in CI).
 *
 * Key Configuration Objects:
 * - {@link defineConfig} - Root Playwright configuration export.
 *
 * Dependencies:
 * - `@playwright/test`: Core Playwright runner and configuration types.
 * - `./src/utils/env`: Environment configuration loader and schema validator.
 * - `dotenv`: Environment file parser.
 * - `fs`: Node.js filesystem module.
 *
 * Assumptions:
 * - In local runs, a `.env` file may provide configuration overrides.
 * - In CI runners (GitHub Actions, Jenkins, GitLab), environment variables are injected via secure pipeline secrets.
 *
 * Side Effects:
 * - Directs Playwright browser spawning, viewport sizing, network interception, and artifact generation.
 *
 * Usage Considerations:
 * - Concurrency is set to 1 worker to ensure deterministic booking and patient account states.
 */

import { defineConfig, devices } from '@playwright/test';
import { getEnvConfig } from './src/utils/env';
import dotenv from 'dotenv';
import fs from 'fs';

// Only load .env file if it exists on disk (local development).
// In CI environments (Jenkins/GitHub Actions), secrets MUST be injected via secure environment variables.
if (fs.existsSync('.env')) {
  dotenv.config();
}

/** Validated environment configuration parsed from `config/` JSON files and environment variables */
const config = getEnvConfig();

/**
 * Boolean flag detecting whether tests are executing inside a continuous integration runner.
 * Checks for standard CI environment markers (CI, GITHUB_ACTIONS, JENKINS_URL, GITLAB_CI).
 */
const isCI = !!(process.env.CI || process.env.GITHUB_ACTIONS || process.env.JENKINS_URL || process.env.GITLAB_CI);

/**
 * Root Playwright test runner configuration definition.
 */
export default defineConfig({
  /** Directory containing all test specifications (excludes page objects and utilities) */
  testDir: './src/tests',

  /** Global Teardown hook to reliably trigger email notifications after all reporters flush */
  globalTeardown: './src/utils/globalTeardown.ts',
  
  /** Maximum duration permitted for an individual test execution in milliseconds (35 seconds) */
  timeout: 35000,
  
  /** Disables parallel execution of tests within the same file to guarantee sequential stability */
  fullyParallel: false, 
  
  /** 
   * Maximum concurrent worker processes.
   * Locked to 1 to prevent race conditions on shared hospital patient data and SMS OTP state.
   */
  workers: 1, 
  
  /** Configuration for Playwright's `expect` assertion library */
  expect: {
    /** Timeout in milliseconds for dynamic assertions (e.g. toBeVisible, toHaveText) */
    timeout: 8000
  },
  
  /** Array of active test result reporters */
  reporter: [
    ['list'], // Real-time console output in a readable list format.
    ['html', { open: 'never' }], // Generates standard HTML report but prevents auto-opening in CI/CD.
    ['json', { outputFile: 'test-results.json' }], // Added JSON reporter to extract detailed failure data for Jira emails
    ['allure-playwright', { detail: true, suiteTitle: true }], // Integrates Allure for advanced analytic reporting.
    ['./src/utils/ConsoleStepReporter.ts'] // Custom reporter for detailed CLI step logging.
  ],
  
  /** Shared options applied across all browser contexts and Page instances */
  use: {
    /** Base URL resolved dynamically from environment configuration */
    baseURL: config.baseURL,

    /** Default timeout for individual Playwright actions (click, fill) in milliseconds */
    actionTimeout: 6000,

    /** Default timeout for page navigation calls (goto, waitForURL) in milliseconds */
    navigationTimeout: 15000,
    
    /** Records execution traces only on failures to maximize performance */
    trace: 'retain-on-failure',
    
    /** Captures screenshots only when a test fails */
    screenshot: 'only-on-failure',
    
    /** Records video only when a test fails */
    video: 'retain-on-failure',
    
    // In CI environments, rely on bundled Chromium; locally, prefer system Google Chrome
    ...(isCI ? {} : { channel: 'chrome' }),
    
    /** Explicitly declare chromium browser engine */
    browserName: 'chromium',
    
    /** Run headed (visible) locally, headless in CI runners */
    headless: !!(process.env.GITHUB_ACTIONS || process.env.GITLAB_CI),

    /** Null viewport allows the browser window to maximize naturally */
    viewport: null,

    /** Browser process launch arguments */
    launchOptions: { args: ['--start-maximized'] },

    /** Ignores self-signed SSL certificate errors on internal staging environments */
    ignoreHTTPSErrors: true,
  },
  
  /** Multi-project execution matrix */
  projects: [
    {
      name: 'chrome',
    }
  ],
});
