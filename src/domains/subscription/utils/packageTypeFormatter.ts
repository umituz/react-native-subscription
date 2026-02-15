import type { PackageType } from "../../revenuecat/core/types";

export function formatPackageTypeForDisplay(packageType: PackageType | string | null | undefined): string {
  if (!packageType) {
    return "";
  }

  const formatted = packageType.toLowerCase().replace(/_/g, " ");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
