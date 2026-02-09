/**
 * App and Platform Utilities
 */
import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Gets the current app version from Expo constants
 */
export function getAppVersion(): string {
  const version = Constants.expoConfig?.version ?? Constants.manifest2?.extra?.expoClient?.version;
  if (!version) {
    throw new Error("appVersion is required in expoConfig");
  }
  return version;
}

/**
 * Validates if the current platform is supported
 */
export function validatePlatform(): "ios" | "android" {
  const platform = Platform.OS;
  if (platform !== "ios" && platform !== "android") {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return platform;
}

/**
 * Checks if the app is currently in development mode
 */
export function isDev(): boolean {
  return __DEV__;
}
