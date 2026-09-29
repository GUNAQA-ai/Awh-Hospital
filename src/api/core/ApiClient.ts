/**
 * @file ApiClient.ts
 * @description
 * HTTP client wrapper around Playwright's native APIRequestContext.
 * Provides unified request dispatching, automated retry handling with linear/exponential backoff,
 * performance execution timing for SLA verification, and structured Winston logging.
 *
 * Responsibilities:
 * - Wrap Playwright HTTP methods (`get`, `post`, `put`, `delete`, `patch`) under a single client.
 * - Provide automatic retry mechanisms for intermittent 5xx server errors and network disruptions.
 * - Measure and attach request execution latency (`__executionTime`) to responses for SLA assertions.
 * - Emit structured request/response lifecycle logs to Winston.
 *
 * Major Classes:
 * - {@link ApiClient} - Core HTTP client class wrapping APIRequestContext.
 *
 * Major Interfaces:
 * - {@link ApiRequestOptions} - Options configuring headers, payload, query params, timeouts, and retries.
 *
 * Dependencies:
 * - `@playwright/test`: APIRequestContext and APIResponse primitives.
 * - `../../utils/logger`: Framework Winston logger.
 *
 * Assumptions:
 * - The underlying APIRequestContext is initialized and maintained by Playwright test fixtures.
 * - Requests are made against reachable HMS/Orchestrator REST endpoints.
 *
 * Side Effects:
 * - Emits HTTP traffic over the network.
 * - Writes request/response timing and error logs to console and log files.
 *
 * Usage Considerations:
 * - Injected via `apiClient` test fixture in `testFixtures.ts`.
 * - Do not instantiate raw `fetch` or `axios`; use ApiClient across all API endpoint classes.
 */

import { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../../utils/logger';

/**
 * Configuration options for HTTP requests executed through {@link ApiClient}.
 *
 * @interface ApiRequestOptions
 */
export interface ApiRequestOptions {
  /**
   * Key-value map of HTTP request headers.
   * Example: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <token>' }
   */
  headers?: { [key: string]: string };

  /**
   * Request body payload for POST, PUT, or PATCH requests.
   * Can be an object (auto-serialized to JSON) or string.
   */
  data?: any;

  /**
   * Query string parameters appended to the URL.
   * Example: { limit: 10, offset: 0 }
   */
  params?: { [key: string]: string | number | boolean };

  /**
   * Whether Playwright should automatically throw an error if the HTTP status code is >= 400.
   * Default: false (allows test suites to validate error response schemas).
   */
  failOnStatusCode?: boolean;

  /**
   * Maximum duration in milliseconds to wait for the request to complete before timing out.
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts to perform on network errors or 5xx HTTP responses.
   * Default: 0 (no retries).
   */
  retries?: number;
}

/**
 * Core API Client Wrapper.
 * Wraps Playwright's native APIRequestContext to provide a unified HTTP client 
 * featuring automated retries, backoff handling, and detailed Winston logging.
 *
 * @class ApiClient
 */
export class ApiClient {
  /**
   * Initializes the ApiClient with an active Playwright APIRequestContext.
   *
   * @param {APIRequestContext} request
   *        Required.
   *        Playwright's request context instance, normally injected via test fixture.
   */
  constructor(private request: APIRequestContext) {}

  /**
   * Executes an HTTP request with built-in retries, backoff delays, performance timing, and logging.
   *
   * WHY:
   * Microservices in cloud and test environments occasionally encounter transient 5xx Gateway/Service errors
   * or temporary socket drops. The retry loop gracefully recovers from transient hiccups while recording
   * total roundtrip execution time for downstream SLA validation assertions.
   *
   * @param {'get' | 'post' | 'put' | 'delete' | 'patch'} method
   *        Required.
   *        The HTTP verb to execute.
   * @param {string} url
   *        Required.
   *        Destination endpoint URL (absolute or relative to baseURL).
   * @param {ApiRequestOptions} [options={}]
   *        Optional.
   *        Request options including payload, headers, query params, and retry counts.
   * @returns {Promise<APIResponse>}
   *          The resolved Playwright APIResponse object decorated with `__executionTime`.
   * @throws {Error}
   *         Thrown if all retry attempts fail or a critical network failure occurs.
   */
  private async executeRequest(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<APIResponse> {
    const retries = options.retries ?? 0;
    let response: APIResponse | undefined;
    let lastError: any;

    const requestStart = Date.now();
    logger.info(`--> [${method.toUpperCase()}] ${url}`);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          logger.warn(`Retrying request... Attempt ${attempt}/${retries}`);
          // Linear backoff delay (1000ms * attempt number)
          await new Promise(res => setTimeout(res, 1000 * attempt));
        }

        response = await this.request[method](url, {
          headers: options.headers,
          data: options.data,
          params: options.params,
          failOnStatusCode: options.failOnStatusCode ?? false,
          timeout: options.timeout,
        });

        const executionTime = Date.now() - requestStart;
        logger.info(`<-- [${response.status()}] ${url} (${executionTime}ms)`);

        // Attach execution time to response object for downstream SLA / performance assertions
        (response as any).__executionTime = executionTime;

        // If the server returns a 5xx response and retries remain, retry the request
        if (response.status() >= 500 && attempt < retries) {
          logger.warn(`Received ${response.status()} from ${url}, will retry...`);
          continue;
        }

        return response;
      } catch (error) {
        lastError = error;
        logger.error(`Request failed: ${error}`);
        if (attempt === retries) {
          throw error;
        }
      }
    }

    if (response) {
      return response;
    }

    throw lastError || new Error('Request failed unexpectedly.');
  }

  /**
   * Sends an HTTP GET request to the specified URL.
   *
   * @param {string} url
   *        Required.
   *        Destination URL.
   *        Example: "/hms/api/doctors"
   * @param {ApiRequestOptions} [options]
   *        Optional.
   *        Request options including query parameters and headers.
   * @returns {Promise<APIResponse>}
   *          The Playwright APIResponse object.
   * @throws {Error}
   *         Thrown if the request fails after exhausting configured retries.
   *
   * @example
   * const res = await apiClient.get('/hms/api/health');
   */
  public async get(url: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.executeRequest('get', url, options);
  }

  /**
   * Sends an HTTP POST request to the specified URL.
   *
   * @param {string} url
   *        Required.
   *        Destination URL.
   *        Example: "/hms/api/auth/token"
   * @param {ApiRequestOptions} [options]
   *        Optional.
   *        Request options including payload `data` and headers.
   * @returns {Promise<APIResponse>}
   *          The Playwright APIResponse object.
   * @throws {Error}
   *
   * @example
   * const res = await apiClient.post('/hms/api/auth/login', { data: { username, password } });
   */
  public async post(url: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.executeRequest('post', url, options);
  }

  /**
   * Sends an HTTP PUT request to the specified URL.
   *
   * @param {string} url
   *        Required.
   *        Destination URL.
   * @param {ApiRequestOptions} [options]
   *        Optional.
   *        Request options including replacement payload `data`.
   * @returns {Promise<APIResponse>}
   * @throws {Error}
   */
  public async put(url: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.executeRequest('put', url, options);
  }

  /**
   * Sends an HTTP DELETE request to the specified URL.
   *
   * @param {string} url
   *        Required.
   *        Destination URL.
   * @param {ApiRequestOptions} [options]
   *        Optional.
   *        Request options including headers or query params.
   * @returns {Promise<APIResponse>}
   * @throws {Error}
   */
  public async delete(url: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.executeRequest('delete', url, options);
  }

  /**
   * Sends an HTTP PATCH request to the specified URL.
   *
   * @param {string} url
   *        Required.
   *        Destination URL.
   * @param {ApiRequestOptions} [options]
   *        Optional.
   *        Request options including partial payload `data`.
   * @returns {Promise<APIResponse>}
   * @throws {Error}
   */
  public async patch(url: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.executeRequest('patch', url, options);
  }
}
