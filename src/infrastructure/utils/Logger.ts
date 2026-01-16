/**
 * Subscription Logger
 * Centralized logging utility for the subscription package.
 * All logs are dev-only and automatically stripped in production.
 */

declare const __DEV__: boolean;

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
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
 * All methods are no-ops in production builds.
 */
class SubscriptionLogger {
  private enabled: boolean = true;
  private categories: Set<LogCategory> = new Set();

  /** Enable or disable all logging */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /** Enable logging for specific categories only */
  setCategories(categories: LogCategory[]): void {
    this.categories = new Set(categories);
  }

  /** Clear category filter (log all categories) */
  clearCategories(): void {
    this.categories.clear();
  }

  private shouldLog(category?: LogCategory): boolean {
    if (typeof __DEV__ === "undefined" || !__DEV__) return false;
    if (!this.enabled) return false;
    if (this.categories.size > 0 && category && !this.categories.has(category)) return false;
    return true;
  }

  private formatMessage(category: LogCategory | string, message: string): string {
    return `[${category}] ${message}`;
  }

  debug(category: LogCategory, message: string, context?: LogContext): void {
    if (!this.shouldLog(category)) return;
    console.log(this.formatMessage(category, message), context ?? "");
  }

  info(category: LogCategory, message: string, context?: LogContext): void {
    if (!this.shouldLog(category)) return;
    console.log(this.formatMessage(category, message), context ?? "");
  }

  warn(category: LogCategory, message: string, context?: LogContext): void {
    if (!this.shouldLog(category)) return;
    console.warn(this.formatMessage(category, message), context ?? "");
  }

  error(category: LogCategory, message: string, error?: unknown, context?: LogContext): void {
    if (!this.shouldLog(category)) return;
    console.error(this.formatMessage(category, message), { error, ...context });
  }

  /** Log purchase flow events */
  purchase(message: string, context?: LogContext): void {
    this.debug(LOG_CATEGORY.PURCHASE, message, context);
  }

  /** Log credits-related events */
  credits(message: string, context?: LogContext): void {
    this.debug(LOG_CATEGORY.CREDITS, message, context);
  }

  /** Log trial-related events */
  trial(message: string, context?: LogContext): void {
    this.debug(LOG_CATEGORY.TRIAL, message, context);
  }

  /** Log RevenueCat SDK events */
  revenueCat(message: string, context?: LogContext): void {
    this.debug(LOG_CATEGORY.REVENUECAT, message, context);
  }

  /** Log feature gate events */
  featureGate(message: string, context?: LogContext): void {
    this.debug(LOG_CATEGORY.FEATURE_GATE, message, context);
  }

  /** Log sync operations */
  sync(message: string, context?: LogContext): void {
    this.debug(LOG_CATEGORY.SYNC, message, context);
  }
}

/** Singleton logger instance */
export const Logger = new SubscriptionLogger();
