import type { PurchasesPackage } from "react-native-purchases";
import type { IRevenueCatService } from "../../../../../shared/application/ports/IRevenueCatService";

declare const __DEV__: boolean;

export async function fetchPackages(
  service: IRevenueCatService
): Promise<PurchasesPackage[]> {
  if (!service.isInitialized()) {
    throw new Error("Service not initialized. Please initialize before fetching packages.");
  }

  try {
    const offering = await service.fetchOfferings();

    if (__DEV__) {
      console.log('[PackageHandler] fetchOfferings result:', {
        hasOffering: !!offering,
        offeringId: offering?.identifier,
        packagesCount: offering?.availablePackages?.length,
      });
    }

    if (!offering) {
      if (__DEV__) {
        console.warn('[PackageHandler] No offering returned, returning empty array');
      }
      return [];
    }

    const packages = offering.availablePackages;
    if (!packages || packages.length === 0) {
      if (__DEV__) {
        console.warn('[PackageHandler] Offering has no packages, returning empty array');
      }
      return [];
    }

    if (__DEV__) {
      console.log('[PackageHandler] Returning packages:', {
        count: packages.length,
        packageIds: packages.map(p => p.product.identifier),
      });
    }

    return packages;
  } catch (error) {
    if (__DEV__) {
      console.error('[PackageHandler] Error fetching packages:', error);
    }
    throw new Error(
      `Failed to fetch subscription packages. ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
