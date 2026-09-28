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
  let stats = { total: 0, passed: 0, failed: 0, skipped: 0 };
  let defectReportsTxt = '';
  let defectReportsHtml = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .defect-container { border: 1px solid #ccc; padding: 20px; margin-bottom: 30px; border-radius: 8px; background-color: #fcfcfc; }
        .defect-header { background-color: #dc3545; color: white; padding: 10px; font-weight: bold; font-size: 18px; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; vertical-align: top; }
        th { background-color: #f4f4f4; width: 25%; }
        pre { background-color: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #eee; overflow-x: auto; font-family: Consolas, monospace; font-size: 12px; margin: 0; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1 style="text-align: center;">Testing Defect Reports</h1>
      <hr>
  `;

  let hasDefects = false;
  let bugCounter = 1;

  try {
    const playwrightJsonPath = path.join(__dirname, '..', 'test-results.json');
    if (fs.existsSync(playwrightJsonPath)) {
      const pwData = JSON.parse(fs.readFileSync(playwrightJsonPath, 'utf8'));
      
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
                  hasDefects = true;
                  
                  const lastResult = test.results[test.results.length - 1];
                  const errorMsg = (lastResult && lastResult.error && lastResult.error.message) ? lastResult.error.message : 'Unknown Error';
                  
                  let expectedResult = 'System should process the workflow successfully as per requirements.';
                  let actualResult = 'Application threw an error or assertion failed during execution.';
                  
                  const expectedMatch = errorMsg.match(/Expected.*?:(.*)/i);
                  if (expectedMatch) expectedResult = expectedMatch[1].trim();
                  
                  const actualMatch = errorMsg.match(/Received.*?:(.*)/i);
                  if (actualMatch) actualResult = actualMatch[1].trim();

                  let stepsToReproduce = "1. Navigate to the application\\n2. Initiate the booking flow\\n3. Execute the scenario steps as defined in test data\\n4. Observe the failure at the validation step.";
                  
                  const bugId = `BUG-${String(bugCounter).padStart(3, '0')}`;
                  const buildName = process.env.GITHUB_RUN_NUMBER ? `GitHub Run ${process.env.GITHUB_RUN_NUMBER}` : (process.env.BUILD_NUMBER ? `Jenkins Build ${process.env.BUILD_NUMBER}` : 'Local Build');
                  
                  // Plain text format (like JIRA)
                  defectReportsTxt += `${bugId}\nBuild:          ${buildName}\nModule:         Appointment Booking\nSub Module:     ${suite.title || 'General'}\nFeature:        ${spec.title}\nPriority:       P1 - Immediate\nSeverity:       High\nStatus:         New\n\nIssue Description:\n${errorMsg.split('\n')[0]}\n\nSteps to Reproduce:\n${stepsToReproduce}\n\nExpected Result:\n${expectedResult}\n\nActual Result:\n${actualResult}\n\nTest Data:\n• Environment: ${process.env.NODE_ENV || 'QA'}\n• Browser: Chromium/Webkit/Firefox\n\nReported Date:\n${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}\n\nAssigned To:\nDevelopment Team\n\nTesting Evidence:\nSee automated test logs or Allure report for full stack trace.\n\n======================================================================\n`;

                  // HTML format
                  defectReportsHtml += `
                    <div class="defect-container">
                      <div class="defect-header">${bugId} : ${spec.title}</div>
                      <table>
                        <tr><th>Build</th><td>${buildName}</td></tr>
                        <tr><th>Module</th><td>Appointment Booking</td></tr>
                        <tr><th>Sub Module</th><td>${suite.title || 'General'}</td></tr>
                        <tr><th>Feature</th><td>${spec.title}</td></tr>
                        <tr><th>Priority</th><td>P1 - Immediate</td></tr>
                        <tr><th>Severity</th><td>High</td></tr>
                        <tr><th>Status</th><td>New</td></tr>
                        <tr><th>Issue Description</th><td>${errorMsg.split('\n')[0]}</td></tr>
                        <tr><th>Steps to Reproduce</th><td><pre>${stepsToReproduce}</pre></td></tr>
                        <tr><th>Expected Result</th><td>${expectedResult}</td></tr>
                        <tr><th>Actual Result</th><td>${actualResult}</td></tr>
                        <tr><th>Test Data</th><td>Automated test data set. Env: ${process.env.NODE_ENV || 'QA'}</td></tr>
                        <tr><th>Reported Date</th><td>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td></tr>
                        <tr><th>Assigned To</th><td>Development Team</td></tr>
                      </table>
                    </div>
                  `;
                  
                  bugCounter++;
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
      
      defectReportsHtml += `</body></html>`;
      
    } else {
       console.error('❌ test-results.json not found. Cannot generate email metrics.');
       process.exit(1);
    }
  } catch (err) {
    console.error('⚠️ Failed to parse test-results.json for JIRA report generation:', err);
  }

  // Create clean Email Body
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0056b3; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">AWH Hospital - Automation Execution Report</h2>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px;">Hello Team,</p>
        <p style="font-size: 16px;">The automated test suite execution has completed. Below is the high-level summary of the results.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Metric</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Count</th>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 12px;"><strong>Total Tests</strong></td>
            <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">${stats.total}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 12px;"><strong>Passed</strong></td>
            <td style="border: 1px solid #ddd; padding: 12px; color: #28a745; font-weight: bold;">${stats.passed}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 12px;"><strong>Failed</strong></td>
            <td style="border: 1px solid #ddd; padding: 12px; color: #dc3545; font-weight: bold;">${stats.failed}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 12px;"><strong>Skipped</strong></td>
            <td style="border: 1px solid #ddd; padding: 12px;">${stats.skipped}</td>
          </tr>
        </table>

        ${hasDefects ? 
          `<div style="background-color: #fff3cd; color: #856404; padding: 15px; border-left: 4px solid #ffeeba; margin-bottom: 20px;">
            <strong>⚠️ Action Required:</strong> There are failed tests. For detailed clarity, steps to reproduce, and defect analysis, <strong>please refer to the attached Defect Reports documents.</strong>
          </div>` : 
          `<div style="background-color: #d4edda; color: #155724; padding: 15px; border-left: 4px solid #c3e6cb; margin-bottom: 20px;">
            <strong>✅ All tests passed successfully!</strong> No defects were found in this run.
          </div>`
        }

        <p style="font-size: 14px; color: #555;"><strong>Environment Details:</strong></p>
        <ul style="font-size: 14px; color: #555;">
          <li><strong>Execution Type:</strong> ${process.env.GITHUB_ACTIONS ? 'GitHub Actions' : (process.env.JENKINS_URL ? 'Jenkins CI' : 'Local / Custom')}</li>
          <li><strong>Timestamp:</strong> ${new Date().toUTCString()}</li>
        </ul>
      </div>
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        This is an automated email generated by the AWH Hospital Playwright Framework. Please do not reply directly to this email.
      </div>
    </div>
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
    subject: `Automation Report: [${stats.passed}/${stats.total} Passed] - AWH Hospital`,
    html: htmlBody
  };

  // Attach defect report if failures exist
  if (hasDefects) {
    mailOptions.attachments = [
      {
        filename: 'Defect_Reports_Document.html',
        content: defectReportsHtml,
        contentType: 'text/html'
      },
      {
        filename: 'Defect_Reports_Raw.txt',
        content: defectReportsTxt,
        contentType: 'text/plain'
      }
    ];
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email report sent successfully to ${mailOptions.to} (Message ID: ${info.messageId})`);
    if (hasDefects) {
      console.log(`📎 Defect reports attached to email.`);
    }
  } catch (error) {
    console.error('❌ Failed to send email report:', error.message);
  }
}

sendEmailReport();
