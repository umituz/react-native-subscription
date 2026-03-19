/**
 * CORE Exports - Components
 */

// Subscription Components
export { PremiumDetailsCard } from "./domains/subscription/presentation/components/details/PremiumDetailsCard";
export type {
  PremiumDetailsTranslations,
  PremiumDetailsCardProps,
} from "./domains/subscription/presentation/components/details/PremiumDetailsCardTypes";

export { PremiumStatusBadge } from "./domains/subscription/presentation/components/details/PremiumStatusBadge";
export type { PremiumStatusBadgeProps } from "./domains/subscription/presentation/components/details/PremiumStatusBadge.types";

export { SubscriptionSection } from "./domains/subscription/presentation/components/sections/SubscriptionSection";
export type { SubscriptionSectionProps } from "./domains/subscription/presentation/components/sections/SubscriptionSection.types";

export { PaywallFeedbackScreen } from "./domains/subscription/presentation/components/feedback/PaywallFeedbackScreen";
export type { PaywallFeedbackScreenProps } from "./domains/subscription/presentation/components/feedback/PaywallFeedbackScreen.types";

// Subscription Screens
export type {
  SubscriptionDetailConfig,
  SubscriptionDetailTranslations,
  SubscriptionDisplayFlags,
  UpgradePromptConfig,
} from "./domains/subscription/presentation/screens/SubscriptionDetailScreen.types";

export { SubscriptionDetailScreen } from "./domains/subscription/presentation/screens/SubscriptionDetailScreen";
export type { SubscriptionDetailScreenProps } from "./domains/subscription/presentation/screens/SubscriptionDetailScreen.types";

// Paywall Components
export { PaywallScreen } from "./domains/paywall/components/PaywallScreen";
export type { PaywallScreenProps } from "./domains/paywall/components/PaywallScreen.types";

// Root Flow Components
export { ManagedSubscriptionFlow } from "./domains/subscription/presentation/components/ManagedSubscriptionFlow";
export type { ManagedSubscriptionFlowProps } from "./domains/subscription/presentation/components/ManagedSubscriptionFlow.types";
export { SubscriptionFlowStatus } from "./domains/subscription/presentation/useSubscriptionFlow";
export { SubscriptionFlowProvider, useSubscriptionFlowStatus } from "./domains/subscription/presentation/providers/SubscriptionFlowProvider";
