import type { CreditsConfig } from "../../domain/entities/Credits";
import { detectPackageType } from "../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../utils/creditMapper";

export class CreditLimitCalculator {
  static calculate(productId: string | undefined, config: CreditsConfig): number {
    if (!productId) return config.creditLimit;

    const explicitAmount = config.creditPackageAmounts?.[productId];
    if (explicitAmount) return explicitAmount;

    const packageType = detectPackageType(productId);
    const dynamicLimit = getCreditAllocation(packageType, config.packageAllocations);
    
    return dynamicLimit ?? config.creditLimit;
  }
}
