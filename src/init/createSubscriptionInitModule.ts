/**
 * Subscription Init Module Factory
 * Creates a ready-to-use InitModule for app initialization
 */

import type { InitModule } from '@umituz/react-native-design-system';
import { initializeSubscription, type SubscriptionInitConfig } from '../infrastructure/services/SubscriptionInitializer';

declare const __DEV__: boolean;

export interface SubscriptionInitModuleConfig extends Omit<SubscriptionInitConfig, 'apiKey'> {
  /**
   * RevenueCat API key getter function
   * Returns the API key or undefined if not available
   */
  getApiKey: () => string | undefined;

  /**
   * Optional RevenueCat test store key getter
   */
  getTestStoreKey?: () => string | undefined;

  /**
   * Whether this module is critical for app startup
   * @default true
   */
  critical?: boolean;

  /**
   * Module dependencies
   * @default ["auth"]
   */
  dependsOn?: string[];
}

/**
 * Creates a Subscription initialization module for use with createAppInitializer
 *
 * @example
 * ```typescript
 * import { createAppInitializer } from "@umituz/react-native-design-system";
 * import { createFirebaseInitModule } from "@umituz/react-native-firebase";
 * import { createAuthInitModule } from "@umituz/react-native-auth";
 * import { createSubscriptionInitModule } from "@umituz/react-native-subscription";
 *
 * export const initializeApp = createAppInitializer({
 *   modules: [
 *     createFirebaseInitModule(),
 *     createAuthInitModule({ userCollection: "users" }),
 *     createSubscriptionInitModule({
 *       getApiKey: () => getRevenueCatApiKey(),
 *       entitlementId: "premium",
 *       credits: {
 *         collectionName: "credits",
 *         creditLimit: 500,
 *         enableFreeCredits: true,
 *         freeCredits: 1,
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export function createSubscriptionInitModule(
  config: SubscriptionInitModuleConfig
): InitModule {
  const {
    getApiKey,
    getTestStoreKey,
    critical = true,
    dependsOn = ['auth'],
    ...subscriptionConfig
  } = config;

  return {
    name: 'subscription',
    critical,
    dependsOn,
    init: async () => {
      try {
        const apiKey = getApiKey();

        if (!apiKey) {
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.log('[createSubscriptionInitModule] No API key - skipping');
          }
          return true; // Not an error, just skip
        }

        const testStoreKey = getTestStoreKey?.();

        await initializeSubscription({
          apiKey,
          testStoreKey,
          ...subscriptionConfig,
        });

        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('[createSubscriptionInitModule] Subscription initialized');
        }

        return true;
      } catch (error) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.error('[createSubscriptionInitModule] Error:', error);
        }
        // Continue on error - subscription is not critical for app launch
        return true;
      }
    },
  };
}
