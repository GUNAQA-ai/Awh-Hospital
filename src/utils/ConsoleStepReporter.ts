import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

/**
 * Utility: Custom Playwright Reporter for CI/CLI output.
 * Hooks into Playwright's test lifecycle (onStepBegin, onStepEnd, onTestEnd).
 * Provides clean, step-by-step console execution logs and intercepts test failures
 * to output a detailed "Diagnostic Verdict" to help QA quickly identify if a failure
 * was a script issue, a network issue, or a genuine application defect.
 */
export default class ConsoleStepReporter implements Reporter {
  onStepBegin(test: TestCase, result: TestResult, step: TestStep) {
    if (step.category === 'test.step') {
      console.log(`\n▶ [${test.title}] STEP: ${step.title}`);
    }
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep) {
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

  onTestEnd(test: TestCase, result: TestResult) {
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
}
