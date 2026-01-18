/**
 * useCredits Hook
 *
 * Fetches user credits - NO CACHE, always fresh data.
 * Auth info automatically read from @umituz/react-native-auth.
 * Auto-initializes free credits for registered users only.
 */

import { useQuery } from "@umituz/react-native-design-system";
import { useCallback, useMemo, useEffect, useState } from "react";
import {
  useAuthStore,
  selectUserId,
  selectIsAnonymous,
} from "@umituz/react-native-auth";
import type { UserCredits } from "../../domain/entities/Credits";
import {
  getCreditsRepository,
  getCreditsConfig,
  isCreditsRepositoryConfigured,
} from "../../infrastructure/repositories/CreditsRepositoryProvider";

declare const __DEV__: boolean;

export const creditsQueryKeys = {
  all: ["credits"] as const,
  user: (userId: string) => ["credits", userId] as const,
};

const freeCreditsInitAttempted = new Set<string>();

export interface UseCreditsResult {
  credits: UserCredits | null;
  isLoading: boolean;
  isCreditsLoaded: boolean;
  error: Error | null;
  hasCredits: boolean;
  creditsPercent: number;
  refetch: () => void;
  canAfford: (cost: number) => boolean;
}

export const useCredits = (): UseCreditsResult => {
  const userId = useAuthStore(selectUserId);
  const isAnonymous = useAuthStore(selectIsAnonymous);
  const isRegisteredUser = !!userId && !isAnonymous;
  const [isInitializingFreeCredits, setIsInitializingFreeCredits] = useState(false);

  const isConfigured = isCreditsRepositoryConfigured();
  const config = getCreditsConfig();

  const queryEnabled = !!userId && isConfigured;

  const { data, isLoading, error, refetch, isFetched } = useQuery({
    queryKey: creditsQueryKeys.user(userId ?? ""),
    queryFn: async () => {
      if (!userId || !isConfigured) {
        return null;
      }
      const repository = getCreditsRepository();
      const result = await repository.getCredits(userId);
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch credits");
      }

      if (result.data?.status === "expired") {
        repository.syncExpiredStatus(userId).catch((syncError) => {
          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.warn("[useCredits] Background sync failed:", syncError);
          }
        });
      }

      return result.data || null;
    },
    enabled: queryEnabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const credits = data ?? null;

  const freeCredits = config.freeCredits ?? 0;
  const autoInit = config.autoInitializeFreeCredits !== false && freeCredits > 0;

  useEffect(() => {
    if (
      isFetched &&
      userId &&
      isRegisteredUser &&
      isConfigured &&
      !credits &&
      autoInit &&
      !freeCreditsInitAttempted.has(userId)
    ) {
      freeCreditsInitAttempted.add(userId);
      setIsInitializingFreeCredits(true);

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useCredits] Initializing free credits for registered user:", userId.slice(0, 8));
      }

      const repository = getCreditsRepository();
      repository.initializeFreeCredits(userId).then((result) => {
        setIsInitializingFreeCredits(false);
        if (result.success) {
          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.log("[useCredits] Free credits initialized:", result.data?.credits);
          }
          refetch();
        } else {
          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.warn("[useCredits] Free credits init failed:", result.error?.message);
          }
        }
      });
    } else if (isFetched && userId && isAnonymous && !credits && autoInit) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useCredits] Skipping free credits - anonymous user must register first");
      }
    }
  }, [isFetched, userId, isRegisteredUser, isAnonymous, isConfigured, credits, autoInit, refetch]);

  const derivedValues = useMemo(() => {
    const has = (credits?.credits ?? 0) > 0;
    const percent = credits
      ? Math.round((credits.credits / config.creditLimit) * 100)
      : 0;

    return { hasCredits: has, creditsPercent: percent };
  }, [credits, config.creditLimit]);

  const canAfford = useCallback(
    (cost: number): boolean => {
      if (!credits) return false;
      return credits.credits >= cost;
    },
    [credits]
  );

  const isCreditsLoaded = isFetched && !isLoading && !isInitializingFreeCredits;

  return {
    credits,
    isLoading,
    isCreditsLoaded,
    error: error as Error | null,
    hasCredits: derivedValues.hasCredits,
    creditsPercent: derivedValues.creditsPercent,
    refetch,
    canAfford,
  };
};

export const useHasCredits = (): boolean => {
  const { hasCredits } = useCredits();
  return hasCredits;
};
