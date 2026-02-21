import Purchases, {
  type IntroEligibility,
  INTRO_ELIGIBILITY_STATUS,
} from "react-native-purchases";

export interface ProductTrialEligibility {
  productId: string;
  eligible: boolean;
  trialDurationDays?: number;
}

export type TrialEligibilityMap = Record<string, ProductTrialEligibility>;

const DEFAULT_TRIAL_DURATION_DAYS = 7;

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

export function hasAnyEligibleTrial(
  eligibilityMap: TrialEligibilityMap
): boolean {
  return Object.values(eligibilityMap).some((e) => e.eligible);
}
