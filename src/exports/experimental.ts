/**
 * EXPERIMENTAL Features (Beta)
 *
 * Cutting-edge features that may change or be removed
 * Use at your own risk!
 *
 * @example
 * import { AIUpsell, SmartPaywall } from '@umituz/react-native-subscription/exports/experimental';
 */

// ============================================================================
// AI-POWERED FEATURES
// ============================================================================

// AI-Powered Upsell Recommendations
export { useAIUpsellRecommendations } from '../../domains/paywall/experimental/useAIUpsellRecommendations';
export type {
  AIUpsellData,
  UpsellRecommendation,
  UpsellStrategy,
} from '../../domains/paywall/experimental/useAIUpsellRecommendations.types';

// Smart Paywall (Dynamic pricing based on user behavior)
export { SmartPaywall } from '../../domains/paywall/experimental/SmartPaywall';
export type {
  SmartPaywallProps,
  SmartPaywallConfig,
} from '../../domains/paywall/experimental/SmartPaywall.types';

// ============================================================================
// EXPERIMENTAL COMPONENTS
// ============================================================================

// Interactive Pricing Tiers
export { InteractivePricingTiers } from '../../domains/paywall/experimental/InteractivePricingTiers';
export type {
  InteractivePricingTiersProps,
  PricingTierConfig,
} from '../../domains/paywall/experimental/InteractivePricingTiers.types';

// Gamified Paywall (Rewards for engagement)
export { GamifiedPaywall } from '../../domains/paywall/experimental/GamifiedPaywall';
export type {
  GamifiedPaywallProps,
  GamificationConfig,
  RewardConfig,
} from '../../domains/paywall/experimental/GamifiedPaywall.types';

// ============================================================================
// EXPERIMENTAL HOOKS
// ============================================================================

// Predictive Churn Prevention
export { usePredictiveChurnPrevention } from '../../domains/subscription/presentation/experimental/usePredictiveChurnPrevention';
export type {
  ChurnPredictionData,
  ChurnPreventionAction,
  InterventionStrategy,
} from '../../domains/subscription/presentation/experimental/usePredictiveChurnPrevention.types';

// Dynamic Offer Generator
export { useDynamicOfferGenerator } from '../../domains/paywall/experimental/useDynamicOfferGenerator';
export type {
  DynamicOfferData,
  OfferConfig,
  OfferStrategy,
} from '../../domains/paywall/experimental/useDynamicOfferGenerator.types';

// ============================================================================
// EXPERIMENTAL UTILS
// ============================================================================

// Behavioral Segmentation
export {
  segmentUsersByBehavior,
  getUserBehaviorScore,
} from '../../utils/experimental/behavioralSegmentation';
export type {
  UserBehavior,
  BehaviorSegment,
  BehaviorScore,
} from '../../utils/experimental/behavioralSegmentation.types';

// Price Optimization
export {
  optimizePriceForUser,
  getOptimalPricePoint,
} from '../../utils/experimental/priceOptimization';
export type {
  PriceOptimizationData,
  PricePoint,
  OptimizationStrategy,
} from '../../utils/experimental/priceOptimization.types';
