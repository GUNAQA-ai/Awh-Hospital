/**
 * @file helpers.ts
 * @description
 * Application-Agnostic Utility and Random Data Generation Library.
 *
 * Responsibilities:
 * - Provide reusable date formatting and conversion utilities
 * - Generate synthetic test data (random alphanumeric strings, emails, phone numbers, unique IDs)
 * - Facilitate basic HTTP health check requests for API testing
 *
 * Major Exports:
 * - formatDate(): Formats Date instances to standard YYYY-MM-DD strings
 * - randomString(): Generates random alphanumeric strings of arbitrary length
 * - generateRandomEmail(): Creates unique randomized email addresses for test users
 * - generateRandomPhoneNumber(): Generates synthetic 10-digit phone numbers
 * - generateTimestampId(): Generates collision-resistant timestamped identifiers
 * - getHealthCheck(): Executes a root HTTP GET health probe
 *
 * Dependencies:
 * - @playwright/test: APIRequestContext, APIResponse
 *
 * Assumptions:
 * - Dates follow standard Gregorian calendar rules
 * - Random generators rely on Math.random() (suitable for testing, not cryptographic security)
 *
 * Side Effects:
 * - getHealthCheck() initiates an outbound HTTP network request
 *
 * Usage Considerations:
 * - Use these helpers across API tests, fixtures, and page objects to avoid hardcoded mock data.
 */

import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Formats a JavaScript Date object into an ISO 8601 date string (`YYYY-MM-DD`).
 *
 * @function formatDate
 *
 * @param {Date} date
 *        Required.
 *        The Date instance to format.
 *        Example: new Date('2026-09-30T10:00:00Z')
 *
 * @returns {string}
 *          The date formatted as `YYYY-MM-DD`.
 *          Example: "2026-09-30"
 *
 * @example
 * const todayStr = formatDate(new Date());
 */
export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Generates a random alphanumeric string consisting of ASCII uppercase letters,
 * lowercase letters, and digits.
 *
 * @function randomString
 *
 * @param {number} length
 *        Required.
 *        The total character length of the generated string.
 *        Valid range: integers >= 1.
 *        Example: 8
 *
 * @returns {string}
 *          A randomly generated alphanumeric string of the requested length.
 *          Example: "aB9xK2Lm"
 *
 * @example
 * const salt = randomString(6);
 */
export function randomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * Generates a unique, randomized email address for testing user registration.
 *
 * Combines a static prefix (`test_user_`), an 8-character random lowercase string,
 * and a customizable domain name.
 *
 * @function generateRandomEmail
 *
 * @param {string} [domain='example.com']
 *        Optional.
 *        The domain name for the email address.
 *        Default: 'example.com'.
 *        Example: 'hospital-test.org'
 *
 * @returns {string}
 *          A unique synthetic email address.
 *          Example: "test_user_k8x9m2p1@example.com"
 */
export function generateRandomEmail(domain: string = 'example.com'): string {
    return `test_user_${randomString(8).toLowerCase()}@${domain}`;
}

/**
 * Generates a synthetic 10-digit telephone number adhering to standard 10-digit formats.
 *
 * Ensures valid 3-digit area code (200-899), 3-digit prefix (200-899), and 4-digit line number (1000-9999).
 *
 * @function generateRandomPhoneNumber
 *
 * @returns {string}
 *          A 10-digit numeric string suitable for mock phone inputs.
 *          Example: "9876543210"
 */
export function generateRandomPhoneNumber(): string {
    const areaCode = Math.floor(200 + Math.random() * 700);
    const prefix = Math.floor(200 + Math.random() * 700);
    const lineNumber = Math.floor(1000 + Math.random() * 9000);
    return `${areaCode}${prefix}${lineNumber}`;
}

/**
 * Generates a collision-resistant unique identifier combining current epoch millisecond timestamp
 * with a 4-character random alphanumeric suffix.
 *
 * @function generateTimestampId
 *
 * @returns {string}
 *          A timestamped identifier string formatted as `<timestamp>_<random4>`.
 *          Example: "1790589290833_x9K2"
 */
export function generateTimestampId(): string {
    return `${Date.now()}_${randomString(4)}`;
}

/**
 * Performs an HTTP GET health check request against the root path (`/`) of the configured target server.
 *
 * @function getHealthCheck
 *
 * @param {APIRequestContext} request
 *        Required.
 *        The Playwright API request context instance configured with base URL and headers.
 *
 * @returns {Promise<APIResponse>}
 *          Resolves to the Playwright APIResponse object representing the server response.
 *
 * @throws {Error}
 *         Thrown if the underlying network connection fails.
 *
 * @example
 * const res = await getHealthCheck(request);
 * expect(res.status()).toBe(200);
 */
export async function getHealthCheck(request: APIRequestContext): Promise<APIResponse> {
    return await request.get('/');
}