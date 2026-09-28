import { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../../utils/logger';

export interface ApiRequestOptions {
  headers?: { [key: string]: string };
  data?: any;
  params?: { [key: string]: string | number | boolean };
  failOnStatusCode?: boolean;
  timeout?: number;
  retries?: number;
}

// Utility: Core API Client Wrapper.
// Wraps Playwright's native APIRequestContext to provide a unified HTTP client 
// featuring automated retries, exponential backoff handling, and detailed Winston logging.
export class ApiClient {
  // Injected via Playwright's `request` fixture from testFixtures or directly from tests.
  constructor(private request: APIRequestContext) {}

  /**
   * Performs an API request with built-in retries and logging.
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
          // Exponential backoff or simple delay could be added here
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
        
        // Attach execution time to response object for SLA validation
        (response as any).__executionTime = executionTime;

        // If it's a 5xx error, we might want to retry. If not, break the retry loop.
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

  public async get(url: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.executeRequest('get', url, options);
  }

  public async post(url: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.executeRequest('post', url, options);
  }

  public async put(url: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.executeRequest('put', url, options);
  }

  public async delete(url: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.executeRequest('delete', url, options);
  }

  public async patch(url: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.executeRequest('patch', url, options);
  }
}
