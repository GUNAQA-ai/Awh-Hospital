/**
 * @file globalTeardown.ts
 * @description
 * Playwright Global Teardown hook executed once after all test suites, workers,
 * and result reporters (HTML, JSON, Allure) have completed and closed their output streams.
 * Automatically compiles and dispatches the post-execution executive HTML email report
 * with Word document attachment and defect tickets to configured recipients when `SEND_EMAIL_REPORT=true`.
 */

import { FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env if present
if (fs.existsSync('.env')) {
  dotenv.config();
}

/**
 * Global Teardown hook function called by Playwright runner upon execution completion.
 *
 * @param {FullConfig} config - Full Playwright test configuration.
 * @returns {Promise<void>}
 */
async function globalTeardown(config: FullConfig): Promise<void> {
  if (process.env.SEND_EMAIL_REPORT === 'true') {
    try {
      console.log('\n============================================================');
      console.log('📬 [GlobalTeardown] Starting Post-Execution Email Report Dispatch...');
      console.log(`   Recipients: ${process.env.EMAIL_TO || 'Not Configured'}`);
      console.log('============================================================');
      const { sendEmailReport } = require('../../scripts/send-email-report');
      await sendEmailReport();
    } catch (err: any) {
      console.error('❌ [GlobalTeardown] Failed to dispatch email report:', err?.message || err);
    }
  } else {
    console.log('\nℹ️ [GlobalTeardown] Email reporting skipped (SEND_EMAIL_REPORT != "true").');
  }
}

export default globalTeardown;
