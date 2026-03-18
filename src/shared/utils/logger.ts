/**
 * Centralized logging utilities for development-only logging.
 *
 * Benefits:
 * - Removes 8+ duplicated __DEV__ check patterns
 * - Single source for logging configuration
 * - Easier to add log aggregation later
 * - Consistent formatting across all logs
 */

/**
 * Log level for categorizing log messages.
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Structured log context for better debugging.
 */
export interface LogContext {
  /** Additional key-value pairs to include in the log */
  [key: string]: unknown;
}

/**
 * Internal logging function that only logs in __DEV__ mode.
 */
function log(
  level: LogLevel,
  tag: string,
  message: string,
  context?: LogContext
): void {
  if (typeof __DEV__ === "undefined" || !__DEV__) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    tag,
    message,
    ...context,
  };

  switch (level) {
    case LogLevel.DEBUG:
    case LogLevel.INFO:
      console.log(`[${tag}]`, message, context ? logData : "");
      break;
    case LogLevel.WARN:
      console.warn(`[${tag}]`, message, context ? logData : "");
      break;
    case LogLevel.ERROR:
      console.error(`[${tag}]`, message, context ? logData : "");
      break;
  }
}

/**
 * Log a debug message. Only shown in __DEV__ mode.
 *
 * @param tag - Component or feature name for filtering
 * @param message - Log message
 * @param context - Optional additional context data
 */
export function logDebug(tag: string, message: string, context?: LogContext): void {
  log(LogLevel.DEBUG, tag, message, context);
}

/**
 * Log an info message. Only shown in __DEV__ mode.
 *
 * @param tag - Component or feature name for filtering
 * @param message - Log message
 * @param context - Optional additional context data
 */
export function logInfo(tag: string, message: string, context?: LogContext): void {
  log(LogLevel.INFO, tag, message, context);
}

/**
 * Log a warning message. Only shown in __DEV__ mode.
 *
 * @param tag - Component or feature name for filtering
 * @param message - Warning message
 * @param context - Optional additional context data
 */
export function logWarn(tag: string, message: string, context?: LogContext): void {
  log(LogLevel.WARN, tag, message, context);
}

/**
 * Log an error message. Only shown in __DEV__ mode.
 *
 * @param tag - Component or feature name for filtering
 * @param message - Error message
 * @param error - Error object (will be serialized)
 * @param context - Optional additional context data
 */
export function logError(
  tag: string,
  message: string,
  error?: Error | unknown,
  context?: LogContext
): void {
  const errorContext = {
    ...context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
  };
  log(LogLevel.ERROR, tag, message, errorContext);
}

/**
 * Create a tagged logger for a specific component or feature.
 * Returns functions that automatically include the tag.
 *
 * @example
 * const logger = createLogger("useCredits");
 * logger.info("Credits loaded", { credits: 100 });
 * logger.error("Failed to load", error);
 */
export function createLogger(tag: string) {
  return {
    debug: (message: string, context?: LogContext) => logDebug(tag, message, context),
    info: (message: string, context?: LogContext) => logInfo(tag, message, context),
    warn: (message: string, context?: LogContext) => logWarn(tag, message, context),
    error: (message: string, error?: Error | unknown, context?: LogContext) =>
      logError(tag, message, error, context),
  };
}
