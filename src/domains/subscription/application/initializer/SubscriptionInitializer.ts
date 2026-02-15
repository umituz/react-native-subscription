import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";
import { getApiKey, validateConfig } from "./ConfigValidator";
import { configureServices } from "./ServiceConfigurator";
import { startBackgroundInitialization } from "./BackgroundInitializer";

export const initializeSubscription = async (config: SubscriptionInitConfig): Promise<void> => {
  const apiKey = getApiKey(config);
  validateConfig(config);
  configureServices(config, apiKey);
  await startBackgroundInitialization(config);
};
