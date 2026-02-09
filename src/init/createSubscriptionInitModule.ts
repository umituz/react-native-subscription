import type { InitModule } from '@umituz/react-native-design-system';
import { initializeSubscription, type SubscriptionInitConfig } from '../domains/subscription/application/SubscriptionInitializer';

export interface SubscriptionInitModuleConfig extends Omit<SubscriptionInitConfig, 'apiKey'> {
  getApiKey: () => string | undefined;
  critical?: boolean;
  dependsOn?: string[];
}

export function createSubscriptionInitModule(config: SubscriptionInitModuleConfig): InitModule {
  const { getApiKey, critical = true, dependsOn = ['auth'], ...subscriptionConfig } = config;

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

        await initializeSubscription({ apiKey, ...subscriptionConfig });
        return true;
      } catch {
        return false;
      }
    },
  };
}
