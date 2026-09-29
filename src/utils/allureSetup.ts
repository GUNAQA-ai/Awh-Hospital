/**
 * @file allureSetup.ts
 * @description
 * Allure Report Metadata and Categorization Initializer.
 *
 * Responsibilities:
 * - Generate `allure-results/environment.properties` dynamically based on active runtime configuration
 * - Generate `allure-results/categories.json` to classify test failures automatically in Allure reports
 * - Ensure metadata files are written once per test process run using an idempotent initialization guard
 *
 * Major Exports:
 * - setupAllureEnvironment(): Function to initialize environment and categorization files for Allure
 *
 * Dependencies:
 * - fs: Node.js filesystem operations
 * - path: Node.js path resolution
 * - ./env: getEnvConfig
 *
 * Assumptions:
 * - Working directory contains or allows creating an `allure-results/` directory
 *
 * Side Effects:
 * - Creates directory `allure-results/` if missing
 * - Writes `environment.properties` and `categories.json` synchronously to disk
 *
 * Usage Considerations:
 * - Invoked inside global test fixtures before executing test suites.
 */

import fs from 'fs';
import path from 'path';
import { getEnvConfig } from './env';

/**
 * Idempotency guard flag preventing redundant filesystem writes during parallel worker execution.
 * @type {boolean}
 */
let isAllureSetupDone = false;

/**
 * Generates runtime metadata files required by the Allure Report generator.
 *
 * Specifically creates:
 * 1. `environment.properties`: Details OS platform, Node.js version, active test environment (DEV/UAT/STAGING),
 *    and frontend base URL.
 * 2. `categories.json`: Defines regex matchers to sort failed tests into four distinct operational buckets:
 *    - Product Defects & Validation Errors (e.g., CustomAssertionError, Validation Failure)
 *    - Timeout & Element Locator Failures (e.g., TimeoutError, LocatorError, DetachedElementError)
 *    - Network & Environment Failures (e.g., NetworkError, net::ERR, TargetClosedError)
 *    - Configuration & File Errors (e.g., FileNotFoundError, JsonParseError, ConfigurationError)
 *
 * @function setupAllureEnvironment
 *
 * @returns {void}
 *
 * @example
 * // In test fixture beforeAll or worker setup:
 * setupAllureEnvironment();
 */
export function setupAllureEnvironment(): void {
  // Prevent duplicate execution during multi-worker parallel execution or fixture tear-down.
  if (isAllureSetupDone) return;
  
  const resultsDir = path.resolve(process.cwd(), 'allure-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const config = getEnvConfig();
  const envName = (process.env.ENV || 'uat').toUpperCase();

  const envContent = [
    `Platform=${process.platform}`,
    `Node_Version=${process.version}`,
    `Target_Environment=${envName}`,
    `Base_URL=${config.baseURL}`,
    `Automation_Framework=Playwright POM TypeScript`,
  ].join('\n');

  fs.writeFileSync(path.join(resultsDir, 'environment.properties'), envContent);

  const categoriesContent = [
    {
      name: "Product Defects & Validation Errors",
      matchedStatuses: ["failed"],
      messageRegex: ".*CustomAssertionError.*|.*Validation Failure.*"
    },
    {
      name: "Timeout & Element Locator Failures",
      matchedStatuses: ["failed"],
      messageRegex: ".*TimeoutError.*|.*LocatorError.*|.*DetachedElementError.*"
    },
    {
      name: "Network & Environment Failures",
      matchedStatuses: ["failed"],
      messageRegex: ".*NetworkError.*|.*net::ERR.*|.*TargetClosedError.*"
    },
    {
      name: "Configuration & File Errors",
      matchedStatuses: ["failed"],
      messageRegex: ".*FileNotFoundError.*|.*JsonParseError.*|.*ConfigurationError.*"
    }
  ];
  fs.writeFileSync(path.join(resultsDir, 'categories.json'), JSON.stringify(categoriesContent, null, 2));

  isAllureSetupDone = true;
}

