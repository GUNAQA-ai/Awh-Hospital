/**
 * @file logger.ts
 * @description
 * Centralized Logging Service using Winston.
 *
 * Responsibilities:
 * - Configure standardized console and file log transports
 * - Provide structured, timestamped, and colorized log formatting
 * - Persist execution logs to disk (`logs/api-health.log`) for CI/CD and offline audit trails
 *
 * Major Exports:
 * - logger: Singleton Winston Logger instance used across API tests and framework utilities
 *
 * Dependencies:
 * - winston: Enterprise-grade logging library for Node.js
 *
 * Assumptions:
 * - The `logs/` directory is writable by the process runtime
 * - Default log level is 'info' unless reconfigured
 *
 * Side Effects:
 * - Appends log entries to `logs/api-health.log` on disk
 * - Outputs formatted log lines to stdout
 *
 * Usage Considerations:
 * - Use `logger.info()`, `logger.warn()`, `logger.error()`, and `logger.debug()` for non-UI diagnostic logging.
 * - For Playwright UI test steps, use `ConsoleStepReporter` to maintain clean Allure and terminal reports.
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

/**
 * Custom Winston log output formatter.
 * Produces lines formatted as: `[YYYY-MM-DD HH:mm:ss] LEVEL: message`.
 */
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

/**
 * Global application logger instance.
 *
 * Configured with two transports:
 * 1. Console transport: Output with ANSI color coding for terminal readability.
 * 2. File transport: Appends entries to `logs/api-health.log` without ANSI color escape codes.
 *
 * @constant {winston.Logger} logger
 *
 * @example
 * import { logger } from '../utils/logger';
 *
 * logger.info('API Client initialized with base URL: https://api.hospital.com');
 * logger.error('Request failed with status 500', { endpoint: '/api/v1/doctors' });
 */
export const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/api-health.log' }) // Persists API execution logs.
  ],
});

