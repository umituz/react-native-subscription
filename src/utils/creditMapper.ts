/**
 * Credit Mapper
 * Maps subscription package types to credit amounts
 * Based on SUBSCRIPTION_GUIDE.md pricing strategy
 */

import type { SubscriptionPackageType } from "./packageTypeDetector";

export interface CreditAllocation {
  imageCredits: number;
  textCredits: number;
}

/**
 * Standard credit allocations per package type
 * Based on profitability analysis and value ladder strategy
 *
 * Weekly:  6 images  - $2.99 (62% margin) - Trial users
 * Monthly: 25 images - $9.99 (60% margin) - Regular users
 * Yearly:  300 images - $79.99 (55% margin) - Best value (46% cheaper/image)
 */
export const CREDIT_ALLOCATIONS: Record<
  Exclude<SubscriptionPackageType, "unknown">,
  CreditAllocation
> = {
  weekly: {
    imageCredits: 6,
    textCredits: 6,
  },
  monthly: {
    imageCredits: 25,
    textCredits: 25,
  },
  yearly: {
    imageCredits: 300,
    textCredits: 300,
  },
};

/**
 * Get credit allocation for a package type
 * Returns null for unknown package types to prevent incorrect credit assignment
 */
export function getCreditAllocation(
  packageType: SubscriptionPackageType
): CreditAllocation | null {
  if (packageType === "unknown") {
    if (__DEV__) {
      console.warn(
        "[CreditMapper] Cannot allocate credits for unknown package type"
      );
    }
    return null;
  }

  const allocation = CREDIT_ALLOCATIONS[packageType];

  if (__DEV__) {
    console.log("[CreditMapper] Credit allocation for", packageType, ":", allocation);
  }

  return allocation;
}

/**
 * Get image credits for a package type
 */
export function getImageCreditsForPackage(
  packageType: SubscriptionPackageType
): number | null {
  const allocation = getCreditAllocation(packageType);
  return allocation?.imageCredits ?? null;
}

/**
 * Get text credits for a package type
 */
export function getTextCreditsForPackage(
  packageType: SubscriptionPackageType
): number | null {
  const allocation = getCreditAllocation(packageType);
  return allocation?.textCredits ?? null;
}
