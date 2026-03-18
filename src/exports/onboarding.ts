/**
 * ONBOARDING Helpers (Optional)
 *
 * Advanced onboarding utilities for custom flows
 *
 * @example
 * import { OnboardingProgress, useOnboardingAnalytics } from '@umituz/react-native-subscription/exports/onboarding';
 */

// Onboarding Progress Tracking
export { useOnboardingProgress } from '../../domains/subscription/presentation/hooks/useOnboardingProgress';
export type { OnboardingProgressData } from '../../domains/subscription/presentation/hooks/useOnboardingProgress.types';

// Onboarding Analytics
export { useOnboardingAnalytics } from '../../presentation/hooks/onboarding/useOnboardingAnalytics';
export type {
  OnboardingEvent,
  OnboardingAnalyticsData,
} from '../../presentation/hooks/onboarding/useOnboardingAnalytics.types';

// Onboarding Completion Helpers
export { useOnboardingCompletion } from '../../presentation/hooks/onboarding/useOnboardingCompletion';
export type {
  OnboardingCompletionData,
  OnboardingCompletionOptions,
} from '../../presentation/hooks/onboarding/useOnboardingCompletion.types';

// Onboarding Utils
export {
  calculateOnboardingProgress,
  isOnboardingComplete,
  getOnboardingStep,
} from '../../utils/onboardingUtils';
export type { OnboardingStep } from '../../utils/onboardingUtils.types';
