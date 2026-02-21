import { detectPackageType, type SubscriptionPackageType } from "./packageTypeDetector";
import type { PackageAllocationMap } from "../domains/credits/core/Credits";

export function getCreditAllocation(
  packageType: SubscriptionPackageType,
  allocations?: PackageAllocationMap
): number | null {
  if (packageType === "unknown" || !allocations) return null;
  return allocations[packageType]?.credits ?? null;
}

export function createCreditAmountsFromPackages(
  packages: Array<{ product: { identifier: string } }>,
  allocations?: PackageAllocationMap
): Record<string, number> {
  const result: Record<string, number> = {};

  if (!allocations) return result;

  for (const pkg of packages) {
    const identifier = pkg?.product?.identifier;

    if (!identifier) continue;

    const packageType = detectPackageType(identifier);
    const credits = getCreditAllocation(packageType, allocations);

    if (credits !== null) {
      result[identifier] = credits;
    }
  }

  return result;
}
