/**
 * RevenueCat Initializer
 * Handles SDK initialization logic
 */

import Purchases from "react-native-purchases";
import type { InitializeResult } from "../../application/ports/IRevenueCatService";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { getErrorMessage } from "../../domain/types/RevenueCatTypes";

import { resolveApiKey } from "../utils/ApiKeyResolver";

export interface InitializerDeps {
  config: RevenueCatConfig;
  isUsingTestStore: () => boolean;
  isInitialized: () => boolean;
  getCurrentUserId: () => string | null;
  setInitialized: (value: boolean) => void;
  setCurrentUserId: (userId: string) => void;
}

export async function initializeSDK(
  deps: InitializerDeps,
  userId: string,
  apiKey?: string
): Promise<InitializeResult> {
  if (__DEV__) {
    console.log("[RevenueCat] initializeSDK() called with userId:", userId);
  }

  // Check if already initialized with same userId - skip re-configuration
  if (deps.isInitialized()) {
    const currentUserId = deps.getCurrentUserId();
    if (currentUserId === userId) {
      if (__DEV__) {
        console.log("[RevenueCat] Already initialized with same userId, skipping configure");
      }
      // Just fetch current state without re-configuring
      try {
        const [customerInfo, offerings] = await Promise.all([
          Purchases.getCustomerInfo(),
          Purchases.getOfferings(),
        ]);
        const entitlementId = deps.config.entitlementIdentifier;
        const hasPremium = !!customerInfo.entitlements.active[entitlementId];
        return { success: true, offering: offerings.current, hasPremium };
      } catch (error) {
        if (__DEV__) {
          console.log("[RevenueCat] Failed to get current state:", error);
        }
        return { success: false, offering: null, hasPremium: false };
      }
    } else {
      if (__DEV__) {
        console.log("[RevenueCat] Different userId, will re-configure");
      }
      // Different userId - need to logout first
      try {
        await Purchases.logOut();
      } catch {
        // Ignore logout errors
      }
    }
  }



  const key = apiKey || resolveApiKey(deps.config);
  if (!key) {
    if (__DEV__) {
      console.log("[RevenueCat] No API key available");
    }
    return { success: false, offering: null, hasPremium: false };
  }

  try {
    if (deps.isUsingTestStore()) {
      if (__DEV__) {
        console.log("[RevenueCat] Using Test Store key");
      }
    }

    if (__DEV__) {
      console.log("[RevenueCat] Calling Purchases.configure()...");
    }

    await Purchases.configure({ apiKey: key, appUserID: userId });
    deps.setInitialized(true);
    deps.setCurrentUserId(userId);

    if (__DEV__) {
      console.log("[RevenueCat] SDK configured successfully");
    }

    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);

    if (__DEV__) {
      console.log("[RevenueCat] Fetched offerings:", {
        hasCurrent: !!offerings.current,
        packagesCount: offerings.current?.availablePackages?.length ?? 0,
        allOfferingsCount: Object.keys(offerings.all).length,
      });
    }

    const entitlementId = deps.config.entitlementIdentifier;
    const hasPremium = !!customerInfo.entitlements.active[entitlementId];

    return { success: true, offering: offerings.current, hasPremium };
  } catch (error) {
    const errorMessage = getErrorMessage(error, "RevenueCat init failed");
    if (__DEV__) {
      console.log("[RevenueCat] Init failed:", errorMessage);
    }
    return { success: false, offering: null, hasPremium: false };
  }
}
