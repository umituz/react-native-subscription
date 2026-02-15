import { detectPackageType } from "../../../../../utils/packageTypeDetector";

const PACKAGE_TIER_ORDER: Record<string, number> = {
  weekly: 1,
  monthly: 2,
  yearly: 3,
  unknown: 0,
};

export function getPackageTier(productId: string | null): number {
  if (!productId) return 0;
  const packageType = detectPackageType(productId);
  return PACKAGE_TIER_ORDER[packageType] ?? 0;
}
