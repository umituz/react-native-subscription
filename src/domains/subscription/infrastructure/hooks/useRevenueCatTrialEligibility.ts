/**
 * useRevenueCatTrialEligibility Hook
 * Checks if user is eligible for introductory offers via RevenueCat
 * Uses Apple's native mechanism for trial eligibility
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Purchases, {
  type IntroEligibility,
  INTRO_ELIGIBILITY_STATUS,
} from "react-native-purchases";
import { getRevenueCatService } from "../../infrastructure/services/RevenueCatService";

/** Trial eligibility info for a single product */
export interface ProductTrialEligibility {
  /** Product identifier */
  productId: string;
  /** Whether eligible for introductory offer (free trial) */
  eligible: boolean;
  /** Trial duration in days (if available from product) */
  trialDurationDays?: number;
}

/** Map of product ID to eligibility */
export type TrialEligibilityMap = Record<string, ProductTrialEligibility>;

export interface UseRevenueCatTrialEligibilityResult {
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

/** Cache duration in milliseconds (5 minutes) */
const CACHE_DURATION_MS = 5 * 60 * 1000;

/** Cached eligibility result */
interface CachedEligibility {
  data: TrialEligibilityMap;
  timestamp: number;
}

let eligibilityCache: CachedEligibility | null = null;

/**
 * Hook to check trial eligibility via RevenueCat
 * Uses Apple's introductory offer eligibility system
 */
export function useRevenueCatTrialEligibility(): UseRevenueCatTrialEligibilityResult {
  const [eligibilityMap, setEligibilityMap] = useState<TrialEligibilityMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

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

    // Check cache validity
    if (
      eligibilityCache &&
      Date.now() - eligibilityCache.timestamp < CACHE_DURATION_MS
    ) {
      const allCached = productIds.every(
        (id) => eligibilityCache?.data[id] !== undefined
      );
      if (allCached && isMountedRef.current) {
        setEligibilityMap(eligibilityCache.data);
        return;
      }
    }

    const service = getRevenueCatService();
    if (!service || !service.isInitialized()) {
      return;
    }

    setIsLoading(true);

    try {
      const eligibilities: Record<string, IntroEligibility> =
        await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds);

      const newMap: TrialEligibilityMap = {};

      for (const productId of productIds) {
        const eligibility = eligibilities[productId];
        const isEligible =
          eligibility?.status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;

        newMap[productId] = {
          productId,
          eligible: isEligible,
          trialDurationDays: 7, // Default to 7 days as configured in App Store Connect
        };
      }

      // Update cache
      eligibilityCache = {
        data: { ...eligibilityCache?.data, ...newMap },
        timestamp: Date.now(),
      };

      if (isMountedRef.current) {
        setEligibilityMap((prev) => ({ ...prev, ...newMap }));
      }
    } catch (error) {
      // On error, default to eligible (better UX)
      const fallbackMap: TrialEligibilityMap = {};
      for (const productId of productIds) {
        fallbackMap[productId] = {
          productId,
          eligible: true,
          trialDurationDays: 7,
        };
      }
      if (isMountedRef.current) {
        setEligibilityMap((prev) => ({ ...prev, ...fallbackMap }));
      }
    } finally {
      if (isMountedRef.current) {
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

  const hasEligibleTrial = Object.values(eligibilityMap).some(
    (e) => e.eligible
  );

  return {
    eligibilityMap,
    isLoading,
    hasEligibleTrial,
    checkEligibility,
    getProductEligibility,
  };
}

/**
 * Clear eligibility cache (useful for testing)
 */
export function clearTrialEligibilityCache(): void {
  eligibilityCache = null;
}
