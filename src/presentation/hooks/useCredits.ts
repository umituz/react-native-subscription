/**
 * useCredits Hook
 *
 * TanStack Query hook for fetching user credits.
 * Generic and reusable - uses config from module-level provider.
 */

import { useQuery } from "@umituz/react-native-design-system";
import { useCallback, useMemo } from "react";
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

/** Default stale time: 30 seconds - prevents infinite re-render loops */
const DEFAULT_STALE_TIME = 30 * 1000;
/** Default gc time: 5 minutes */
const DEFAULT_GC_TIME = 5 * 60 * 1000;

export interface CreditsCacheConfig {
  /** Time in ms before data is considered stale. Default: 30 seconds */
  staleTime?: number;
  /** Time in ms before inactive data is garbage collected. Default: 5 minutes */
  gcTime?: number;
}

export interface UseCreditsParams {
  userId: string | undefined;
  enabled?: boolean;
  /** Cache configuration. Default: 30 second staleTime, 5 minute gcTime */
  cache?: CreditsCacheConfig;
}

export interface UseCreditsResult {
  credits: UserCredits | null;
  isLoading: boolean;
  error: Error | null;
  hasCredits: boolean;
  creditsPercent: number;
  refetch: () => void;
  /** Check if user can afford a specific credit cost */
  canAfford: (cost: number) => boolean;
}

export const useCredits = ({
  userId,
  enabled = true,
  cache,
}: UseCreditsParams): UseCreditsResult => {
  const isConfigured = isCreditsRepositoryConfigured();
  const config = getCreditsConfig();

  // Default: 30 second stale time to prevent infinite re-render loops
  const staleTime = cache?.staleTime ?? DEFAULT_STALE_TIME;
  const gcTime = cache?.gcTime ?? DEFAULT_GC_TIME;

  const queryEnabled = enabled && !!userId && isConfigured;

  const { data, isLoading, error, refetch } = useQuery({
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

      // Background sync: If mapper detected expired status, sync to Firestore
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
    staleTime,
    gcTime,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const credits = data ?? null;

  // Memoize derived values to prevent unnecessary re-renders
  const derivedValues = useMemo(() => {
    const has = (credits?.credits ?? 0) > 0;
    const percent = credits
      ? Math.round((credits.credits / config.creditLimit) * 100)
      : 0;

    return {
      hasCredits: has,
      creditsPercent: percent,
    };
  }, [credits, config.creditLimit]);

  // Memoize canAfford to prevent recreation on every render
  const canAfford = useCallback(
    (cost: number): boolean => {
      if (!credits) return false;
      return credits.credits >= cost;
    },
    [credits]
  );

  return {
    credits,
    isLoading,
    error: error as Error | null,
    hasCredits: derivedValues.hasCredits,
    creditsPercent: derivedValues.creditsPercent,
    refetch,
    canAfford,
  };
};

export const useHasCredits = (
  userId: string | undefined
): boolean => {
  const { credits } = useCredits({ userId });
  if (!credits) return false;
  return credits.credits > 0;
};
