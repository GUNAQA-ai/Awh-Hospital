/**
 * @file send-email-report.js
 * @description
 * Executive Post-Execution HTML Email Notification & Microsoft Word (.docx) Defect Report Generator
 * for AWH Hospital Test Automation.
 *
 * Implements the exact corporate QA Defect Report document standard:
 * - Cover / Summary Page with Build Title, Subtitle, Reported Date, and Area Defect Summary Table.
 * - Clean PageBreaks separating the Summary Page and each Defect Ticket.
 * - Visible solid grid borders (size: 6, color: #8EA9DB / #1B365D) and cell padding (120-160 dxa).
 * - Standard 2-column Attribute Tables (Build, Module, Sub Module, Feature, Priority, Severity, Status, Reported Date, Assigned To).
 * - Clean human-readable QA sections: Issue Description, Steps to Reproduce (numbered), Expected Result, Actual Result, Test Data (bullets), Testing Evidence.
 * - Embedded High-Resolution Failure Screenshots (SS) under Testing Evidence.
 * - Word Document Header/Footer with Page Numbering ("Build 3 Defect Report | Page X").
 * - Outlook & Gmail hardened HTML email with inline CID screenshots and attached Word (.docx) report.
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak
} = require('docx');
require('dotenv').config();

/**
 * Formats duration in milliseconds to human-readable string (e.g. "1m 24s" or "850ms").
 *
 * @param {number} ms - Duration in milliseconds.
 * @returns {string} Formatted duration string.
 */
function formatDuration(ms) {
  if (!ms || isNaN(ms)) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  if (totalSeconds > 0) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}

/**
 * Formats a Date instance to standard document format: DD-MMM-YYYY (e.g. 29-Sep-2026).
 *
 * @param {Date} date - Date instance to format.
 * @returns {string} Formatted date string.
 */
function formatReportDate(date) {
  try {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return '29-Sep-2026';
  }
}

/**
 * Formats a Date instance to full time string with IST timezone.
 *
 * @param {Date} date - Date instance to format.
 * @returns {string} Formatted date time string.
 */
function formatDateTime(date) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    }).format(date) + ' (IST)';
  } catch {
    return date.toUTCString();
  }
}

/**
 * Formats Playwright step title into clean human QA steps (removing raw noisy tokens).
 *
 * @param {string} rawTitle - Raw step title from Playwright.
 * @returns {string} Clean human-readable step title.
 */
function cleanStepTitle(rawTitle) {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/^▶\s*/, '')
    .replace(/^STEP:\s*/i, '')
    .replace(/\[.*?\]\s*/g, '')
    .replace(/\s*\(.*?ms\)/g, '')
    .trim();
}

/**
 * Recursively parses Playwright suites and specs from test-results.json.
 *
 * @param {object} pwData - Root JSON data from test-results.json.
 * @returns {object} Extracted statistics, spec breakdown list, and defect cards.
 */
