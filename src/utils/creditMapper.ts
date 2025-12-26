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

  if (__DEV__) {
    console.log("[CreditMapper] Input packages count:", packages?.length || 0);
  }

  if (!packages || packages.length === 0) {
    if (__DEV__) {
      console.log("[CreditMapper] No packages provided, returning empty object");
    }
    return result;
  }

  for (const pkg of packages) {
    const identifier = pkg?.product?.identifier;

    if (__DEV__) {
      console.log("[CreditMapper] Processing package:", {
        hasProduct: !!pkg?.product,
        identifier,
      });
    }

    if (!identifier) {
      if (__DEV__) {
        console.warn("[CreditMapper] Package missing product.identifier:", pkg);
      }
      continue;
    }

    const packageType = detectPackageType(identifier);
    const credits = getImageCreditsForPackage(packageType);

    if (__DEV__) {
      console.log("[CreditMapper] Package mapping:", {
        identifier,
        packageType,
        credits,
      });
    }

    if (credits !== null) {
      result[identifier] = credits;
    }
  }

  if (__DEV__) {
    console.log("[CreditMapper] Final credit amounts:", result);
  }

  return result;
}
