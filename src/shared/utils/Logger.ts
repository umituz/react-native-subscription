/**
 * Subscription Logger
 * Centralized logging utility for the subscription package.
 * All logs are disabled - no logging.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogMetadata {
  [key: string]: unknown;
}

/** Log categories for filtering and grouping */
export const LOG_CATEGORY = {
  REVENUECAT: "RevenueCat",
  CREDITS: "Credits",
  TRIAL: "Trial",
  PURCHASE: "Purchase",
  FEATURE_GATE: "FeatureGate",
  SUBSCRIPTION: "Subscription",
  SYNC: "Sync",
} as const;

export type LogCategory = (typeof LOG_CATEGORY)[keyof typeof LOG_CATEGORY];

/**
 * Development-only logger that automatically respects __DEV__ flag.
 * All methods are no-ops - logging is disabled.
 */
class SubscriptionLogger {
  /** Enable or disable all logging */
  setEnabled(_enabled: boolean): void {
  }

  /** Enable logging for specific categories only */
  setCategories(_categories: LogCategory[]): void {
  }

  /** Clear category filter (log all categories) */
  clearCategories(): void {
  }

  debug(_category: LogCategory, _message: string, _metadata?: LogMetadata): void {
  }

  info(_category: LogCategory, _message: string, _metadata?: LogMetadata): void {
  }

  warn(_category: LogCategory, _message: string, _metadata?: LogMetadata): void {
  }

  error(_category: LogCategory, _message: string, _error?: unknown, _metadata?: LogMetadata): void {
  }

  /** Log purchase flow events */
  purchase(_message: string, _metadata?: LogMetadata): void {
  }

  /** Log credits-related events */
  credits(_message: string, _metadata?: LogMetadata): void {
  }

  /** Log trial-related events */
  trial(_message: string, _metadata?: LogMetadata): void {
  }

  /** Log RevenueCat SDK events */
  revenueCat(_message: string, _metadata?: LogMetadata): void {
  }

  /** Log feature gate events */
  featureGate(_message: string, _metadata?: LogMetadata): void {
  }

  /** Log sync operations */
  sync(_message: string, _metadata?: LogMetadata): void {
  }
}

/** Singleton logger instance */
export const Logger = new SubscriptionLogger();
