/**
 * RevenueCat Initializer
 * Handles SDK initialization logic
 */

import Purchases from "react-native-purchases";
import type { InitializeResult } from "../../application/ports/IRevenueCatService";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { getErrorMessage } from "../../domain/types/RevenueCatTypes";
import { resolveApiKey } from "../utils/ApiKeyResolver";
import {
  trackPackageError,
  addPackageBreadcrumb,
  trackPackageWarning,
} from "@umituz/react-native-sentry";

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
  addPackageBreadcrumb("subscription", "SDK initialization started", {
    userId,
    hasApiKey: !!apiKey,
  });

  if (__DEV__) {
    console.log("[RevenueCat] initializeSDK() called with userId:", userId);
  }

  // Check if already initialized with same userId - skip re-configuration
  if (deps.isInitialized()) {
    const currentUserId = deps.getCurrentUserId();
    if (currentUserId === userId) {
      addPackageBreadcrumb("subscription", "Already initialized, fetching current state", {
        userId,
      });

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
        trackPackageError(
          error instanceof Error ? error : new Error(String(error)),
          {
            packageName: "subscription",
            operation: "get_current_state",
            userId,
          }
        );

        if (__DEV__) {
          console.log("[RevenueCat] Failed to get current state:", error);
        }
        return { success: false, offering: null, hasPremium: false };
      }
    } else {
      addPackageBreadcrumb("subscription", "User changed, logging out previous user", {
        previousUserId: currentUserId,
        newUserId: userId,
      });

      if (__DEV__) {
        console.log("[RevenueCat] Different userId, will re-configure");
      }
      // Different userId - need to logout first
      try {
        await Purchases.logOut();
      } catch (error) {
        trackPackageWarning("subscription", "Logout failed during user change", {
          error: error instanceof Error ? error.message : String(error),
          previousUserId: currentUserId,
          newUserId: userId,
        });
      }
    }
  }



  const key = apiKey || resolveApiKey(deps.config);
  if (!key) {
    const error = new Error("No RevenueCat API key available");
    trackPackageError(error, {
      packageName: "subscription",
      operation: "sdk_init_no_key",
      userId,
    });

    if (__DEV__) {
      console.log("[RevenueCat] No API key available");
    }
    return { success: false, offering: null, hasPremium: false };
  }

  try {
    if (deps.isUsingTestStore()) {
      addPackageBreadcrumb("subscription", "Using test store configuration", {
        userId,
      });

      if (__DEV__) {
        console.log("[RevenueCat] Using Test Store key");
      }
    }

    addPackageBreadcrumb("subscription", "Configuring SDK", { userId });

    if (__DEV__) {
      console.log("[RevenueCat] Calling Purchases.configure()...");
    }

    await Purchases.configure({ apiKey: key, appUserID: userId });
    deps.setInitialized(true);
    deps.setCurrentUserId(userId);

    addPackageBreadcrumb("subscription", "SDK configured successfully", {
      userId,
    });

    if (__DEV__) {
      console.log("[RevenueCat] SDK configured successfully");
    }

    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);

    const packagesCount = offerings.current?.availablePackages?.length ?? 0;

    addPackageBreadcrumb("subscription", "Offerings fetched", {
      userId,
      hasCurrent: !!offerings.current,
      packagesCount,
      allOfferingsCount: Object.keys(offerings.all).length,
    });

    if (__DEV__) {
      console.log("[RevenueCat] Fetched offerings:", {
        hasCurrent: !!offerings.current,
        packagesCount,
        allOfferingsCount: Object.keys(offerings.all).length,
      });
    }

    const entitlementId = deps.config.entitlementIdentifier;
    const hasPremium = !!customerInfo.entitlements.active[entitlementId];

    return { success: true, offering: offerings.current, hasPremium };
  } catch (error) {
    const errorMessage = getErrorMessage(error, "RevenueCat init failed");

    trackPackageError(
      error instanceof Error ? error : new Error(errorMessage),
      {
        packageName: "subscription",
        operation: "sdk_init",
        userId,
        errorMessage,
      }
    );

    if (__DEV__) {
      console.log("[RevenueCat] Init failed:", errorMessage);
    }
    return { success: false, offering: null, hasPremium: false };
  }
}
