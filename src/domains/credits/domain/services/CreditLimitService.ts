import type { CreditsConfig } from "../../core/Credits";
import { detectPackageType } from "../../../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../../../utils/creditMapper";

/**
 * Domain service for credit limit calculations.
 *
 * This service contains business logic for determining credit limits
 * based on product configuration. It's part of the domain layer and can be
 * used by infrastructure, application, or presentation layers.
 */
export class CreditLimitService {
  constructor(private config: CreditsConfig) {}

  /**
   * Calculate credit limit for a specific product ID.
   *
   * Strategy:
   * 1. Check for explicit amount override in config
   * 2. Calculate from package type allocations
   * 3. Throw if cannot determine limit
   *
   * @param productId - The product identifier
   * @returns The credit limit for this product
   * @throws Error if productId is missing or limit cannot be determined
   */
  calculate(productId: string | undefined): number {
    if (!productId) {
      throw new Error(
        "[CreditLimitService] Cannot calculate credit limit without productId"
      );
    }

    // Check for explicit amount override
    const explicitAmount = this.config.creditPackageAmounts?.[productId];
    if (
      explicitAmount !== undefined &&
      explicitAmount !== null &&
      typeof explicitAmount === "number"
    ) {
      return explicitAmount;
    }

    // Calculate from package type allocations
    const packageType = detectPackageType(productId);
    const dynamicLimit = getCreditAllocation(packageType, this.config.packageAllocations);

    if (dynamicLimit === null || dynamicLimit === undefined) {
      throw new Error(
        `[CreditLimitService] Cannot determine credit limit for productId: ${productId}, packageType: ${packageType}`
      );
    }

    return dynamicLimit;
  }

  /**
   * Create a factory function for this service with the given config.
   * This makes dependency injection easier.
   */
  static createFactory(config: CreditsConfig) {
    return () => new CreditLimitService(config);
  }
}

/**
 * Convenience function to calculate credit limit without instantiating service.
 * Useful for one-off calculations.
 */
export function calculateCreditLimit(
  productId: string | undefined,
  config: CreditsConfig
): number {
  const service = new CreditLimitService(config);
  return service.calculate(productId);
}
