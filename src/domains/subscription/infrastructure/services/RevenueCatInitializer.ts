import Purchases, { type CustomerInfo, type PurchasesOfferings } from "react-native-purchases";
import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";
import { resolveApiKey } from "../utils/ApiKeyResolver";
import type { InitializerDeps } from "./RevenueCatInitializer.types";
import { FAILED_INITIALIZATION_RESULT, CONFIGURATION_RETRY_DELAY_MS } from "./initializerConstants";

export type { InitializerDeps } from "./RevenueCatInitializer.types";

const configurationState = {
    isPurchasesConfigured: false,
    configurationInProgress: false,
    configurationPromise: null as Promise<InitializeResult> | null,
};

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
      return FAILED_INITIALIZATION_RESULT;
    }
  }

  if (configurationState.configurationInProgress) {
    if (configurationState.configurationPromise) {
        await configurationState.configurationPromise;
        return initializeSDK(deps, userId, apiKey);
    }
    await new Promise(resolve => setTimeout(resolve, CONFIGURATION_RETRY_DELAY_MS));
    return initializeSDK(deps, userId, apiKey);
  }

  const key = apiKey || resolveApiKey(deps.config);
  if (!key) {
    return FAILED_INITIALIZATION_RESULT;
  }

  let resolveInProgress: (value: InitializeResult) => void;
  configurationState.configurationPromise = new Promise((resolve) => {
    resolveInProgress = resolve;
  });
  
  configurationState.configurationInProgress = true;
  try {
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
    resolveInProgress!(FAILED_INITIALIZATION_RESULT);
    return FAILED_INITIALIZATION_RESULT;
  } finally {
    configurationState.configurationInProgress = false;
    configurationState.configurationPromise = null;
  }
}

