import type { InitModule } from '@umituz/react-native-design-system/init';
import { initializeSubscription } from "../domains/subscription/application/initializer/SubscriptionInitializer";
import type { SubscriptionInitConfig } from "../domains/subscription/application/SubscriptionInitializerTypes";
import { createLogger } from "../shared/utils/logger";

const logger = createLogger("SubscriptionInitModule");

export interface SubscriptionInitModuleConfig extends Omit<SubscriptionInitConfig, 'apiKey'> {
  getApiKey: () => string | undefined;
  critical?: boolean;
  dependsOn?: string[];
}

let subscriptionCleanup: (() => void) | null = null;

export function cleanupSubscriptionModule(): void {
  if (subscriptionCleanup) {
    subscriptionCleanup();
    subscriptionCleanup = null;
  }
}

export function createSubscriptionInitModule(config: SubscriptionInitModuleConfig): InitModule {
  const { getApiKey, critical = false, dependsOn = ['auth'], ...subscriptionConfig } = config;

  return {
    name: 'subscription',
    critical,
    dependsOn,
    init: async () => {
      try {
        const apiKey = getApiKey();
        if (!apiKey) {
          return true;
        }

        subscriptionCleanup = await initializeSubscription({ apiKey, ...subscriptionConfig });
        return true;
      } catch (error) {
        logger.error("Initialization failed", error);
        throw error;
      }
    },
  };
}
