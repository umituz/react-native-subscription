import Purchases, { type CustomerInfo, type PurchasesOfferings } from "react-native-purchases";
import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";
import type { RevenueCatConfig } from "../../core/RevenueCatConfig";
import { resolveApiKey } from "../utils/ApiKeyResolver";

export interface InitializerDeps {
  config: RevenueCatConfig;
  isInitialized: () => boolean;
  getCurrentUserId: () => string | null;
  setInitialized: (value: boolean) => void;
  setCurrentUserId: (userId: string) => void;
}

// State management to prevent race conditions
const configurationState = {
    isPurchasesConfigured: false,
    isLogHandlerConfigured: false,
    configurationInProgress: false,
    configurationPromise: null as Promise<InitializeResult> | null,
};


// Simple lock mechanism to prevent concurrent configurations (implementation deferred)

function configureLogHandler(): void {
  if (configurationState.isLogHandlerConfigured) return;
  if (typeof Purchases.setLogHandler !== 'function') return;
  try {
    Purchases.setLogHandler((_logLevel, message) => {
      const ignoreMessages = ['Purchase was cancelled', 'AppTransaction', "Couldn't find previous transactions"];
      if (ignoreMessages.some(m => message.includes(m))) return;
    });
    configurationState.isLogHandlerConfigured = true;
  } catch {
    // Failing to set log handler should not block initialization
  }
}

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
      return { success: false, offering: null, isPremium: false };
    }
  }

  if (configurationState.isPurchasesConfigured) {
    try {
      const currentAppUserId = await Purchases.getAppUserID();
      let customerInfo;
      if (currentAppUserId !== userId) {
        const result = await Purchases.logIn(userId);
        customerInfo = result.customerInfo;
      } else {
        customerInfo = await Purchases.getCustomerInfo();
      }
      deps.setInitialized(true);
      deps.setCurrentUserId(userId);
      const offerings = await Purchases.getOfferings();
      return buildSuccessResult(deps, customerInfo, offerings);
    } catch {
      return { success: false, offering: null, isPremium: false };
    }
  }

  if (configurationState.configurationInProgress) {
    if (configurationState.configurationPromise) {
        await configurationState.configurationPromise;
        return initializeSDK(deps, userId, apiKey);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    return initializeSDK(deps, userId, apiKey);
  }

  const key = apiKey || resolveApiKey(deps.config);
  if (!key) {
    return { success: false, offering: null, isPremium: false };
  }

  let resolveInProgress: (value: InitializeResult) => void;
  configurationState.configurationPromise = new Promise((resolve) => {
    resolveInProgress = resolve;
  });
  
  configurationState.configurationInProgress = true;
  try {
    configureLogHandler();
    await Purchases.configure({ apiKey: key, appUserID: userId });
    configurationState.isPurchasesConfigured = true;
    deps.setInitialized(true);
    deps.setCurrentUserId(userId);

    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);

    const result = buildSuccessResult(deps, customerInfo, offerings);
    resolveInProgress!(result);
    return result;
  } catch {
    const errorResult = { success: false, offering: null, isPremium: false };
    resolveInProgress!(errorResult);
    return errorResult;
  } finally {
    configurationState.configurationInProgress = false;
    configurationState.configurationPromise = null;
  }
}

