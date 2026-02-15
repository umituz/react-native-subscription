import { Platform } from "react-native";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";

export function getApiKey(config: SubscriptionInitConfig): string {
  const { apiKey, apiKeyIos, apiKeyAndroid } = config;
  const key = Platform.OS === 'ios'
    ? (apiKeyIos ?? apiKey)
    : (apiKeyAndroid ?? apiKey);

  if (!key) {
    throw new Error('API key required');
  }

  return key;
}

export function validateConfig(config: SubscriptionInitConfig): void {
  if (!config.creditPackages) {
    throw new Error('creditPackages is required');
  }

  if (!config.creditPackages.identifierPattern) {
    throw new Error('creditPackages.identifierPattern is required');
  }

  if (!config.creditPackages.amounts) {
    throw new Error('creditPackages.amounts is required');
  }

  if (!config.getAnonymousUserId) {
    throw new Error('getAnonymousUserId is required');
  }
}
