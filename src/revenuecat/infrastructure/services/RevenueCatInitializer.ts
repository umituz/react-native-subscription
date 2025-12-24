/**
 * RevenueCat Initializer
 * Handles SDK initialization logic
 */

import Purchases from "react-native-purchases";
import type { InitializeResult } from '../../application/ports/IRevenueCatService';
import type { RevenueCatConfig } from '../../domain/value-objects/RevenueCatConfig';
import { getErrorMessage } from '../../domain/types/RevenueCatTypes';
import { resolveApiKey } from '../utils/ApiKeyResolver';
import {
  trackPackageError,
  addPackageBreadcrumb,
} from "@umituz/react-native-sentry";

export interface InitializerDeps {
  config: RevenueCatConfig;
  isUsingTestStore: () => boolean;
  isInitialized: () => boolean;
  getCurrentUserId: () => string | null;
  setInitialized: (value: boolean) => void;
  setCurrentUserId: (userId: string) => void;
}

// Track if Purchases.configure has been called globally
let isPurchasesConfigured = false;

export async function initializeSDK(
  deps: InitializerDeps,
  userId: string,
  apiKey?: string
): Promise<InitializeResult> {
  if (__DEV__) {
    console.log('[DEBUG RevenueCatInitializer] initializeSDK called', {
      userId,
      hasApiKey: !!apiKey,
      isAlreadyConfigured: isPurchasesConfigured,
      isInitialized: deps.isInitialized(),
      currentUserId: deps.getCurrentUserId(),
    });
  }

  addPackageBreadcrumb("subscription", "SDK initialization started", {
    userId,
    hasApiKey: !!apiKey,
    isAlreadyConfigured: isPurchasesConfigured,
  });

  // Case 1: Already initialized with the same user ID
  if (deps.isInitialized() && deps.getCurrentUserId() === userId) {

    try {
      const [customerInfo, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);
      const entitlementId = deps.config.entitlementIdentifier;
      const hasPremium = !!customerInfo.entitlements.active[entitlementId];
      return { success: true, offering: offerings.current, hasPremium };
    } catch (error) {
      trackPackageError(
        error instanceof Error ? error : new Error(String(error)),
        {
          packageName: "subscription",
          operation: "get_current_state",
          userId,
        }
      );
      return { success: false, offering: null, hasPremium: false };
    }
  }

  // Case 2: Already configured but different user or re-initializing
  if (isPurchasesConfigured) {
    try {
      const { customerInfo } = await Purchases.logIn(userId);

      deps.setInitialized(true);
      deps.setCurrentUserId(userId);

      const offerings = await Purchases.getOfferings();
      const entitlementId = deps.config.entitlementIdentifier;
      const hasPremium = !!customerInfo.entitlements.active[entitlementId];

      return { success: true, offering: offerings.current, hasPremium };
    } catch (error) {
      // If logIn fails, we don't necessarily want to re-configure if it's already configured
      // But we can return failure
      return { success: false, offering: null, hasPremium: false };
    }
  }

  // Case 3: First time configuration
  const key = apiKey || resolveApiKey(deps.config);
  if (__DEV__) {
    console.log('[DEBUG RevenueCatInitializer] Resolved API key', {
      hasKey: !!key,
      keyPrefix: key ? key.substring(0, 10) + '...' : 'null',
      isTestStore: deps.isUsingTestStore(),
      configApiKey: deps.config.apiKey ? deps.config.apiKey.substring(0, 10) + '...' : 'null',
      configTestStoreKey: deps.config.testStoreKey ? deps.config.testStoreKey.substring(0, 10) + '...' : 'null',
    });
  }

  if (!key) {
    if (__DEV__) {
      console.log('[DEBUG RevenueCatInitializer] ERROR: No API key available!');
    }
    const error = new Error("No RevenueCat API key available");
    trackPackageError(error, {
      packageName: "subscription",
      operation: "sdk_init_no_key",
      userId,
    });
    return { success: false, offering: null, hasPremium: false };
  }

  try {
    if (__DEV__) {
      console.log('[DEBUG RevenueCatInitializer] Calling Purchases.configure', {
        apiKey: key.substring(0, 10) + '...',
        appUserID: userId,
      });
    }
    await Purchases.configure({ apiKey: key, appUserID: userId });
    isPurchasesConfigured = true;
    deps.setInitialized(true);
    deps.setCurrentUserId(userId);

    if (__DEV__) {
      console.log('[DEBUG RevenueCatInitializer] Purchases.configure succeeded, fetching data...');
    }

    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);

    const packagesCount = offerings.current?.availablePackages?.length ?? 0;

    if (__DEV__) {
      console.log('[DEBUG RevenueCatInitializer] Data fetched', {
        hasCurrent: !!offerings.current,
        currentIdentifier: offerings.current?.identifier,
        packagesCount,
        allOfferingsCount: Object.keys(offerings.all).length,
        allOfferingIds: Object.keys(offerings.all),
        packages: offerings.current?.availablePackages?.map(p => ({
          identifier: p.identifier,
          packageType: p.packageType,
        })),
      });
    }

    addPackageBreadcrumb("subscription", "Offerings fetched", {
      userId,
      hasCurrent: !!offerings.current,
      packagesCount,
      allOfferingsCount: Object.keys(offerings.all).length,
    });

    const entitlementId = deps.config.entitlementIdentifier;
    const hasPremium = !!customerInfo.entitlements.active[entitlementId];

    return { success: true, offering: offerings.current, hasPremium };
  } catch (error) {
    const errorMessage = getErrorMessage(error, "RevenueCat init failed");

    if (__DEV__) {
      console.log('[DEBUG RevenueCatInitializer] ERROR during initialization', {
        error,
        errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });
    }

    trackPackageError(
      error instanceof Error ? error : new Error(errorMessage),
      {
        packageName: "subscription",
        operation: "sdk_init",
        userId,
        errorMessage,
      }
    );

    return { success: false, offering: null, hasPremium: false };
  }
}
