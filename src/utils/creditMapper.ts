/**
 * Credit Mapper
 * Maps subscription package types to credit amounts
 * Based on SUBSCRIPTION_GUIDE.md pricing strategy
 */

import { detectPackageType, type SubscriptionPackageType } from "./packageTypeDetector";

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
  if (packageType === "unknown") return null;
  return CREDIT_ALLOCATIONS[packageType];
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

/**
 * Create credit amounts mapping for PaywallModal from RevenueCat packages
 * Maps product.identifier to credit amount
 *
 * @example
 * ```typescript
 * const creditAmounts = createCreditAmountsFromPackages(packages);
 * // { "futureus_weekly_2_99": 6, "futureus_monthly_9_99": 25, "futureus_yearly_79_99": 300 }
 * ```
 */
export function createCreditAmountsFromPackages(
  packages: Array<{ product: { identifier: string } }>
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const pkg of packages) {
    const identifier = pkg?.product?.identifier;

    if (!identifier) continue;

    const packageType = detectPackageType(identifier);
    const credits = getImageCreditsForPackage(packageType);

    if (credits !== null) {
      result[identifier] = credits;
    }
  }

  return result;
}
