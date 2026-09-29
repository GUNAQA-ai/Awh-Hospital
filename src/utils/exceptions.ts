/**
 * @file exceptions.ts
 * @description
 * Centralized Exception Hierarchy and Playwright Error Mapping.
 *
 * Responsibilities:
 * - Define a strongly typed exception hierarchy inheriting from JavaScript Error
 * - Attach diagnostic context strings to failure traces for precise failure attribution
 * - Map low-level browser/Playwright error strings into domain-specific exception types
 * - Enable Allure test reports and CI dashboards to categorize failures automatically
 *   (e.g., distinguishing test data/locator defects from infrastructure timeouts)
 *
 * Major Exports:
 * - FrameworkError: Base exception class with optional context prefix
 * - TimeoutError, TargetClosedError, ProtocolError, LocatorError, etc.: Specialized error types
 * - mapPlaywrightError(): Transformer function converting caught errors into typed FrameworkErrors
 *
 * Assumptions:
 * - Error messages adhere to standard Node.js / Playwright error naming conventions
 *
 * Side Effects:
 * - Captures V8 stack trace at the point of instantiation
 *
 * Usage Considerations:
 * - Always catch lower-level Playwright errors in BasePage/ApiClient and rethrow via `mapPlaywrightError(err, context)`
 */

/**
 * Base exception class for all custom errors across the test automation framework.
 *
 * Automatically prefixes the error message with the provided operation context
 * and captures clean V8 stack traces omitting the constructor call.
 *
 * @class FrameworkError
 * @extends {Error}
 */
export class FrameworkError extends Error {
  /**
   * The name or identifier of the method/action where the error originated.
   * @type {string | undefined}
   */
  public readonly context?: string;

  /**
   * Constructs a new FrameworkError instance.
   *
   * @param {string} message
   *        Required.
   *        Descriptive explanation of the error or failure cause.
   *        Example: "Element could not be found within the timeout."
   *
   * @param {string} [context]
   *        Optional.
   *        The function, step, or component name where the exception was thrown.
   *        Example: "clickOnElement" or "AwhBookingPage.sendOtp"
   */
  constructor(message: string, context?: string) {
    super(context ? `[${context}] ${message}` : message);
    this.name = this.constructor.name;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Thrown when an asynchronous wait or locator action exceeds its configured timeout budget. */
export class TimeoutError extends FrameworkError {}

/** Thrown when the target browser page, context, or browser process is closed prematurely during an action. */
export class TargetClosedError extends FrameworkError {}

/** Thrown when a Chrome DevTools Protocol (CDP) or low-level browser transport failure occurs. */
export class ProtocolError extends FrameworkError {}

/** Thrown when an element cannot be found, violates Playwright strict mode (multiple matches), or is unresolvable. */
export class LocatorError extends FrameworkError {}

/** Thrown when page navigation (goto, reload, forward/back) fails or times out. */
export class NavigationError extends FrameworkError {}

/** Thrown when interacting with an iframe that is missing, detached, or inaccessible. */
export class FrameError extends FrameworkError {}

/** Thrown when a network request fails at the transport level (e.g., DNS resolution failure, connection refused). */
export class NetworkError extends FrameworkError {}

/** Thrown when page.evaluate() or custom browser-side JavaScript encounters an unhandled runtime error. */
export class JavaScriptExecutionError extends FrameworkError {}

/** Thrown when a page navigation or reload destroys the active execution context while a script is running. */
export class ExecutionContextDestroyedError extends FrameworkError {}

/** Thrown when attempting an action on a DOM element that has been removed or replaced during re-rendering. */
export class DetachedElementError extends FrameworkError {}

/** Thrown when the browser binary fails to launch or initial CDP connection cannot be established. */
export class BrowserLaunchError extends FrameworkError {}

/** Thrown when a referenced local file (e.g., configuration, test data, attachment) cannot be located on disk. */
export class FileNotFoundError extends FrameworkError {}

/** Thrown when a JSON string or file cannot be parsed due to invalid syntax. */
export class JsonParseError extends FrameworkError {}

/** Thrown when a configuration file or runtime schema validation fails Zod parsing rules. */
export class ConfigurationError extends FrameworkError {}

/** Thrown when an expected environment variable is missing, empty, or invalid. */
export class EnvironmentVariableError extends FrameworkError {}

/** Thrown when a custom framework assertion fails against actual application state. */
export class CustomAssertionError extends FrameworkError {}

/**
 * Maps arbitrary runtime errors (including native Playwright and Node.js errors)
 * into strongly typed, domain-specific FrameworkError instances.
 *
 * Inspects the error message for known keywords (Timeout, target closed, CDP, detached,
 * ENOENT, JSON syntax, etc.) and wraps it in the corresponding specialized class.
 *
 * @function mapPlaywrightError
 *
 * @param {unknown} error
 *        Required.
 *        The caught error object or string from a try/catch block.
 *
 * @param {string} context
 *        Required.
 *        Human-readable identifier of the operation or step being executed when the error occurred.
 *        Example: "Navigating to 'Next week'"
 *
 * @returns {FrameworkError}
 *          A typed FrameworkError instance (or subclass) preserving context and original error text.
 *
 * @example
 * try {
 *   await page.click('#submit-btn');
 * } catch (err) {
 *   throw mapPlaywrightError(err, 'Submit Registration Form');
 * }
 */
export function mapPlaywrightError(error: any, context: string): FrameworkError {
  const msg = error?.message || String(error);

  if (msg.includes('Timeout') || msg.includes('exceeded') || msg.includes('timed out')) {
    return new TimeoutError(msg, context);
  }
  if (msg.includes('Target page, context or browser has been closed') || msg.includes('Target closed')) {
    return new TargetClosedError(msg, context);
  }
  if (msg.includes('Protocol error') || msg.includes('CDP')) {
    return new ProtocolError(msg, context);
  }
  if (msg.includes('detached from the DOM') || msg.includes('stale')) {
    return new DetachedElementError(msg, context);
  }
  if (msg.includes('Execution context was destroyed')) {
    return new ExecutionContextDestroyedError(msg, context);
  }
  if (msg.includes('net::ERR') || msg.includes('Network error')) {
    return new NetworkError(msg, context);
  }
  if (msg.includes('ENOENT') || msg.includes('no such file')) {
    return new FileNotFoundError(msg, context);
  }
  if (msg.includes('JSON') || msg.includes('SyntaxError')) {
    return new JsonParseError(msg, context);
  }
  if (msg.includes('locator') || msg.includes('strict mode violation')) {
    return new LocatorError(msg, context);
  }
  return new FrameworkError(msg, context);
}

