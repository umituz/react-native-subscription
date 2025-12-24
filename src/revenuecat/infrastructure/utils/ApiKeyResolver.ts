/**
 * API Key Resolver
 * Resolves RevenueCat API key from configuration
 * NOTE: Main app is responsible for resolving platform-specific keys
 */

import type { RevenueCatConfig } from "../domain/value-objects/RevenueCatConfig";
import { isTestStoreEnvironment } from "./ExpoGoDetector";

/**
 * Check if Test Store key should be used
 * CRITICAL: Never use test store in production builds
 * Uses Test Store in development environments (Expo Go, dev builds, simulators)
 */
export function shouldUseTestStore(config: RevenueCatConfig): boolean {
  const testKey = config.testStoreKey;

  if (!testKey) {
    return false;
  }

  return isTestStoreEnvironment();
}

/**
 * Get RevenueCat API key from config
 * Returns Test Store key in development environments (Expo Go, dev builds, simulators)
 * Returns production API key in production builds
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
