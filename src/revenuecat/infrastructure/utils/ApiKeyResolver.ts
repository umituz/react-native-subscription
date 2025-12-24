/**
 * API Key Resolver
 * Resolves RevenueCat API key from configuration
 * NOTE: Main app is responsible for resolving platform-specific keys
 */

import type { RevenueCatConfig } from "@revenuecat/domain/value-objects/RevenueCatConfig";
import { isExpoGo, isProductionBuild } from "./ExpoGoDetector";

/**
 * Check if Test Store key should be used
 * CRITICAL: Never use test store in production builds
 */
export function shouldUseTestStore(config: RevenueCatConfig): boolean {
  const testKey = config.testStoreKey;

  if (!testKey) {
    return false;
  }

  if (isProductionBuild() && !isExpoGo()) {
    return false;
  }

  return isExpoGo();
}

/**
 * Get RevenueCat API key from config
 * Returns Test Store key if in Expo Go environment ONLY
 * Main app must provide resolved platform-specific apiKey in config
 */
export function resolveApiKey(config: RevenueCatConfig): string | null {
  const useTestStore = shouldUseTestStore(config);

  if (useTestStore) {
    return config.testStoreKey ?? null;
  }

  const key = config.apiKey;

  if (!key || key === "" || key.includes("YOUR_")) {
    return null;
  }

  return key;
}
