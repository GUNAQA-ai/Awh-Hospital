/**
 * @file ConsoleStepReporter.ts
 * @description
 * Custom Playwright Console Step and Diagnostic Defect Reporter.
 *
 * Responsibilities:
 * - Intercept Playwright lifecycle events (`onStepBegin`, `onStepEnd`, `onTestEnd`)
 * - Format realtime test execution steps with clear terminal indicators (▶, ✅, ❌) and step execution durations
 * - Analyze failed tests and classify the root cause into categories (Script Maintenance, User Input Guardrail, Product Bug)
 * - Automatically generate copy-pasteable JIRA defect summaries in console output upon test failure
 *
 * Major Exports:
 * - default ConsoleStepReporter: Playwright Reporter implementation class
 *
 * Dependencies:
 * - @playwright/test/reporter: Reporter, TestCase, TestResult, TestStep
 *
 * Assumptions:
 * - Test cases utilize `test.step()` for structured step demarcation
 *
 * Side Effects:
 * - Writes formatted text directly to stdout and stderr via `console.log` / `console.error`
 *
 * Usage Considerations:
 * - Configured in `playwright.config.ts` under the `reporter` array.
 */

import { FullResult, Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

/**
 * Custom Playwright Reporter implementation providing real-time console step feedback
 * and automated failure diagnosis for CI/CD environments.
 *
 * @class ConsoleStepReporter
 * @implements {Reporter}
 */
export default class ConsoleStepReporter implements Reporter {
  /**
   * Called when a test step begins execution.
   *
   * Filters specifically for user-defined `test.step()` boundaries (category: 'test.step')
   * to print a clean start marker.
   *
   * @param {TestCase} test
   *        Required.
   *        The test case currently executing.
   *
   * @param {TestResult} result
   *        Required.
   *        The current execution result tracking this test run.
   *
   * @param {TestStep} step
   *        Required.
   *        The step that has just started.
   */
  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
    if (step.category === 'test.step') {
      console.log(`\n▶ [${test.title}] STEP: ${step.title}`);
    }
  }

  /**
   * Called when a test step completes execution.
   *
   * Logs a green checkmark (`✅`) with execution duration if passed,
   * or a red cross (`❌`) with the step error message if failed.
   *
   * @param {TestCase} test
   *        Required.
   *        The parent test case.
   *
   * @param {TestResult} result
   *        Required.
   *        The current test result accumulator.
   *
   * @param {TestStep} step
   *        Required.
   *        The step that just completed.
   */
  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    if (step.category === 'test.step') {
      if (step.error) {
        console.error(`  ❌ FAILED STEP: ${step.title} (${step.duration}ms)`);
        if (step.error.message) {
          console.error(`     Details: ${step.error.message}`);
        }
      } else {
        console.log(`  ✅ PASSED STEP: ${step.title} (${step.duration}ms)`);
      }
    }
  }

  /**
   * Called when a test finishes execution.
   *
   * If the test failed or timed out, parses the step execution trace, classifies
   * the failure reason, and renders a structured JIRA Defect Report to stderr.
   *
   * Classification Logic:
   * - LocatorError / strict mode: "Script Maintenance"
   * - TimeoutError: "Script Maintenance"
   * - Stale / DetachedElementError: "Script Maintenance"
   * - Validation Failure / duplicate contact: "User Input Validation (Expected Guardrail)"
   * - All other assertion failures: "Bug"
   *
   * @param {TestCase} test
   *        Required.
   *        The test case that finished.
   *
   * @param {TestResult} result
   *        Required.
   *        The final test result containing status, duration, error details, and step traces.
   */
  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'failed' || result.status === 'timedOut') {
      const errorMsg = result.error?.message || 'No error message provided';
      const stack = result.error?.stack || '';

      // Extract step execution history
      const testSteps = (result.steps || []).filter(s => s.category === 'test.step');
      const failedStep = testSteps.find(s => s.error !== undefined);
      const failedStepTitle = failedStep ? failedStep.title.toLowerCase() : '';

      // Diagnostic Verdict Classification
      let verdictTitle = '';
      let issueType = 'Bug';
      
      if (errorMsg.includes('LocatorError') || errorMsg.includes('was not found in') || errorMsg.includes('strict mode violation')) {
        verdictTitle = 'Script / Locator Configuration Error (Element not found or not unique)';
        issueType = 'Script Maintenance';
      } else if (errorMsg.includes('DetachedElementError') || errorMsg.includes('stale') || errorMsg.includes('detached from the DOM')) {
        verdictTitle = 'Stale / Detached Element Error (DOM re-rendered)';
        issueType = 'Script Maintenance';
      } else if (errorMsg.includes('TimeoutError') || errorMsg.includes('Timeout') || errorMsg.includes('exceeded')) {
        verdictTitle = 'Script / Element Locator Timeout';
        issueType = 'Script Maintenance';
      } else if (errorMsg.includes('Validation Failure') || errorMsg.includes('already linked') || errorMsg.includes('Please select an existing')) {
        verdictTitle = 'Application Validation Captured: User Input Restriction';
        issueType = 'User Input Validation (Expected Guardrail)';
      } else {
        verdictTitle = 'Application / Assertion Failure';
        issueType = 'Bug';
      }

      // Regex Extractors for JIRA format
      let expectedResult = 'N/A';
      let actualResult = 'N/A';
      let validationMessage = 'None';

      const expectedMatch = errorMsg.match(/Expected.*?:(.*)/i);
      if (expectedMatch) expectedResult = expectedMatch[1].trim();

      const actualMatch = errorMsg.match(/Received.*?:(.*)/i);
      if (actualMatch) actualResult = actualMatch[1].trim();

      if (errorMsg.includes('Validation Failure')) {
        const valMatch = errorMsg.match(/Validation Failure:\s*(.*)/i);
        if (valMatch) validationMessage = valMatch[1].trim();
      } else if (errorMsg.includes('already linked') || errorMsg.includes('linked to')) {
        validationMessage = errorMsg.split('\n')[0];
      } else if (errorMsg.includes('duplicate_contact')) {
        const valMatch = errorMsg.match(/(Error Code:.*?)$/m);
        if (valMatch) validationMessage = valMatch[1].trim();
      }

      console.error(`\n================================================================================`);
      console.error(`🐞 JIRA DEFECT REPORT`);
      console.error(`================================================================================`);
      console.error(`Issue Type: ${issueType}`);
      console.error(`Summary: ${verdictTitle} in ${test.title}`);
      
      console.error(`\nSteps to Reproduce:`);
      if (testSteps.length > 0) {
        testSteps.forEach((s, idx) => {
          const statusIcon = s.error ? '❌ FAILED:' : '✅';
          console.error(`  ${idx + 1}. ${statusIcon} ${s.title}`);
        });
      } else {
        console.error(`  1. Execute ${test.title}`);
      }

      console.error(`\nExpected Result: ${expectedResult}`);
      console.error(`Actual Result: ${actualResult}`);
      console.error(`Captured Validation Message: ${validationMessage}`);
      console.error(`\nExact Error Details:`);
      console.error(errorMsg.split('\n')[0]); // First line of error
      console.error(`================================================================================\n`);
    }
  }

  /**
   * Called when all test suites have completed execution.
   * If email reporting is enabled via `SEND_EMAIL_REPORT=true`, automatically compiles
   * and dispatches the executive HTML email notification to configured recipients.
   *
   * @param {FullResult} result - Final test execution status result.
   */
  async onEnd(result: FullResult): Promise<void> {
    if (process.env.SEND_EMAIL_REPORT === 'true') {
      try {
        const { sendEmailReport } = require('../../scripts/send-email-report');
        await sendEmailReport();
      } catch (err: any) {
        console.error('⚠️ [EmailReporter] Failed to trigger email report on test completion:', err?.message || err);
      }
    }
  }
}
