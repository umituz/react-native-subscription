/**
 * Package Filter Utility
 * Filters RevenueCat packages by type (credits vs subscription)
 */

import type { PurchasesPackage } from "react-native-purchases";

declare const __DEV__: boolean;

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

  if (isCreditPackage) {
    if (__DEV__) {
      console.log("[PackageFilter] Credit package:", identifier);
    }
    return "credits";
  }

  if (__DEV__) {
    console.log("[PackageFilter] Subscription package:", identifier);
  }
  return "subscription";
}

export function filterPackagesByMode(
  packages: PurchasesPackage[],
  mode: "credits" | "subscription" | "hybrid",
  config: PackageFilterConfig = DEFAULT_CONFIG
): PurchasesPackage[] {
  if (mode === "hybrid") {
    if (__DEV__) {
      console.log("[PackageFilter] Hybrid mode - returning all packages:", packages.length);
    }
    return packages;
  }

  const filtered = packages.filter((pkg) => {
    const category = getPackageCategory(pkg, config);
    return category === mode;
  });

  if (__DEV__) {
    console.log(`[PackageFilter] Mode: ${mode}, Filtered: ${filtered.length}/${packages.length}`);
  }

  return filtered;
}

export function separatePackages(
  packages: PurchasesPackage[],
  config: PackageFilterConfig = DEFAULT_CONFIG
): { creditPackages: PurchasesPackage[]; subscriptionPackages: PurchasesPackage[] } {
  const creditPackages: PurchasesPackage[] = [];
  const subscriptionPackages: PurchasesPackage[] = [];

  for (const pkg of packages) {
    const category = getPackageCategory(pkg, config);
    if (category === "credits") {
      creditPackages.push(pkg);
    } else {
      subscriptionPackages.push(pkg);
    }
  }

  if (__DEV__) {
    console.log("[PackageFilter] Separated:", {
      credits: creditPackages.length,
      subscriptions: subscriptionPackages.length,
    });
  }

  return { creditPackages, subscriptionPackages };
}
