/**
 * Subscription Init Module
 * Provides factory for creating app initialization modules
 */

export {
  createSubscriptionInitModule,
  type SubscriptionInitModuleConfig,
} from './createSubscriptionInitModule';

// Re-export InitModule from design-system for convenience
export type { InitModule } from '@umituz/react-native-design-system';
