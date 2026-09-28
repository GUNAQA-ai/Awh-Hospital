import fs from 'fs';
import path from 'path';
import { getEnvConfig } from './env';

let isAllureSetupDone = false;

/**
 * Utility: Allure Reporting Global Configuration.
 * Generates Allure environment.properties and categories.json dynamically at runtime.
 * All values are derived from runtime environment variables (zero hardcoded application-specific data).
 * This ensures the final HTML report displays accurate environment details (UAT vs Prod, Base URL).
 */
export function setupAllureEnvironment() {
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
