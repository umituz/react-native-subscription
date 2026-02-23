import { Platform } from "react-native";
import Constants from "expo-constants";

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
