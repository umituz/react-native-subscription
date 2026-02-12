import type { CreditsConfig } from "../core/Credits";
import { detectPackageType } from "../../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../../utils/creditMapper";

export function calculateCreditLimit(productId: string | undefined, config: CreditsConfig): number {
  if (!productId) {
    throw new Error("[CreditLimitCalculator] Cannot calculate credit limit without productId");
  }

  const explicitAmount = config.creditPackageAmounts?.[productId];
  if (explicitAmount) return explicitAmount;

  const packageType = detectPackageType(productId);
  const dynamicLimit = getCreditAllocation(packageType, config.packageAllocations);

  if (!dynamicLimit) {
    throw new Error(`[CreditLimitCalculator] Cannot determine credit limit for productId: ${productId}, packageType: ${packageType}`);
  }

  return dynamicLimit;
}


