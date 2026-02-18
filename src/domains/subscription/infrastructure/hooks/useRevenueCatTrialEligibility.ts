/**
 * useRevenueCatTrialEligibility Hook
 * Checks if user is eligible for introductory offers via RevenueCat
 * Uses Apple's native mechanism for trial eligibility
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getRevenueCatService } from "../services/RevenueCatService";
import {
  checkTrialEligibility,
  createFallbackEligibilityMap,
  hasAnyEligibleTrial,
  type ProductTrialEligibility,
  type TrialEligibilityMap,
} from "../utils/trialEligibilityUtils";


interface UseRevenueCatTrialEligibilityResult {
  /** Map of product IDs to their trial eligibility */
  eligibilityMap: TrialEligibilityMap;
  /** Whether eligibility check is in progress */
  isLoading: boolean;
  /** Whether any product has an eligible trial */
  hasEligibleTrial: boolean;
  /** Check eligibility for specific product IDs */
  checkEligibility: (productIds: string[]) => Promise<void>;
  /** Get eligibility for a specific product */
  getProductEligibility: (productId: string) => ProductTrialEligibility | null;
}

/**
 * Hook to check trial eligibility via RevenueCat
 * Uses Apple's introductory offer eligibility system
 */
export function useRevenueCatTrialEligibility(): UseRevenueCatTrialEligibilityResult {
  const [eligibilityMap, setEligibilityMap] = useState<TrialEligibilityMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);
  const currentRequestRef = useRef<number | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const checkEligibility = useCallback(async (productIds: string[]) => {
    if (productIds.length === 0) {
      return;
    }

    const service = getRevenueCatService();
    if (!service || !service.isInitialized()) {
      return;
    }

    const requestId = Date.now();
    currentRequestRef.current = requestId;
    setIsLoading(true);

    try {
      const newMap = await checkTrialEligibility(productIds);

      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setEligibilityMap((prev) => ({ ...prev, ...newMap }));
      }
    } catch {
      const fallbackMap = createFallbackEligibilityMap(productIds);

      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setEligibilityMap((prev) => ({ ...prev, ...fallbackMap }));
      }
    } finally {
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  const getProductEligibility = useCallback(
    (productId: string): ProductTrialEligibility | null => {
      return eligibilityMap[productId] ?? null;
    },
    [eligibilityMap]
  );

  const hasEligibleTrial = hasAnyEligibleTrial(eligibilityMap);

  return {
    eligibilityMap,
    isLoading,
    hasEligibleTrial,
    checkEligibility,
    getProductEligibility,
  };
}

