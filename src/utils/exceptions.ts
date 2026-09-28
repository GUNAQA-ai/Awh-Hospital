/**
 * Utility: Centralized Exception Handling.
 * Defines the custom error hierarchy for the framework.
 * By subclassing Error, we can categorize failures (e.g., Timeout, Locator, Network)
 * allowing reporters like Allure to automatically group and categorize test failures.
 */
export class FrameworkError extends Error {
  public readonly context?: string;

  constructor(message: string, context?: string) {
    super(context ? `[${context}] ${message}` : message);
    this.name = this.constructor.name;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TimeoutError extends FrameworkError {}
export class TargetClosedError extends FrameworkError {}
export class ProtocolError extends FrameworkError {}
export class LocatorError extends FrameworkError {}
export class NavigationError extends FrameworkError {}
export class FrameError extends FrameworkError {}
export class NetworkError extends FrameworkError {}
export class JavaScriptExecutionError extends FrameworkError {}
export class ExecutionContextDestroyedError extends FrameworkError {}
export class DetachedElementError extends FrameworkError {}
export class BrowserLaunchError extends FrameworkError {}
export class FileNotFoundError extends FrameworkError {}
export class JsonParseError extends FrameworkError {}
export class ConfigurationError extends FrameworkError {}
export class EnvironmentVariableError extends FrameworkError {}
export class CustomAssertionError extends FrameworkError {}

/**
 * Maps Playwright runtime errors to specific domain FrameworkErrors.
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
