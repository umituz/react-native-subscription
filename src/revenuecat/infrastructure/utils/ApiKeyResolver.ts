/**
 * API Key Resolver
 * Resolves RevenueCat API key from configuration
 * NOTE: Main app is responsible for resolving platform-specific keys
 */

import type { RevenueCatConfig } from '../../domain/value-objects/RevenueCatConfig';
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

  if (__DEV__) {
    console.log('[DEBUG ApiKeyResolver] resolveApiKey called', {
      useTestStore,
      hasTestStoreKey: !!config.testStoreKey,
      hasApiKey: !!config.apiKey,
      testStoreKeyPrefix: config.testStoreKey ? config.testStoreKey.substring(0, 10) + '...' : 'null',
      apiKeyPrefix: config.apiKey ? config.apiKey.substring(0, 10) + '...' : 'null',
    });
  }

  if (useTestStore) {
    if (__DEV__) {
      console.log('[DEBUG ApiKeyResolver] Using Test Store key');
    }
    return config.testStoreKey ?? null;
  }

  const key = config.apiKey;

  if (!key || key === "" || key.includes("YOUR_")) {
    if (__DEV__) {
      console.log('[DEBUG ApiKeyResolver] No valid production API key');
    }
    return null;
  }

  if (__DEV__) {
    console.log('[DEBUG ApiKeyResolver] Using production API key');
  }

  return key;
}
