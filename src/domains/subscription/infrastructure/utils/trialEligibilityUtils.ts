/**
 * Trial Eligibility Utilities
 * Business logic for checking trial eligibility
 */

import Purchases, {
  type IntroEligibility,
  INTRO_ELIGIBILITY_STATUS,
} from "react-native-purchases";

/** Trial eligibility info for a single product */
export interface ProductTrialEligibility {
  productId: string;
  eligible: boolean;
  trialDurationDays?: number;
}

/** Map of product ID to eligibility */
export type TrialEligibilityMap = Record<string, ProductTrialEligibility>;

/** Default trial duration in days */
const DEFAULT_TRIAL_DURATION_DAYS = 7;

/**
 * Check trial eligibility for product IDs
 */
export async function checkTrialEligibility(
  productIds: string[]
): Promise<TrialEligibilityMap> {
  const eligibilities: Record<string, IntroEligibility> =
    await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds);

  const result: TrialEligibilityMap = {};

  for (const productId of productIds) {
    const eligibility = eligibilities[productId];
    const isEligible =
      eligibility?.status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;

    result[productId] = {
      productId,
      eligible: isEligible,
      trialDurationDays: DEFAULT_TRIAL_DURATION_DAYS,
    };
  }

  return result;
}

/**
 * Create fallback eligibility map (all eligible)
 * Used when eligibility check fails
 */
export function createFallbackEligibilityMap(
  productIds: string[]
): TrialEligibilityMap {
  const result: TrialEligibilityMap = {};

  for (const productId of productIds) {
    result[productId] = {
      productId,
      eligible: true,
      trialDurationDays: DEFAULT_TRIAL_DURATION_DAYS,
    };
  }

  return result;
}

/**
 * Check if any product has eligible trial
 */
export function hasAnyEligibleTrial(
  eligibilityMap: TrialEligibilityMap
): boolean {
  return Object.values(eligibilityMap).some((e) => e.eligible);
}
