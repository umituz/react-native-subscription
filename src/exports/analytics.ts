/**
 * SUBSCRIPTION ANALYTICS (Optional)
 *
 * Advanced analytics for subscription events and user behavior
 *
 * @example
 * import { SubscriptionAnalytics, useSubscriptionMetrics } from '@umituz/react-native-subscription/exports/analytics';
 */

// Subscription Analytics Hook
export { useSubscriptionAnalytics } from '../../presentation/hooks/analytics/useSubscriptionAnalytics';
export type {
  SubscriptionAnalyticsData,
  SubscriptionMetrics,
  ConversionFunnelData,
} from '../../presentation/hooks/analytics/useSubscriptionAnalytics.types';

// Paywall Analytics
export { usePaywallAnalytics } from '../../domains/paywall/hooks/usePaywallAnalytics';
export type {
  PaywallAnalyticsData,
  PaywallImpressionData,
  PaywallConversionData,
} from '../../domains/paywall/hooks/usePaywallAnalytics.types';

// Revenue Analytics
export { useRevenueAnalytics } from '../../domains/subscription/presentation/hooks/useRevenueAnalytics';
export type {
  RevenueAnalyticsData,
  RevenueMetrics,
  ARPUData,
  LTVData,
} from '../../domains/subscription/presentation/hooks/useRevenueAnalytics.types';

// Churn Analytics
export { useChurnAnalytics } from '../../domains/subscription/presentation/hooks/useChurnAnalytics';
export type {
  ChurnAnalyticsData,
  ChurnRiskData,
  RetentionData,
} from '../../domains/subscription/presentation/hooks/useChurnAnalytics.types';

// Analytics Helpers
export {
  trackSubscriptionEvent,
  trackPaywallEvent,
  trackRevenueEvent,
} from '../../utils/analyticsHelpers';
export type {
  SubscriptionEventType,
  PaywallEventType,
  RevenueEventType,
} from '../../utils/analyticsHelpers.types';
