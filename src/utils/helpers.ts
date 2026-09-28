import { APIRequestContext } from '@playwright/test';

/**
 * Utility: Application-Agnostic Helpers.
 * Contains generic data generation and formatting functions.
 * WHY: Abstracting logic like random string/email generation keeps Page Objects
 * and Tests clean, and prevents duplication of generic algorithms.
 */
/**
 * Format a Date object to YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Generate a random alphanumeric string of the given length.
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
 * Generate a random email address with the given domain.
 */
export function generateRandomEmail(domain: string = 'example.com'): string {
    return `test_user_${randomString(8).toLowerCase()}@${domain}`;
}

/**
 * Generate a random 10-digit US phone number.
 */
export function generateRandomPhoneNumber(): string {
    const areaCode = Math.floor(200 + Math.random() * 700);
    const prefix = Math.floor(200 + Math.random() * 700);
    const lineNumber = Math.floor(1000 + Math.random() * 9000);
    return `${areaCode}${prefix}${lineNumber}`;
}

/**
 * Generate a unique timestamp-based identifier.
 */
export function generateTimestampId(): string {
    return `${Date.now()}_${randomString(4)}`;
}

/**
 * Perform a health check GET request against the base URL.
 */
export async function getHealthCheck(request: APIRequestContext) {
    return await request.get('/');
}