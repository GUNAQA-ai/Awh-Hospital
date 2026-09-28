const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if email reporting is enabled
if (process.env.SEND_EMAIL_REPORT !== 'true') {
  console.log('ℹ️ Email reporting is disabled or not configured. Skipping email send.');
  process.exit(0);
}

// Verify required configuration
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_TO'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Cannot send email report. Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

async function sendEmailReport() {
  // Parse Playwright JSON report for Real stats and Jira Defect details
  let stats = { total: 0, passed: 0, failed: 0, skipped: 0 };
  let jiraBugTicketsHTML = '';
  
  try {
    const playwrightJsonPath = path.join(__dirname, '..', 'test-results.json');
    if (fs.existsSync(playwrightJsonPath)) {
      const pwData = JSON.parse(fs.readFileSync(playwrightJsonPath, 'utf8'));
      const failedTests = [];
      
      function extractStatsAndFailures(suite) {
        if (suite.specs) {
          suite.specs.forEach(spec => {
            if (spec.tests) {
              spec.tests.forEach(test => {
                stats.total++;
                if (test.status === 'expected' || test.status === 'flaky') {
                  stats.passed++;
                } else if (test.status === 'skipped') {
                  stats.skipped++;
                } else {
                  stats.failed++;
                  // Extract failure details
                  const lastResult = test.results[test.results.length - 1];
                  if (lastResult && lastResult.error) {
                    failedTests.push({
                      title: spec.title,
                      errorMsg: lastResult.error.message || ''
                    });
                  }
                }
              });
            }
          });
        }
        if (suite.suites) {
          suite.suites.forEach(extractStatsAndFailures);
        }
      }
      
      if (pwData.suites) pwData.suites.forEach(extractStatsAndFailures);
      
      if (failedTests.length > 0) {
        jiraBugTicketsHTML += `<br><h2>🐞 Jira Defect Reports</h2>`;
        failedTests.forEach(test => {
          let expectedResult = 'N/A';
          let actualResult = 'N/A';
          let validationMessage = 'None';
          const errorMsg = test.errorMsg;
          
          const expectedMatch = errorMsg.match(/Expected.*?:(.*)/i);
          if (expectedMatch) expectedResult = expectedMatch[1].trim();

          const actualMatch = errorMsg.match(/Received.*?:(.*)/i);
          if (actualMatch) actualResult = actualMatch[1].trim();

          if (errorMsg.includes('Validation Failure')) {
            const valMatch = errorMsg.match(/Validation Failure:\s*(.*)/i);
            if (valMatch) validationMessage = valMatch[1].trim();
          } else if (errorMsg.includes('duplicate_contact')) {
            const valMatch = errorMsg.match(/(Error Code:.*?)$/m);
            if (valMatch) validationMessage = valMatch[1].trim();
          }
          
          let issueType = 'Bug';
          let summary = 'Application / Assertion Failure';
          if (errorMsg.includes('LocatorError') || errorMsg.includes('strict mode violation') || errorMsg.includes('was not found in')) {
             issueType = 'Script Maintenance';
             summary = 'Script / Locator Configuration Error';
          } else if (errorMsg.includes('Timeout')) {
             issueType = 'Script Maintenance';
             summary = 'Script / Element Locator Timeout';
          } else if (errorMsg.includes('Validation Failure')) {
             summary = 'Form Validation Failure Detected';
          }
          
          jiraBugTicketsHTML += `
            <div style="border: 1px solid #dc3545; border-radius: 5px; margin-bottom: 15px; padding: 15px; background-color: #fff0f1; font-family: Arial, sans-serif;">
              <h3 style="margin-top: 0; color: #dc3545;">[Issue Type: ${issueType}] ${test.title}</h3>
              <p style="color: #333;"><strong>Summary:</strong> ${summary}</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px; color: #333;">
                ${expectedResult !== 'N/A' ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ffccd1; width: 30%;"><strong>Expected Result:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ffccd1;">${expectedResult}</td></tr>` : ''}
                ${actualResult !== 'N/A' ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ffccd1;"><strong>Actual Result:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ffccd1;">${actualResult}</td></tr>` : ''}
                ${validationMessage !== 'None' ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ffccd1;"><strong>Captured Validation Message:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ffccd1;">${validationMessage}</td></tr>` : ''}
                <tr><td style="padding: 8px;"><strong>Raw Error:</strong></td><td style="padding: 8px;"><pre style="font-size: 11px; color: #666; margin: 0; max-height: 100px; overflow: hidden;">${errorMsg.split('\n')[0]}</pre></td></tr>
              </table>
            </div>
          `;
        });
      }
    } else {
       console.error('❌ test-results.json not found. Cannot generate email metrics.');
       process.exit(1);
    }
  } catch (err) {
    console.error('⚠️ Failed to parse test-results.json for JIRA report generation:', err);
  }

  const passedStyle = 'color: #28a745; font-weight: bold;';
  const failedStyle = 'color: #dc3545; font-weight: bold;';
  const totalStyle = 'font-weight: bold;';

  // Determine overall status
  const isSuccess = (stats.failed === 0);
  const statusIcon = '';
  const statusText = 'Execution Summary';

  // Create HTML Email Body
  const htmlBody = `
    <h2>AWH Hospital Automation Execution Report</h2>
    <p>The automated test suite execution has completed. Below is the summary of the results.</p>
    
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; text-align: left; font-family: Arial, sans-serif;">
      <tr style="background-color: #f8f9fa;">
        <th>Metric</th>
        <th>Count</th>
      </tr>
      <tr>
        <td><strong>Total Tests</strong></td>
        <td style="${totalStyle}">${stats.total}</td>
      </tr>
      <tr>
        <td><strong>Passed</strong></td>
        <td style="${passedStyle}">${stats.passed}</td>
      </tr>
      <tr>
        <td><strong>Failed</strong></td>
        <td style="${failedStyle}">${stats.failed}</td>
      </tr>
      <tr>
        <td><strong>Skipped</strong></td>
        <td>${stats.skipped}</td>
      </tr>
    </table>

    <br>
    <p><strong>Environment Details:</strong></p>
    <ul>
      <li><strong>Execution Type:</strong> ${process.env.GITHUB_ACTIONS ? 'GitHub Actions' : (process.env.JENKINS_URL ? 'Jenkins CI' : (process.env.GITLAB_CI ? 'GitLab CI' : 'Local / Custom'))}</li>
      <li><strong>Timestamp:</strong> ${new Date().toUTCString()}</li>
    </ul>

    <!-- DYNAMIC JIRA DEFECT REPORTS INJECTED HERE -->
    ${jiraBugTicketsHTML}

    <p style="font-size: 12px; color: #6c757d;">This is an automated email generated by the AWH Hospital Playwright Automation Framework.</p>
  `;

  // Setup Nodemailer Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"AWH Hospital Automation" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `Automation Report: [${stats.passed}/${stats.total} Passed]`,
    html: htmlBody
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email report sent successfully to ${mailOptions.to} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error('❌ Failed to send email report:', error.message);
  }
}

sendEmailReport();
