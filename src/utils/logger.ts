import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// Utility: Logging framework.
// Provides structured, timestamped console and file logging (via Winston).
// This is primarily used for API/Health checks and advanced debugging outside of the Playwright reporter.
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
