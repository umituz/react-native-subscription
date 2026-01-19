/**
 * Package Filter Utility
 * Filters RevenueCat packages by type (credits vs subscription)
 */

import type { PurchasesPackage } from "react-native-purchases";

export type PackageCategory = "credits" | "subscription";

export interface PackageFilterConfig {
  creditIdentifierPattern?: RegExp;
  subscriptionIdentifierPattern?: RegExp;
}

const DEFAULT_CONFIG: PackageFilterConfig = {
  creditIdentifierPattern: /credit/i,
  subscriptionIdentifierPattern: /(monthly|yearly|annual|weekly|premium|subscription)/i,
};

export function getPackageCategory(
  pkg: PurchasesPackage,
  config: PackageFilterConfig = DEFAULT_CONFIG
): PackageCategory {
  const identifier = pkg.identifier.toLowerCase();
  const productIdentifier = pkg.product.identifier.toLowerCase();

  const isCreditPackage =
    config.creditIdentifierPattern?.test(identifier) ||
    config.creditIdentifierPattern?.test(productIdentifier);

  return isCreditPackage ? "credits" : "subscription";
}

export function filterPackagesByMode(
  packages: PurchasesPackage[],
  mode: "credits" | "subscription" | "hybrid",
  config: PackageFilterConfig = DEFAULT_CONFIG
): PurchasesPackage[] {
  if (mode === "hybrid") {
    return packages;
  }

  return packages.filter((pkg) => getPackageCategory(pkg, config) === mode);
}

export function separatePackages(
  packages: PurchasesPackage[],
  config: PackageFilterConfig = DEFAULT_CONFIG
): { creditPackages: PurchasesPackage[]; subscriptionPackages: PurchasesPackage[] } {
  const creditPackages: PurchasesPackage[] = [];
  const subscriptionPackages: PurchasesPackage[] = [];

  for (const pkg of packages) {
    if (getPackageCategory(pkg, config) === "credits") {
      creditPackages.push(pkg);
    } else {
      subscriptionPackages.push(pkg);
    }
  }

  return { creditPackages, subscriptionPackages };
}
