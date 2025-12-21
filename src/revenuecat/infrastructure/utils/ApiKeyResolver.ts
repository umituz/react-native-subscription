/**
 * API Key Resolver
 * Resolves RevenueCat API key from configuration
 */

import { Platform } from "react-native";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { isExpoGo, isProductionBuild } from "./ExpoGoDetector";

/**
 * Check if Test Store key should be used
 * CRITICAL: Never use test store in production builds
 */
export function shouldUseTestStore(config: RevenueCatConfig): boolean {
  const testKey = config.testStoreKey;

  // No test key configured - always use production keys
  if (!testKey) {
    return false;
  }

  // CRITICAL: Production builds should NEVER use test store
  if (isProductionBuild() && !isExpoGo()) {
    if (__DEV__) {
      console.log("[RevenueCat] Production build detected - using production API keys");
    }
    return false;
  }

  // Only use test store in Expo Go
  return isExpoGo();
}

/**
 * Get RevenueCat API key from config
 * Returns Test Store key if in Expo Go environment ONLY
 */
export function resolveApiKey(config: RevenueCatConfig): string | null {
  const useTestStore = shouldUseTestStore(config);

  // Always log in development, log warnings in production for debugging
  /* eslint-disable-next-line no-console */
  console.log("[RevenueCat] resolveApiKey:", {
    platform: Platform.OS,
    useTestStore,
    hasTestKey: !!config.testStoreKey,
    hasIosKey: !!config.iosApiKey,
    hasAndroidKey: !!config.androidApiKey,
    isProduction: isProductionBuild(),
  });

  if (useTestStore) {
    return config.testStoreKey ?? null;
  }

  const key = Platform.OS === 'ios'
    ? config.iosApiKey
    : Platform.OS === 'android'
      ? config.androidApiKey
      : config.iosApiKey;

  if (!key || key === "" || key.includes("YOUR_")) {
    /* eslint-disable-next-line no-console */
    console.warn("[RevenueCat] ⚠️ NO API KEY - packages will not load. Check env vars.");
    return null;
  }

  return key;
}