function parseTestResults(pwData) {
  const stats = { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 };
  const testList = [];
  const defects = [];
  let bugCounter = 1;

  function traverseSuite(suite, parentTitle = '') {
    const currentSuiteTitle = suite.title || parentTitle || 'General';

    if (suite.specs && Array.isArray(suite.specs)) {
      suite.specs.forEach(spec => {
        if (spec.tests && Array.isArray(spec.tests)) {
          spec.tests.forEach(testItem => {
            stats.total++;
            const results = testItem.results || [];
            const lastResult = results[results.length - 1] || {};
            const duration = lastResult.duration || 0;
            stats.duration += duration;

            let status = 'passed';
            if (testItem.status === 'skipped' || lastResult.status === 'skipped') {
              status = 'skipped';
              stats.skipped++;
            } else if (testItem.status === 'expected' || lastResult.status === 'passed') {
              status = 'passed';
              stats.passed++;
            } else {
              status = 'failed';
              stats.failed++;

              // Extract Defect Details
              const errorMsg = (lastResult.error && lastResult.error.message) ? lastResult.error.message : 'Test assertion or timeout failure';
              const cleanError = errorMsg.split('\n')[0].replace(/\u001b\[\d+m/g, '').trim();

              let expectedResult = 'The system should process the workflow successfully as per requirements without error or timeout.';
              let actualResult = 'Application encountered an assertion timeout or unexpected UI state during step execution.';

              const expectedMatch = errorMsg.match(/Expected.*?:(.*)/i);
              if (expectedMatch) expectedResult = expectedMatch[1].replace(/\u001b\[\d+m/g, '').trim();

              const actualMatch = errorMsg.match(/Received.*?:(.*)/i);
              if (actualMatch) actualResult = actualMatch[1].replace(/\u001b\[\d+m/g, '').trim();

              // Extract clean step trail
              const stepsList = [];
              if (lastResult.steps && Array.isArray(lastResult.steps)) {
                lastResult.steps.forEach(step => {
                  const cleaned = cleanStepTitle(step.title);
                  if (cleaned && !cleaned.toLowerCase().includes('beforeall') && !cleaned.toLowerCase().includes('afterall')) {
                    stepsList.push({
                      title: cleaned,
                      duration: step.duration,
                      failed: !!step.error
                    });
                  }
                });
              }

              // Extract screenshot path
              let screenshotPath = null;
              if (lastResult.attachments && Array.isArray(lastResult.attachments)) {
                const ssAttachment = lastResult.attachments.find(a => 
                  a.name === 'screenshot' || (a.contentType && a.contentType.includes('image/png')) || (a.path && a.path.endsWith('.png'))
                );
                if (ssAttachment && ssAttachment.path && fs.existsSync(ssAttachment.path)) {
                  screenshotPath = ssAttachment.path;
                }
              }

              // Fallback: search test-results folder if screenshotPath not found in attachments
              if (!screenshotPath) {
                const testResultsDir = path.join(__dirname, '..', 'test-results');
                if (fs.existsSync(testResultsDir)) {
                  const dirs = fs.readdirSync(testResultsDir);
                  for (const dir of dirs) {
                    const candidate = path.join(testResultsDir, dir, 'test-failed-1.png');
                    if (fs.existsSync(candidate)) {
                      screenshotPath = candidate;
                      break;
                    }
                  }
                }
              }

              // Area & Module Classification
              let area = 'Web Application';
              let subModule = 'New Patient Booking';
              if (currentSuiteTitle.toLowerCase().includes('existing')) {
                subModule = 'Existing Patient Booking';
              } else if (currentSuiteTitle.toLowerCase().includes('hms') || currentSuiteTitle.toLowerCase().includes('api')) {
                area = 'HMS Core API';
                subModule = 'API Integration';
              } else if (currentSuiteTitle.toLowerCase().includes('chat') || currentSuiteTitle.toLowerCase().includes('whatsapp')) {
                area = 'Chatbot / WhatsApp';
                subModule = 'AI Agent Flow';
              }

              let severity = 'Medium';
              let priority = 'P2 - High';
              if (errorMsg.includes('TimeoutError') || errorMsg.includes('500') || errorMsg.includes('Crash')) {
                severity = 'High';
                priority = 'P1 - Immediate';
              }

              defects.push({
                bugId: `BUG-${String(bugCounter++).padStart(3, '0')}`,
                area,
                module: 'Appointment Booking',
                subModule,
                feature: spec.title,
                priority,
                severity,
                status: 'New',
                reportedDate: formatReportDate(new Date()),
                assignedTo: 'Development Team',
                title: spec.title,
                issueDescription: cleanError,
                fullError: errorMsg.replace(/\u001b\[\d+m/g, ''),
                expectedResult,
                actualResult,
                duration: formatDuration(duration),
                steps: stepsList,
                screenshotPath: screenshotPath
              });
            }

            testList.push({
              suite: currentSuiteTitle,
              title: spec.title,
              status,
              duration: formatDuration(duration)
            });
          });
        }
      });
    }

    if (suite.suites && Array.isArray(suite.suites)) {
      suite.suites.forEach(child => traverseSuite(child, currentSuiteTitle));
    }
  }

  if (pwData.suites && Array.isArray(pwData.suites)) {
    pwData.suites.forEach(suite => traverseSuite(suite));
  }

  return { stats, testList, defects };
}

/**
 * Builds the exact corporate Microsoft Word (.docx) document matching the user's template.
 *
 * @param {object} stats - Execution metrics.
 * @param {Array} testList - Test cases list.
 * @param {Array} defects - Defect list with screenshots.
 * @returns {Promise<Buffer>} Generated .docx buffer.
 */
async function generateWordDefectDocument(stats, testList, defects) {
  const buildName = process.env.BUILD_NUMBER ? `Build ${process.env.BUILD_NUMBER}` : 'Build 3';
  const reportDateStr = formatReportDate(new Date());

  const docChildren = [];

  // -------------------------------------------------------------
  // COVER / HEADER SECTION
  // -------------------------------------------------------------
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: buildName.toUpperCase(), bold: true, size: 22, font: 'Cambria', color: '1B365D' })
      ],
      spacing: { before: 100, after: 0 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "DEFECT REPORT", bold: true, size: 22, font: 'Cambria', color: '1B365D' })
      ],
      spacing: { before: 0, after: 300 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Appointment Booking Application", bold: true, size: 36, font: 'Cambria', color: '000000' })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Web Application • WhatsApp • Chatbot", size: 22, font: 'Cambria', color: '595959' })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 50, after: 150 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Reported Date: ${reportDateStr}`, size: 20, font: 'Cambria', color: '595959' })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 50, after: 400 }
    })
  );

  // -------------------------------------------------------------
  // DEFECT SUMMARY SECTION
  // -------------------------------------------------------------
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: "DEFECT SUMMARY", bold: true, size: 26, font: 'Cambria', color: '1F4E78' })
      ],
      spacing: { before: 200, after: 120 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${buildName} defects identified during functional testing. Each defect contains its reproduction steps, expected result, actual result, test data, and the evidence associated with that defect.`,
          size: 21,
          font: 'Cambria',
          color: '262626'
        })
      ],
      spacing: { before: 50, after: 200 }
    })
  );

  // Calculate Area Counts for Summary Table
  const webAppDefects = defects.filter(d => d.area === 'Web Application').length;
  const hmsApiDefects = defects.filter(d => d.area === 'HMS Core API').length;
  const chatbotDefects = defects.filter(d => d.area.includes('Chatbot') || d.area.includes('WhatsApp')).length;
  const totalDefects = defects.length;

  // Solid, visible table borders
  const solidTableBorders = {
    top: { style: BorderStyle.SINGLE, size: 8, color: "1B365D" },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: "1B365D" },
    left: { style: BorderStyle.SINGLE, size: 8, color: "1B365D" },
    right: { style: BorderStyle.SINGLE, size: 8, color: "1B365D" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "8EA9DB" },
    insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "8EA9DB" }
  };

  const cellMargins = { top: 120, bottom: 120, left: 160, right: 160 };

  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: solidTableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: "1B365D" },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: "Area", bold: true, color: "FFFFFF", font: 'Cambria', size: 21 })] })]
          }),
          new TableCell({
            shading: { fill: "1B365D" },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: "Defects", bold: true, color: "FFFFFF", font: 'Cambria', size: 21 })] })]
          }),
          new TableCell({
            shading: { fill: "1B365D" },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: "Priority", bold: true, color: "FFFFFF", font: 'Cambria', size: 21 })] })]
          }),
          new TableCell({
            shading: { fill: "1B365D" },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: "Severity", bold: true, color: "FFFFFF", font: 'Cambria', size: 21 })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "Web Application", font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: String(webAppDefects), font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "P1 / P2", font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "Critical / High / Medium", font: 'Cambria', size: 20 })] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "HMS Core API", font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: String(hmsApiDefects), font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "P1 / P2", font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "High", font: 'Cambria', size: 20 })] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "Chatbot / WhatsApp", font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: String(chatbotDefects), font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "P1 / P2", font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "High / Medium", font: 'Cambria', size: 20 })] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true, font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: String(totalDefects), bold: true, font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "P1 / P2", bold: true, font: 'Cambria', size: 20 })] })] }),
          new TableCell({ margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "Critical / High / Medium", bold: true, font: 'Cambria', size: 20 })] })] })
        ]
      })
    ]
  });

  docChildren.push(summaryTable);

  // -------------------------------------------------------------
  // PAGE BREAK AFTER COVER SUMMARY PAGE
  // -------------------------------------------------------------
  docChildren.push(
    new Paragraph({
      children: [new PageBreak()]
    })
  );

  // -------------------------------------------------------------
  // INDIVIDUAL DEFECT CARDS (WITH EXACT TEMPLATE FORMAT & VISIBLE GRIDS)
  // -------------------------------------------------------------
  if (defects.length > 0) {
    let currentArea = '';

    for (let i = 0; i < defects.length; i++) {
      const d = defects[i];

      // Page break between subsequent defects for clean readable layout
      if (i > 0) {
        docChildren.push(
          new Paragraph({
            children: [new PageBreak()]
          })
        );
      }

      // Area Heading
      if (d.area !== currentArea) {
        currentArea = d.area;
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${currentArea.toUpperCase()} DEFECTS`, bold: true, size: 26, font: 'Cambria', color: '1F4E78' })
            ],
            spacing: { before: 100, after: 150 }
          })
        );
      }

      // Bug ID Heading
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: d.bugId, bold: true, size: 23, font: 'Cambria', color: '1F4E78' })
          ],
          spacing: { before: 100, after: 100 }
        })
      );

      const attrTableBorders = {
        top: { style: BorderStyle.SINGLE, size: 6, color: "8EA9DB" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "8EA9DB" },
        left: { style: BorderStyle.SINGLE, size: 6, color: "8EA9DB" },
        right: { style: BorderStyle.SINGLE, size: 6, color: "8EA9DB" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "8EA9DB" },
        insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "8EA9DB" }
      };

      // 2-Column Attribute Table (Soft Ice Blue Left Column)
      const attrTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: attrTableBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 28, type: WidthType.PERCENTAGE },
                shading: { fill: "D9E1F2" },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "Build", font: 'Cambria', size: 20 })] })]
              }),
              new TableCell({
                width: { size: 72, type: WidthType.PERCENTAGE },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: buildName, font: 'Cambria', size: 20 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "D9E1F2" },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "Module", font: 'Cambria', size: 20 })] })]
              }),
              new TableCell({
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: d.module, font: 'Cambria', size: 20 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "D9E1F2" },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "Sub Module", font: 'Cambria', size: 20 })] })]
              }),
              new TableCell({
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: d.subModule, font: 'Cambria', size: 20 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "D9E1F2" },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "Feature", font: 'Cambria', size: 20 })] })]
              }),
              new TableCell({
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: d.feature, font: 'Cambria', size: 20 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "D9E1F2" },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "Priority", font: 'Cambria', size: 20 })] })]
              }),
              new TableCell({
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: d.priority, font: 'Cambria', size: 20 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "D9E1F2" },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "Severity", font: 'Cambria', size: 20 })] })]
              }),
              new TableCell({
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: d.severity, font: 'Cambria', size: 20 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "D9E1F2" },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "Status", font: 'Cambria', size: 20 })] })]
              }),
              new TableCell({
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: d.status, font: 'Cambria', size: 20 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "D9E1F2" },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "Reported Date", font: 'Cambria', size: 20 })] })]
              }),
              new TableCell({
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: d.reportedDate, font: 'Cambria', size: 20 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "D9E1F2" },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: "Assigned To", font: 'Cambria', size: 20 })] })]
              }),
              new TableCell({
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun({ text: d.assignedTo, font: 'Cambria', size: 20 })] })]
              })
            ]
          })
        ]
      });

      docChildren.push(attrTable);

      // Section: Issue Description
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Issue Description", bold: true, size: 22, font: 'Cambria', color: '1F4E78' })
          ],
          spacing: { before: 180, after: 60 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: d.issueDescription, font: 'Cambria', size: 21, color: '262626' })
          ],
          spacing: { before: 0, after: 120 }
        })
      );

      // Section: Steps to Reproduce
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Steps to Reproduce", bold: true, size: 22, font: 'Cambria', color: '1F4E78' })
          ],
          spacing: { before: 120, after: 60 }
        })
      );

      if (d.steps && d.steps.length > 0) {
        d.steps.forEach((s, sIdx) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${sIdx + 1}. `, bold: true, font: 'Cambria', size: 20 }),
                new TextRun({ text: `${s.title}`, font: 'Cambria', size: 20, color: s.failed ? 'C00000' : '262626', bold: s.failed })
              ],
              spacing: { before: 20, after: 20 }
            })
          );
        });
      } else {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `1. Open the AWH Hospital Booking Portal.\n2. Initiate ${d.feature}.\n3. Observe the failure state during step verification.`, font: 'Cambria', size: 20 })
            ],
            spacing: { after: 100 }
          })
        );
      }

      // Section: Expected Result
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Expected Result", bold: true, size: 22, font: 'Cambria', color: '1F4E78' })
          ],
          spacing: { before: 120, after: 60 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: d.expectedResult, font: 'Cambria', size: 20, color: '262626' })
          ],
          spacing: { after: 100 }
        })
      );

      // Section: Actual Result
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Actual Result", bold: true, size: 22, font: 'Cambria', color: '1F4E78' })
          ],
          spacing: { before: 120, after: 60 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: d.actualResult, font: 'Cambria', size: 20, color: '262626' })
          ],
          spacing: { after: 100 }
        })
      );

      // Section: Test Data
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Test Data", bold: true, size: 22, font: 'Cambria', color: '1F4E78' })
          ],
          spacing: { before: 120, after: 60 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Patient Type: New Patient / Existing Patient\n• Environment: UAT (https://awh-website-booking-form.vercel.app/)\n• Browser: Google Chrome (Chromium Engine)\n• Test Data Artifact: sample/booking.json", font: 'Cambria', size: 20, color: '595959' })
          ],
          spacing: { after: 100 }
        })
      );

      // Section: Testing Evidence
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Testing Evidence", bold: true, size: 22, font: 'Cambria', color: '1F4E78' })
          ],
          spacing: { before: 120, after: 60 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Screenshot showing the state of the application at the point of assertion failure for ${d.bugId}.`, font: 'Cambria', size: 20, color: '595959' })
          ],
          spacing: { after: 120 }
        })
      );

      // Embedded High-Resolution Failure Screenshot
      if (d.screenshotPath && fs.existsSync(d.screenshotPath)) {
        try {
          const imageBuffer = fs.readFileSync(d.screenshotPath);
          docChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 580,
                    height: 330
                  }
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 300 }
            })
          );
        } catch (imgErr) {
          console.warn(`⚠️ Could not embed screenshot into Word doc for ${d.bugId}:`, imgErr.message);
        }
      }
    }
  }

  // Create Document with Standard 1-inch Margins, Headers and Footers
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (1440 dxa)
              bottom: 1440,
              left: 1440,
              right: 1440,
              header: 720,
              footer: 720
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${buildName} | Defect Report`, size: 18, color: '7F7F7F', font: 'Cambria' })
                ],
                alignment: AlignmentType.RIGHT
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${buildName} Defect Report | Page `, size: 18, color: '7F7F7F', font: 'Cambria' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '7F7F7F', font: 'Cambria' })
                ],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

/**
 * Compiles a plain-text JIRA defect summary file for copy-pasting.
 *
 * @param {Array} defects - List of defect breakdown objects.
 * @returns {string} Formatted plain text JIRA defect tickets.
 */
function buildPlainTextDefects(defects) {
  if (defects.length === 0) return '';
  return defects.map(d => {
    return [
      `======================================================================`,
      `DEFECT TICKET: ${d.bugId}`,
      `======================================================================`,
      `Feature / Spec:   ${d.title}`,
      `Module / Suite:   ${d.module} - ${d.subModule}`,
      `Classification:   ${d.severity} / ${d.priority}`,
      `Status:           ${d.status}`,
      `Reported Date:    ${d.reportedDate}`,
      `Assigned To:      ${d.assignedTo}`,
      ``,
      `Issue Summary:`,
      `${d.issueDescription}`,
      ``,
      `Expected Result:`,
      `${d.expectedResult}`,
      ``,
      `Actual Result:`,
      `${d.actualResult}`,
      ``,
      `Steps to Reproduce:`,
      d.steps.map((s, idx) => `  ${idx + 1}. ${s.title} (${s.duration}ms) ${s.failed ? '[FAILED HERE]' : ''}`).join('\n') || '  1. Run automated test scenario',
      ``,
      `Stack Trace Snippet:`,
      `${d.fullError}`,
      `======================================================================\n`
    ].join('\n');
  }).join('\n\n');
}

/**
 * Builds the executive, Outlook-hardened responsive HTML email body.
 *
 * @param {object} stats - Aggregate execution statistics.
 * @param {Array} testList - List of all executed tests.
 * @param {Array} defects - List of defect breakdown objects.
 * @returns {string} Fully styled HTML email string.
 */
function buildHtmlEmail(stats, testList, defects) {
  const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0';
  const isAllPassed = stats.failed === 0 && stats.total > 0;
  const executionDate = formatDateTime(new Date());
  const envName = (process.env.ENV || 'UAT').toUpperCase();
  const targetUrl = process.env.BASE_URL || 'https://awh-website-booking-form.vercel.app/';
  const buildSource = process.env.GITHUB_ACTIONS
    ? `GitHub Actions (Run #${process.env.GITHUB_RUN_NUMBER || '1'})`
    : process.env.JENKINS_URL
    ? `Jenkins CI (Build #${process.env.BUILD_NUMBER || '1'})`
    : 'Local Execution (Developer Workspace)';

  const statusBg = isAllPassed ? '#ECFDF5' : '#FEF2F2';
  const statusBorder = isAllPassed ? '#10B981' : '#EF4444';
  const statusColor = isAllPassed ? '#065F46' : '#991B1B';
  const statusIcon = isAllPassed ? '✅' : '⚠️';
  const statusHeading = isAllPassed ? 'All Automated Scenarios Passed' : `${stats.failed} Test Scenario(s) Failed`;
  const statusSubtext = isAllPassed
    ? `100% of test suites verified successfully without regressions.`
    : `Defect triage cards, reproduction steps, and failure screenshots (SS) are embedded below and in the attached Word Document (Build3_Booking.docx).`;

  const testRowsHtml = testList.slice(0, 25).map((t, idx) => {
    const isPass = t.status === 'passed';
    const isSkip = t.status === 'skipped';
    const badgeBg = isPass ? '#DEF7EC' : isSkip ? '#FEF08A' : '#FDE8E8';
    const badgeColor = isPass ? '#03543F' : isSkip ? '#713F12' : '#9B1C1C';
    const badgeIcon = isPass ? '✓ PASS' : isSkip ? '○ SKIP' : '✕ FAIL';
    const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';

    return `
      <tr style="background-color: ${rowBg}; border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 10px 14px; font-size: 13px; color: #111827; font-weight: 500;">
          ${t.title}
        </td>
        <td style="padding: 10px 14px; font-size: 12px; color: #6B7280;">
          ${t.suite}
        </td>
        <td style="padding: 10px 14px; font-size: 12px; color: #4B5563; text-align: center; white-space: nowrap;">
          ${t.duration}
        </td>
        <td style="padding: 10px 14px; text-align: center; white-space: nowrap;">
          <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 9999px; background-color: ${badgeBg}; color: ${badgeColor};">
            ${badgeIcon}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  let defectsHtml = '';
  if (defects.length > 0) {
    defectsHtml = `
      <div style="margin-top: 30px;">
        <div style="border-left: 4px solid #1F4E78; padding-left: 12px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 18px; color: #1F4E78; font-weight: 700;">🐞 DEFECT & ROOT CAUSE BREAKDOWN (${defects.length})</h3>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #6B7280;">
            Actionable defect summaries with failure screenshots (SS), step traces, and assertion discrepancies.
          </p>
        </div>
        ${defects.map((d, idx) => `
          <div style="background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px; margin-bottom: 24px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            
            <div style="background-color: #1F4E78; padding: 12px 16px;">
              <span style="background-color: #FFFFFF; color: #1F4E78; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-right: 8px;">${d.bugId}</span>
              <strong style="color: #FFFFFF; font-size: 14px;">${d.title}</strong>
            </div>

            <div style="padding: 16px;">
              <!-- 2-Column Attribute Table matching Word Spec -->
              <table width="100%" cellpadding="0" cellspacing="0" border="1" bordercolor="#8EA9DB" style="border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
                <tr>
                  <td width="30%" bgcolor="#D9E1F2" style="background-color: #D9E1F2; padding: 8px 12px; font-weight: bold; color: #1E293B;">Build</td>
                  <td style="padding: 8px 12px; color: #1E293B;">${process.env.BUILD_NUMBER ? `Build ${process.env.BUILD_NUMBER}` : 'Build 3'}</td>
                </tr>
                <tr>
                  <td bgcolor="#D9E1F2" style="background-color: #D9E1F2; padding: 8px 12px; font-weight: bold; color: #1E293B;">Module</td>
                  <td style="padding: 8px 12px; color: #1E293B;">${d.module}</td>
                </tr>
                <tr>
                  <td bgcolor="#D9E1F2" style="background-color: #D9E1F2; padding: 8px 12px; font-weight: bold; color: #1E293B;">Sub Module</td>
                  <td style="padding: 8px 12px; color: #1E293B;">${d.subModule}</td>
                </tr>
                <tr>
                  <td bgcolor="#D9E1F2" style="background-color: #D9E1F2; padding: 8px 12px; font-weight: bold; color: #1E293B;">Feature</td>
                  <td style="padding: 8px 12px; color: #1E293B;">${d.feature}</td>
                </tr>
                <tr>
                  <td bgcolor="#D9E1F2" style="background-color: #D9E1F2; padding: 8px 12px; font-weight: bold; color: #1E293B;">Priority</td>
                  <td style="padding: 8px 12px; color: #1E293B;">${d.priority}</td>
                </tr>
                <tr>
                  <td bgcolor="#D9E1F2" style="background-color: #D9E1F2; padding: 8px 12px; font-weight: bold; color: #1E293B;">Severity</td>
                  <td style="padding: 8px 12px; color: #1E293B;">${d.severity}</td>
                </tr>
                <tr>
                  <td bgcolor="#D9E1F2" style="background-color: #D9E1F2; padding: 8px 12px; font-weight: bold; color: #1E293B;">Status</td>
                  <td style="padding: 8px 12px; color: #1E293B;">${d.status}</td>
                </tr>
                <tr>
                  <td bgcolor="#D9E1F2" style="background-color: #D9E1F2; padding: 8px 12px; font-weight: bold; color: #1E293B;">Reported Date</td>
                  <td style="padding: 8px 12px; color: #1E293B;">${d.reportedDate}</td>
                </tr>
                <tr>
                  <td bgcolor="#D9E1F2" style="background-color: #D9E1F2; padding: 8px 12px; font-weight: bold; color: #1E293B;">Assigned To</td>
                  <td style="padding: 8px 12px; color: #1E293B;">${d.assignedTo}</td>
                </tr>
              </table>

              <!-- Issue Description -->
              <div style="margin-bottom: 12px;">
                <strong style="color: #1F4E78; font-size: 13px; display: block; margin-bottom: 4px;">Issue Description:</strong>
                <p style="margin: 0; font-size: 13px; color: #262626; line-height: 1.5;">${d.issueDescription}</p>
              </div>

              <!-- Steps to Reproduce -->
              <div style="margin-bottom: 12px;">
                <strong style="color: #1F4E78; font-size: 13px; display: block; margin-bottom: 4px;">Steps to Reproduce:</strong>
                <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #374151;">
                  ${d.steps.map(s => `<li style="margin-bottom: 3px; ${s.failed ? 'color: #DC2626; font-weight: bold;' : ''}">${s.title} ${s.failed ? '❌ [FAILED HERE]' : '✅'}</li>`).join('')}
                </ol>
              </div>

              <!-- Expected vs Actual -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #1F4E78; font-weight: bold; width: 25%;">Expected Result:</td>
                  <td style="padding: 4px 0; color: #059669;">${d.expectedResult}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #1F4E78; font-weight: bold;">Actual Result:</td>
                  <td style="padding: 4px 0; color: #DC2626;">${d.actualResult}</td>
                </tr>
              </table>

              <!-- Testing Evidence Screenshot -->
              ${d.screenshotPath ? `
                <div style="margin-top: 14px; border-top: 1px dashed #CBD5E1; padding-top: 12px;">
                  <strong style="color: #1F4E78; font-size: 13px; display: block; margin-bottom: 8px;">📸 Testing Evidence (Failure Screenshot SS):</strong>
                  <div style="text-align: center; background-color: #0F172A; padding: 10px; border-radius: 6px;">
                    <img src="cid:defect_ss_${idx + 1}" alt="${d.bugId} Failure Screenshot" style="max-width: 100%; height: auto; border-radius: 4px; display: block; margin: 0 auto;" />
                  </div>
                </div>
              ` : ''}

            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AWH Hospital Automation Execution Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: Cambria, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 720px; margin: 20px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #E5E7EB;">
    
    <!-- Outlook Hardened Header (Dark Blue #1B365D) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1B365D" style="background-color: #1B365D; background: #1B365D; width: 100%;">
      <tr>
        <td style="padding: 26px 32px; color: #FFFFFF; font-family: Cambria, Arial, sans-serif;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color: #3B82F6; padding: 4px 12px; border-radius: 16px; font-size: 11px; font-weight: bold; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.5px;">
                🏥 Appointment Booking Application
              </td>
            </tr>
          </table>
          <h1 style="margin: 10px 0 0 0; font-size: 22px; font-weight: 800; color: #FFFFFF; font-family: Cambria, Arial, sans-serif;">
            AWH Hospital — Test Execution Report
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #E0E7FF; font-family: Cambria, Arial, sans-serif;">
            Web Application • WhatsApp • Chatbot • Core API Verification
          </p>
        </td>
      </tr>
    </table>

    <!-- Main Content Container -->
    <div style="padding: 24px 32px;">

      <!-- Status Banner -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${statusBg}" style="background-color: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 16px 20px; font-family: Cambria, Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="36" style="font-size: 24px; vertical-align: top; line-height: 1;">
                  ${statusIcon}
                </td>
                <td style="vertical-align: top; padding-left: 8px;">
                  <h2 style="margin: 0; font-size: 16px; color: ${statusColor}; font-weight: bold;">${statusHeading}</h2>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: ${statusColor}; line-height: 1.4;">
                    ${statusSubtext}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Executive Metric KPI Table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; border-collapse: separate; border-spacing: 8px 0;">
        <tr>
          <td width="25%" align="center" bgcolor="#F8FAFC" style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase;">TOTAL TESTS</div>
            <div style="font-size: 24px; font-weight: 800; color: #0F172A; margin-top: 4px;">${stats.total}</div>
          </td>
          <td width="25%" align="center" bgcolor="#ECFDF5" style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 11px; font-weight: bold; color: #065F46; text-transform: uppercase;">PASSED</div>
            <div style="font-size: 24px; font-weight: 800; color: #059669; margin-top: 4px;">${stats.passed}</div>
          </td>
          <td width="25%" align="center" bgcolor="#FEF2F2" style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 11px; font-weight: bold; color: #991B1B; text-transform: uppercase;">FAILED</div>
            <div style="font-size: 24px; font-weight: 800; color: #DC2626; margin-top: 4px;">${stats.failed}</div>
          </td>
          <td width="25%" align="center" bgcolor="#FFFBEB" style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 11px; font-weight: bold; color: #92400E; text-transform: uppercase;">SKIPPED</div>
            <div style="font-size: 24px; font-weight: 800; color: #D97706; margin-top: 4px;">${stats.skipped}</div>
          </td>
        </tr>
      </table>

      <!-- Pass Rate Progress Bar -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F8FAFC" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 14px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
              <tr>
                <td style="font-size: 12px; font-weight: bold; color: #334155; text-transform: uppercase;">PASS RATE SCORE</td>
                <td align="right" style="font-size: 14px; font-weight: 800; color: ${isAllPassed ? '#059669' : '#DC2626'};">${passRate}%</td>
              </tr>
            </table>
            <div style="background-color: #E2E8F0; border-radius: 9999px; height: 8px; overflow: hidden;">
              <div style="background-color: ${isAllPassed ? '#10B981' : '#F59E0B'}; height: 8px; width: ${passRate}%; border-radius: 9999px;"></div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Execution Context Details -->
      <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: bold; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">
          ⚙️ EXECUTION ENVIRONMENT & METRICS
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 4px 0; color: #6B7280; width: 35%; font-weight: 500;">Target Environment:</td>
            <td style="padding: 4px 0; color: #111827; font-weight: 600;">
              <span style="background-color: #DBEAFE; color: #1E40AF; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${envName}</span>
              <span style="color: #6B7280; font-size: 12px; margin-left: 6px;">(${targetUrl})</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6B7280; font-weight: 500;">Execution Pipeline:</td>
            <td style="padding: 4px 0; color: #111827; font-weight: 600;">${buildSource}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6B7280; font-weight: 500;">Total Duration:</td>
            <td style="padding: 4px 0; color: #111827; font-weight: 600;">${formatDuration(stats.duration)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6B7280; font-weight: 500;">Completed At:</td>
            <td style="padding: 4px 0; color: #111827; font-weight: 600;">${executionDate}</td>
          </tr>
        </table>
      </div>

      <!-- Test Scenarios Breakdown Table -->
      <div style="margin-top: 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
          📋 TEST SCENARIO BREAKDOWN (${testList.length})
        </h3>
        <div style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background-color: #F3F4F6; border-bottom: 2px solid #E5E7EB;">
                <th style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #4B5563;">Test Scenario</th>
                <th style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #4B5563;">Suite</th>
                <th style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #4B5563; text-align: center;">Duration</th>
                <th style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #4B5563; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${testRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Embedded Defect Breakdown Cards with Screenshots -->
      ${defectsHtml}

    </div>

    <!-- Executive Footer -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F9FAFB" style="background-color: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
      <tr>
        <td style="padding: 20px 32px; color: #6B7280; font-size: 12px; font-family: Cambria, Arial, sans-serif;">
          <p style="margin: 0 0 6px 0; font-weight: bold; color: #374151;">
            AWH Hospital Automated QA Test Framework • Playwright + TypeScript + Allure Engine
          </p>
          <p style="margin: 0; color: #9CA3AF;">
            📎 Full Defect Analysis and Screenshots are attached as a Microsoft Word Document (<code>Build3_Booking.docx</code>).
          </p>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>
  `;
}

/**
 * Main execution function: parses test results, builds Word doc, defect tickets, and sends email.
 *
 * @returns {Promise<boolean>} True if email sent successfully, false otherwise.
 */
async function sendEmailReport() {
  console.log('📬 Initializing AWH Hospital Post-Execution Email Report Service...');

  // Check if email reporting is enabled
  if (process.env.SEND_EMAIL_REPORT !== 'true') {
    console.log('ℹ️ Email reporting is disabled (SEND_EMAIL_REPORT != "true"). Skipping email send.');
    return false;
  }

  // Verify SMTP credentials
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_TO'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    console.error(`❌ Cannot send email report. Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  // Load test-results.json
  const playwrightJsonPath = path.join(__dirname, '..', 'test-results.json');
  if (!fs.existsSync(playwrightJsonPath)) {
    console.error(`❌ Test results file not found at '${playwrightJsonPath}'. Ensure Playwright runs with json reporter.`);
    return false;
  }

  let pwData;
  try {
    const rawContent = fs.readFileSync(playwrightJsonPath, 'utf8');
    pwData = JSON.parse(rawContent);
  } catch (err) {
    console.error(`❌ Failed to parse test-results.json: ${err.message}`);
    return false;
  }

  const { stats, testList, defects } = parseTestResults(pwData);
  const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0';
  const htmlBody = buildHtmlEmail(stats, testList, defects);
  const plainTextDefects = buildPlainTextDefects(defects);

  // Generate Microsoft Word (.docx) Defect Document matching the exact user template
  let wordDocBuffer = null;
  try {
    wordDocBuffer = await generateWordDefectDocument(stats, testList, defects);
    const localDocxPath = path.join(__dirname, '..', 'Build3_Booking.docx');
    fs.writeFileSync(localDocxPath, wordDocBuffer);
    console.log(`📄 Generated Corporate Microsoft Word Defect Document (${localDocxPath}).`);
  } catch (docErr) {
    console.warn(`⚠️ Failed to generate Word document: ${docErr.message}`);
  }

  // Initialize Nodemailer SMTP Transporter
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const subjectStatus = stats.failed === 0 ? `✅ ALL PASSED (${stats.passed}/${stats.total})` : `⚠️ ${stats.failed} FAILED (${stats.passed}/${stats.total} Passed)`;
  const mailOptions = {
    from: `"AWH Hospital Automation" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `[${(process.env.ENV || 'UAT').toUpperCase()}] ${subjectStatus} - AWH Hospital Test Execution Report`,
    html: htmlBody,
    attachments: []
  };

  // Attach Microsoft Word (.docx) document (named Build3_Booking.docx to match exact standard)
  if (wordDocBuffer) {
    mailOptions.attachments.push({
      filename: 'Build3_Booking.docx',
      content: wordDocBuffer,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }

  // Attach plain-text defect tickets only if defects exist
  if (defects.length > 0) {
    mailOptions.attachments.push({
      filename: 'JIRA_Defect_Summary.txt',
      content: plainTextDefects,
      contentType: 'text/plain'
    });
  }

  // Attach Inline Failure Screenshots (SS) for CID rendering + Standalone image attachments
  defects.forEach((d, idx) => {
    if (d.screenshotPath && fs.existsSync(d.screenshotPath)) {
      mailOptions.attachments.push({
        filename: `${d.bugId}_Failure_Screenshot.png`,
        path: d.screenshotPath,
        cid: `defect_ss_${idx + 1}` // Allows <img src="cid:defect_ss_1" /> in HTML email
      });
    }
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Executive Email report with Word Doc (Build3_Booking.docx) & Screenshots sent successfully to ${mailOptions.to}!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Summary: Total=${stats.total}, Passed=${stats.passed}, Failed=${stats.failed}, Skipped=${stats.skipped} (${passRate}% Pass Rate)`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email report via SMTP:', error.message);
    return false;
  }
}

// If executed directly from CLI
if (require.main === module) {
  sendEmailReport();
}

module.exports = { sendEmailReport, parseTestResults, buildHtmlEmail, generateWordDefectDocument };
