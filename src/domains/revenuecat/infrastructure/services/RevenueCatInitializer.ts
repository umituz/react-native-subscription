import Purchases, { type CustomerInfo, type PurchasesOfferings } from "react-native-purchases";
import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";
import { resolveApiKey } from "../utils/ApiKeyResolver";
import type { InitializerDeps } from "./RevenueCatInitializer.types";
import { FAILED_INITIALIZATION_RESULT, CONFIGURATION_RETRY_DELAY_MS } from "./initializerConstants";

export type { InitializerDeps } from "./RevenueCatInitializer.types";

/**
 * Thread-safe configuration state manager
 * Prevents race conditions during concurrent initialization attempts
 */
class ConfigurationStateManager {
  private _isPurchasesConfigured = false;
  private _configurationPromise: Promise<InitializeResult> | null = null;
  private _resolveConfiguration: ((value: InitializeResult) => void) | null = null;

  get isPurchasesConfigured(): boolean {
    return this._isPurchasesConfigured;
  }

  get configurationPromise(): Promise<InitializeResult> | null {
    return this._configurationPromise;
  }

  get isConfiguring(): boolean {
    return this._configurationPromise !== null;
  }

  /**
   * Starts a new configuration process
   * @throws Error if configuration is already in progress
   */
  startConfiguration(): (value: InitializeResult) => void {
    if (this._configurationPromise) {
      throw new Error('Configuration already in progress');
    }

    this._configurationPromise = new Promise((resolve) => {
      this._resolveConfiguration = resolve;
    });

    return (value: InitializeResult) => {
      if (this._resolveConfiguration) {
        this._resolveConfiguration(value);
      }
    };
  }

  /**
   * Completes the configuration process
   */
  completeConfiguration(success: boolean): void {
    this._isPurchasesConfigured = success;
    this._configurationPromise = null;
    this._resolveConfiguration = null;
  }

  /**
   * Resets the configuration state
   */
  reset(): void {
    this._isPurchasesConfigured = false;
    this._configurationPromise = null;
    this._resolveConfiguration = null;
  }
}

const configState = new ConfigurationStateManager();

function buildSuccessResult(deps: InitializerDeps, customerInfo: CustomerInfo, offerings: PurchasesOfferings): InitializeResult {
  const isPremium = !!customerInfo.entitlements.active[deps.config.entitlementIdentifier];
  return { success: true, offering: offerings.current, isPremium };
}

export async function initializeSDK(
  deps: InitializerDeps,
  userId: string,
  apiKey?: string
): Promise<InitializeResult> {
  if (deps.isInitialized() && deps.getCurrentUserId() === userId) {
    try {
      const [customerInfo, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);
      return buildSuccessResult(deps, customerInfo, offerings);
    } catch {
      return FAILED_INITIALIZATION_RESULT;
    }
  }

  if (configState.isPurchasesConfigured) {
    try {
      const currentAppUserId = await Purchases.getAppUserID();
      let customerInfo;

      // Handle user switching
      if (currentAppUserId !== userId) {
        if (userId) {
          // Switch to authenticated user
          const result = await Purchases.logIn(userId);
          customerInfo = result.customerInfo;
        } else {
          // User logged out - switch to anonymous
          customerInfo = await Purchases.logOut();
        }
      } else {
        customerInfo = await Purchases.getCustomerInfo();
      }

      deps.setInitialized(true);
      deps.setCurrentUserId(userId ?? null);
      const offerings = await Purchases.getOfferings();
      return buildSuccessResult(deps, customerInfo, offerings);
    } catch {
      return FAILED_INITIALIZATION_RESULT;
    }
  }

  if (configState.isConfiguring) {
    if (configState.configurationPromise) {
      await configState.configurationPromise;
      return initializeSDK(deps, userId, apiKey);
    }
    await new Promise(resolve => setTimeout(resolve, CONFIGURATION_RETRY_DELAY_MS));
    return initializeSDK(deps, userId, apiKey);
  }

  const key = apiKey || resolveApiKey(deps.config);
  if (!key) {
    return FAILED_INITIALIZATION_RESULT;
  }

  let resolveConfig: (value: InitializeResult) => void;
  try {
    resolveConfig = configState.startConfiguration();
  } catch {
    // Configuration already in progress, wait and retry
    await new Promise(resolve => setTimeout(resolve, CONFIGURATION_RETRY_DELAY_MS));
    return initializeSDK(deps, userId, apiKey);
  }

  try {
    // Configure with null appUserID for anonymous users (generates RevenueCat anonymous ID)
    // For authenticated users, use their userId
    await Purchases.configure({ apiKey: key, appUserID: userId ?? null });
    deps.setInitialized(true);
    deps.setCurrentUserId(userId ?? null);

    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);

    const result = buildSuccessResult(deps, customerInfo, offerings);
    configState.completeConfiguration(true);
    resolveConfig(result);
    return result;
  } catch {
    configState.completeConfiguration(false);
    resolveConfig(FAILED_INITIALIZATION_RESULT);
    return FAILED_INITIALIZATION_RESULT;
  }
}

