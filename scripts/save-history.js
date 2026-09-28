/**
 * save-history.js
 * 
 * Preserves Allure report history (trend data) across consecutive test runs.
 * Copies the 'history' folder from the previous allure-report into the current
 * allure-results directory so that Allure can generate trend charts.
 * 
 * This script is safe to run even if no previous report exists.
 */
const fs = require('fs');
const path = require('path');

const ALLURE_REPORT_HISTORY = path.join(__dirname, '..', 'allure-report', 'history');
const ALLURE_RESULTS_HISTORY = path.join(__dirname, '..', 'allure-results', 'history');

function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const srcPath = path.join(source, file);
    const destPath = path.join(target, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

if (fs.existsSync(ALLURE_REPORT_HISTORY)) {
  console.log('📂 Copying previous Allure history for trend charts...');
  copyFolderSync(ALLURE_REPORT_HISTORY, ALLURE_RESULTS_HISTORY);
  console.log('✅ History copied successfully.');
} else {
  console.log('ℹ️ No previous Allure report history found. Skipping history copy (first run).');
}
