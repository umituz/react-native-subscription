import type { InitModule } from '@umituz/react-native-design-system';
import { initializeSubscription, type SubscriptionInitConfig } from '../infrastructure/services/SubscriptionInitializer';

declare const __DEV__: boolean;

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
          if (__DEV__) console.log('[SubscriptionInit] No API key - skipping');
          return true;
        }

        await initializeSubscription({ apiKey, ...subscriptionConfig });
        if (__DEV__) console.log('[SubscriptionInit] Initialized');
        return true;
      } catch (error) {
        if (__DEV__) console.error('[SubscriptionInit] Error:', error);
        return true;
      }
    },
  };
}
