/**
 * CORE Exports - Hooks
 */

// Subscription Hooks
export { useAuthAwarePurchase } from "./domains/subscription/presentation/useAuthAwarePurchase";
export { useFeatureGate } from "./domains/subscription/presentation/useFeatureGate";
export { usePaywallVisibility, paywallControl } from "./domains/subscription/presentation/usePaywallVisibility";
export { usePremiumStatus } from "./domains/subscription/presentation/usePremiumStatus";
export { usePremiumPackages } from "./domains/subscription/presentation/usePremiumPackages";
export { usePremiumActions } from "./domains/subscription/presentation/usePremiumActions";
export { useSubscriptionFlowStore } from "./domains/subscription/presentation/useSubscriptionFlow";
export { useSubscriptionStatus } from "./domains/subscription/presentation/useSubscriptionStatus";

// Hook Types
export type { PremiumStatus } from "./domains/subscription/presentation/usePremiumStatus";
export type { PremiumPackages } from "./domains/subscription/presentation/usePremiumPackages";
export type { PremiumActions } from "./domains/subscription/presentation/usePremiumActions";
export type { SubscriptionFlowState, SubscriptionFlowActions, SubscriptionFlowStore } from "./domains/subscription/presentation/useSubscriptionFlow";
export type { SubscriptionStatusResult } from "./domains/subscription/presentation/useSubscriptionStatus.types";

// Credits Hooks
export { useCredits } from "./domains/credits/presentation/useCredits";
export { useDeductCredit } from "./domains/credits/presentation/deduct-credit/useDeductCredit";

// Feedback Hooks
export { usePaywallFeedback } from "./presentation/hooks/feedback/usePaywallFeedback";
export {
  usePaywallFeedbackSubmit,
  useSettingsFeedbackSubmit,
} from "./presentation/hooks/feedback/useFeedbackSubmit";

export type {
  UsePaywallFeedbackSubmitOptions,
  SettingsFeedbackData,
  UseSettingsFeedbackSubmitOptions,
} from "./presentation/hooks/feedback/useFeedbackSubmit";

// Paywall Hooks
export { usePaywallOrchestrator } from "./domains/paywall/hooks/usePaywallOrchestrator";
export type { PaywallOrchestratorOptions } from "./domains/paywall/hooks/usePaywallOrchestrator";
