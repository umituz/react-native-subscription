import type { CreditsConfig } from "../core/Credits";
import { detectPackageType } from "../../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../../utils/creditMapper";
import { NO_SUBSCRIPTION_PRODUCT_ID } from "../../subscription/application/syncConstants";

export function calculateCreditLimit(productId: string | undefined, config: CreditsConfig): number {
  if (!productId) {
    throw new Error("[CreditLimitCalculator] Cannot calculate credit limit without productId");
  }

  // Free tier users (no subscription) get 0 credits - strict paywall
  if (productId === NO_SUBSCRIPTION_PRODUCT_ID) {
    return 0;
  }

  const explicitAmount = config.creditPackageAmounts?.[productId];
  if (explicitAmount) return explicitAmount;

  const packageType = detectPackageType(productId);
  const dynamicLimit = getCreditAllocation(packageType, config.packageAllocations);

  if (dynamicLimit === null || dynamicLimit === undefined) {
    throw new Error(`[CreditLimitCalculator] Cannot determine credit limit for productId: ${productId}, packageType: ${packageType}`);
  }

  return dynamicLimit;
}


