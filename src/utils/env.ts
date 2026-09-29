/**
 * @file env.ts
 * @description
 * Environment Configuration Management Module.
 *
 * Responsibilities:
 * - Resolve active execution environment (dev, uat, staging) from process.env.ENV
 * - Load and parse the environment-specific configuration file from src/configs/
 * - Validate the configuration structure at runtime using Zod schema validation
 * - Provide typed configuration values (baseURL, apiBaseURL, orchBaseURL) to tests and fixtures
 *
 * Major Exports:
 * - EnvConfigSchema: Zod schema defining the environment structure
 * - EnvConfig: Inferred TypeScript type for environment configuration
 * - getEnvConfig(): Function to load, validate, and return the active environment configuration
 *
 * Dependencies:
 * - path: Node.js path resolution
 * - fs: Node.js filesystem operations
 * - zod: Runtime schema validation
 * - ./exceptions: Custom framework exceptions (ConfigurationError, FileNotFoundError, JsonParseError)
 *
 * Assumptions:
 * - Configuration files exist in src/configs/{env}.json where env is dev, uat, or staging
 * - Fallback environment is 'uat' if process.env.ENV is unspecified
 *
 * Side Effects:
 * - Reads synchronously from the filesystem on invocation
 *
 * Usage Considerations:
 * - Call getEnvConfig() inside Playwright fixtures or configuration setup rather than per-step
 */

import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { ConfigurationError, FileNotFoundError, JsonParseError } from './exceptions';

/**
 * Zod runtime validation schema for environment configuration objects.
 *
 * Validates that the active environment configuration provides valid URLs
 * for the web application and backend service endpoints.
 *
 * @constant {z.ZodObject} EnvConfigSchema
 * @property {string} name - The human-readable name of the target environment (e.g., 'dev', 'uat', 'staging').
 * @property {string} baseURL - The absolute HTTP/HTTPS URL for the web frontend under test.
 * @property {string} [apiBaseURL] - Optional absolute URL for the Hospital Management System (HMS) Core REST API (default port 3000).
 * @property {string} [orchBaseURL] - Optional absolute URL for the AWH AI Orchestration Platform REST API (default port 3001).
 */
export const EnvConfigSchema = z.object({
  name: z.string(),
  baseURL: z.string().url(),
  apiBaseURL: z.string().url().optional(),   // HMS Core API (port 3000)
  orchBaseURL: z.string().url().optional(),  // AWH AI Platform API (port 3001)
});

/**
 * TypeScript type representation of the validated environment configuration.
 * Inferred directly from EnvConfigSchema to guarantee compile-time and runtime alignment.
 */
export type EnvConfig = z.infer<typeof EnvConfigSchema>;

/**
 * Loads, parses, and validates the environment configuration for the active test execution.
 *
 * Resolves the configuration JSON file from `src/configs/<ENV>.json` based on the
 * `ENV` operating system environment variable. If `ENV` is not set, defaults to 'uat'.
 *
 * @function getEnvConfig
 *
 * @env ENV
 *      Optional.
 *      Controls the target test environment.
 *      Accepted values: "dev" | "uat" | "staging".
 *      Default: "uat".
 *      Example: "staging"
 *
 * @returns {EnvConfig}
 *          The validated configuration object containing target URLs for the web app
 *          and backend services.
 *
 * @throws {FileNotFoundError}
 *         Thrown when the target JSON configuration file does not exist on disk.
 * @throws {ConfigurationError}
 *         Thrown when the configuration JSON fails Zod schema validation (e.g., invalid URL format).
 * @throws {JsonParseError}
 *         Thrown when the configuration file contains malformed or unparseable JSON.
 *
 * @example
 * // Load active environment configuration
 * const config = getEnvConfig();
 * console.log(`Running against: ${config.baseURL}`);
 */
export function getEnvConfig(): EnvConfig {
  const env = (process.env.ENV || 'uat').toLowerCase();
  const file = path.resolve(__dirname, '..', 'configs', `${env}.json`);
  if (!fs.existsSync(file)) {
    throw new FileNotFoundError(`Environment config not found: ${file} (ENV=${env})`, 'getEnvConfig');
  }
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsedJson = JSON.parse(raw);
    
    // Zod validation throws if the schema is invalid
    const config = EnvConfigSchema.parse(parsedJson);
    
    return config;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new ConfigurationError(`Invalid environment config schema in ${file}: ${error.issues.map((e: any) => e.message).join(', ')}`, 'getEnvConfig');
    }
    throw new JsonParseError(`Failed to parse environment config ${file}: ${error.message}`, 'getEnvConfig');
  }
}