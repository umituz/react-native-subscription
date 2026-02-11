import { useEffect, useRef, useMemo } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import type { TrialEligibilityInfo } from "../components/PaywallModal.types";
import type { PaywallContainerProps } from "../components/PaywallContainer.types";

interface UseTrialEligibilityCheckParams {
  packages: PurchasesPackage[];
  isLoading: boolean;
  eligibilityMap: Record<string, { eligible: boolean; trialDurationDays?: number }>;
  checkEligibility: (productIds: string[]) => void;
  trialConfig: PaywallContainerProps["trialConfig"];
}

export const useTrialEligibilityCheck = ({
  packages,
  isLoading,
  eligibilityMap,
  checkEligibility,
  trialConfig,
}: UseTrialEligibilityCheckParams) => {
  const checkedPackagesRef = useRef<string[]>([]);

  useEffect(() => {
    if (!trialConfig?.enabled || packages.length === 0 || isLoading) return;

    const currentPackageIds = packages.map((pkg) => pkg.product.identifier);
    const sortedIds = [...currentPackageIds].sort().join(",");

    if (checkedPackagesRef.current.join(",") === sortedIds) return;

    checkedPackagesRef.current = currentPackageIds;

    const allProductIds = packages.map((pkg) => pkg.product.identifier);

    let productIdsToCheck: string[];
    if (trialConfig.eligibleProductIds?.length) {
      productIdsToCheck = allProductIds.filter((actualId) =>
        trialConfig.eligibleProductIds?.some((configId) =>
          actualId.toLowerCase().includes(configId.toLowerCase())
        )
      );
    } else {
      productIdsToCheck = allProductIds;
    }

    if (productIdsToCheck.length > 0) {
      checkEligibility(productIdsToCheck);
    }
  }, [packages, isLoading, checkEligibility, trialConfig?.enabled, trialConfig?.eligibleProductIds]);

  const trialEligibility = useMemo((): Record<string, TrialEligibilityInfo> => {
    if (!trialConfig?.enabled) return {};

    const result: Record<string, TrialEligibilityInfo> = {};
    for (const [productId, info] of Object.entries(eligibilityMap)) {
      result[productId] = {
        eligible: info.eligible,
        durationDays: trialConfig.durationDays ?? info.trialDurationDays ?? 7,
      };
    }
    return result;
  }, [eligibilityMap, trialConfig?.enabled, trialConfig?.durationDays]);

  return trialEligibility;
};
