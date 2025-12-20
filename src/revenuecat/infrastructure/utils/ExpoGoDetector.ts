/**
 * Expo Go Detector
 * Detects runtime environment for RevenueCat configuration
 */

import Constants from "expo-constants";

/**
 * Check if running in Expo Go
 */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === "storeClient";
}

/**
 * Check if running in development mode
 * Uses multiple checks to ensure reliability in production builds
 */
export function isDevelopment(): boolean {
  // Check execution environment first - most reliable
  const executionEnv = Constants.executionEnvironment;
  const isBareBuild = executionEnv === "bare";
  const isStoreBuild = executionEnv === "standalone";

  // If it's a store/standalone build, it's NOT development
  if (isStoreBuild) {
    return false;
  }

  // For bare builds in production, check appOwnership
  if (isBareBuild && Constants.appOwnership !== "expo") {
    // This is a production bare build
    return false;
  }

  // Fallback to __DEV__ only for actual development cases
  return typeof __DEV__ !== "undefined" && __DEV__;
}

/**
 * Check if this is a production store build
 */
export function isProductionBuild(): boolean {
  const executionEnv = Constants.executionEnvironment;
  return executionEnv === "standalone" || executionEnv === "bare";
}

/**
 * Check if Test Store should be used (Expo Go or development)
 * NEVER use Test Store in production builds
 */
export function isTestStoreEnvironment(): boolean {
  // Explicit check: never use test store in production
  if (isProductionBuild() && !isExpoGo()) {
    return false;
  }
  return isExpoGo() || isDevelopment();
}
