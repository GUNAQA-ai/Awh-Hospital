/**
 * @file ResponseValidator.ts
 * @description
 * Reusable assertions and validation engine for HTTP API responses.
 * Provides validation for HTTP status codes, performance SLA response latencies,
 * runtime JSON schema compliance using Zod, and HTTP header verification.
 *
 * Responsibilities:
 * - Assert exact HTTP status code or acceptable status code ranges (e.g. 200, 201, or [200, 204]).
 * - Enforce Service Level Agreement (SLA) response time constraints on tracked API requests.
 * - Validate JSON response body structural integrity and type contracts against Zod schemas.
 * - Verify presence and expected values/patterns for response HTTP headers.
 *
 * Major Classes:
 * - {@link ResponseValidator} - Static assertion helper class for API responses.
 *
 * Dependencies:
 * - `@playwright/test`: Core assertion utilities (`expect`, `APIResponse`).
 * - `zod`: Runtime TypeScript schema declaration and validation library (`ZodSchema`).
 * - `../../utils/logger`: Framework Winston logger.
 *
 * Assumptions:
 * - Incoming `APIResponse` instances are valid Playwright responses.
 * - For SLA validation, `__executionTime` was populated by {@link ApiClient}.
 *
 * Side Effects:
 * - Fails Playwright test step assertions on validation failures.
 * - Writes validation diagnostics and error formats to Winston logs.
 *
 * Usage Considerations:
 * - Use `validateSchema` to safely parse and return strongly-typed JSON bodies in test assertions.
 */

import { expect, APIResponse } from '@playwright/test';
import { ZodSchema } from 'zod';
import { logger } from '../../utils/logger';

/**
 * Static assertion utility providing standardized validation checks for HTTP responses.
 *
 * @class ResponseValidator
 */
export class ResponseValidator {
  
  /**
   * Validates that the HTTP status code of the response matches an expected value or is one of an allowed array of codes.
   *
   * @param {APIResponse} response
   *        Required.
   *        The Playwright APIResponse object to inspect.
   * @param {number | number[]} expectedStatus
   *        Required.
   *        The expected status code (e.g. 200) or an array of acceptable status codes (e.g. [200, 201]).
   * @returns {void}
   * @throws {Error}
   *         Thrown by Playwright expect if the actual status code does not match the expectation.
   *
   * @example
   * ResponseValidator.validateStatusCode(response, 200);
   * ResponseValidator.validateStatusCode(response, [200, 201]);
   */
  public static validateStatusCode(response: APIResponse, expectedStatus: number | number[]): void {
    const status = response.status();
    const url = response.url();
    
    if (Array.isArray(expectedStatus)) {
      expect(expectedStatus, `Expected status of ${url} to be one of ${expectedStatus.join(', ')} but got ${status}`)
        .toContain(status);
    } else {
      expect(status, `Expected status of ${url} to be ${expectedStatus} but got ${status}`).toBe(expectedStatus);
    }
    
    logger.info(`✅ Status code ${status} is valid.`);
  }

  /**
   * Validates the Service Level Agreement (SLA) response duration.
   * Asserts that the request execution latency did not exceed the specified threshold.
   *
   * @param {APIResponse} response
   *        Required.
   *        The Playwright APIResponse object containing the `__executionTime` metadata property.
   * @param {number} maxResponseTimeMs
   *        Required.
   *        The maximum acceptable response time in milliseconds.
   *        Example: 2000 (2 seconds)
   * @returns {Promise<void>}
   * @throws {Error}
   *         Thrown if the execution time exceeds maxResponseTimeMs.
   *
   * @example
   * await ResponseValidator.validateResponseTime(response, 1500);
   */
  public static async validateResponseTime(response: APIResponse, maxResponseTimeMs: number): Promise<void> {
    const executionTime = (response as any).__executionTime;
    const url = response.url();
    
    if (executionTime === undefined) {
      logger.warn(`Execution time was not tracked for ${url}. Skipping SLA validation.`);
      return;
    }

    expect(executionTime, `Expected response time for ${url} to be less than ${maxResponseTimeMs}ms but was ${executionTime}ms`)
      .toBeLessThan(maxResponseTimeMs);
      
    logger.info(`✅ Response time ${executionTime}ms is within SLA of ${maxResponseTimeMs}ms.`);
  }

  /**
   * Validates the JSON response payload against a Zod schema and returns the parsed, strongly-typed data.
   *
   * @template T
   * @param {APIResponse} response
   *        Required.
   *        The Playwright APIResponse object whose body will be parsed and validated.
   * @param {ZodSchema<T>} schema
   *        Required.
   *        The Zod schema representing the expected JSON contract.
   * @returns {Promise<T>}
   *          The parsed and validated data object conforming to type T.
   * @throws {Error}
   *         Thrown if JSON parsing fails or the payload does not satisfy the Zod schema contract.
   *
   * @example
   * const authData = await ResponseValidator.validateSchema(response, LoginResponseSchema);
   */
  public static async validateSchema<T>(response: APIResponse, schema: ZodSchema<T>): Promise<T> {
    const jsonBody = await response.json();
    const result = schema.safeParse(jsonBody);
    const url = response.url();

    if (!result.success) {
      logger.error(`Schema validation failed for ${url}: ${result.error.message}`);
      // Fail the test using expect to integrate with Playwright's reporting
      expect(result.success, `Schema validation failed for ${url}: \n${JSON.stringify(result.error.format(), null, 2)}`).toBe(true);
      throw new Error('Schema validation failed');
    }

    logger.info(`✅ Schema validation passed for ${url}.`);
    return result.data;
  }
  
  /**
   * Validates that specific HTTP headers exist in the response and match expected string values or regex patterns.
   *
   * @param {APIResponse} response
   *        Required.
   *        The Playwright APIResponse object to inspect.
   * @param {Record<string, string | RegExp>} expectedHeaders
   *        Required.
   *        Key-value dictionary where keys are header names and values are exact strings or RegExp patterns.
   *        Example: { 'content-type': /application\/json/ }
   * @returns {void}
   * @throws {Error}
   *         Thrown if a header is missing or its value does not match the expectation.
   *
   * @example
   * ResponseValidator.validateHeaders(response, { 'content-type': 'application/json; charset=utf-8' });
   */
  public static validateHeaders(response: APIResponse, expectedHeaders: Record<string, string | RegExp>): void {
    const actualHeaders = response.headers();
    
    for (const [header, expectedValue] of Object.entries(expectedHeaders)) {
      const lowerHeader = header.toLowerCase();
      expect(actualHeaders, `Expected header ${header} to be present`).toHaveProperty(lowerHeader);
      
      const actualValue = actualHeaders[lowerHeader];
      if (expectedValue instanceof RegExp) {
        expect(actualValue, `Expected header ${header} to match ${expectedValue}`).toMatch(expectedValue);
      } else {
        expect(actualValue, `Expected header ${header} to be ${expectedValue}`).toBe(expectedValue);
      }
    }
    
    logger.info(`✅ Headers validated successfully.`);
  }
}
