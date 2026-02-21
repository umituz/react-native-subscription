import { Platform } from "react-native";
import Constants from "expo-constants";

export const IS_DEV_MODE = typeof __DEV__ !== "undefined" && __DEV__;

export function getAppVersion(): string {
  const version = Constants.expoConfig?.version;

  if (!version) {
    throw new Error("appVersion is required in expoConfig");
  }
  return version;
}

export function validatePlatform(): "ios" | "android" {
  const platform = Platform.OS;
  if (platform !== "ios" && platform !== "android") {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return platform;
}

export function isDev(): boolean {
  return __DEV__;
}
