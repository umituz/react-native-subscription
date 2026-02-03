import Purchases, { LOG_LEVEL } from "react-native-purchases";
import type { InitializeResult } from "../../application/ports/IRevenueCatService";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { resolveApiKey } from "../utils/ApiKeyResolver";

declare const __DEV__: boolean;

export interface InitializerDeps {
  config: RevenueCatConfig;
  isInitialized: () => boolean;
  getCurrentUserId: () => string | null;
  setInitialized: (value: boolean) => void;
  setCurrentUserId: (userId: string) => void;
}

let isPurchasesConfigured = false;
let isLogHandlerConfigured = false;
let configurationInProgress = false;

function configureLogHandler(): void {
  if (isLogHandlerConfigured) return;
  if (typeof Purchases.setLogHandler !== 'function') return;
  try {
    Purchases.setLogHandler((logLevel, message) => {
      const ignoreMessages = ['Purchase was cancelled', 'AppTransaction', "Couldn't find previous transactions"];
      if (ignoreMessages.some(m => message.includes(m))) return;
      if (logLevel === LOG_LEVEL.ERROR && __DEV__) console.error('[RevenueCat]', message);
    });
    isLogHandlerConfigured = true;
  } catch {
    // Native module not available (Expo Go)
  }
}

function buildSuccessResult(deps: InitializerDeps, customerInfo: any, offerings: any): InitializeResult {
  const hasPremium = !!customerInfo.entitlements.active[deps.config.entitlementIdentifier];
  return { success: true, offering: offerings.current, hasPremium };
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
      return { success: false, offering: null, hasPremium: false };
    }
  }

  if (isPurchasesConfigured) {
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
      return { success: false, offering: null, hasPremium: false };
    }
  }

  if (configurationInProgress) {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (isPurchasesConfigured) return initializeSDK(deps, userId, apiKey);
    return { success: false, offering: null, hasPremium: false };
  }

  const key = apiKey || resolveApiKey(deps.config);
  if (!key) {
    if (__DEV__) console.log('[RevenueCat] No API key');
    return { success: false, offering: null, hasPremium: false };
  }

  configurationInProgress = true;
  try {
    configureLogHandler();
    if (__DEV__) console.log('[RevenueCat] Configuring:', key.substring(0, 10) + '...');

    await Purchases.configure({ apiKey: key, appUserID: userId });
    isPurchasesConfigured = true;
    deps.setInitialized(true);
    deps.setCurrentUserId(userId);

    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);

    if (__DEV__) {
      console.log('[RevenueCat] Initialized', {
        packages: offerings.current?.availablePackages?.length ?? 0,
      });
    }
    return buildSuccessResult(deps, customerInfo, offerings);
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Init failed:', error);
    return { success: false, offering: null, hasPremium: false };
  } finally {
    configurationInProgress = false;
  }
}
