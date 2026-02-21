import type { InitModule } from '@umituz/react-native-design-system';
import { initializeSubscription, type SubscriptionInitConfig } from '../domains/subscription/application/initializer';

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
        console.error('[SubscriptionInitModule] Initialization failed:', error instanceof Error ? error.message : String(error));
        return false;
      }
    },
  };
}
