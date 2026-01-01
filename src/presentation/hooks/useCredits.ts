/**
 * useCredits Hook
 *
 * TanStack Query hook for fetching user credits.
 * Generic and reusable - uses config from module-level provider.
 */

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { UserCredits, CreditType } from "../../domain/entities/Credits";

declare const __DEV__: boolean;
import {
    getCreditsRepository,
    getCreditsConfig,
    isCreditsRepositoryConfigured,
} from "../../infrastructure/repositories/CreditsRepositoryProvider";

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
  hasTextCredits: boolean;
  hasImageCredits: boolean;
  textCreditsPercent: number;
  imageCreditsPercent: number;
  refetch: () => void;
  /** Check if user can afford a specific credit cost */
  canAfford: (cost: number, type?: CreditType) => boolean;
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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: creditsQueryKeys.user(userId ?? ""),
    queryFn: async () => {
      if (!userId || !isConfigured) return null;
      const repository = getCreditsRepository();
      const result = await repository.getCredits(userId);
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch credits");
      }
      return result.data || null;
    },
    enabled: enabled && !!userId && isConfigured,
    staleTime,
    gcTime,
  });

  const credits = data ?? null;

  // Memoize derived values to prevent unnecessary re-renders
  const derivedValues = useMemo(() => {
    const hasText = (credits?.textCredits ?? 0) > 0;
    const hasImage = (credits?.imageCredits ?? 0) > 0;
    const textPercent = credits
      ? Math.round((credits.textCredits / config.textCreditLimit) * 100)
      : 0;
    const imagePercent = credits
      ? Math.round((credits.imageCredits / config.imageCreditLimit) * 100)
      : 0;

    return {
      hasTextCredits: hasText,
      hasImageCredits: hasImage,
      textCreditsPercent: textPercent,
      imageCreditsPercent: imagePercent,
    };
  }, [credits, config.textCreditLimit, config.imageCreditLimit]);

  // Memoize canAfford to prevent recreation on every render
  const canAfford = useCallback(
    (cost: number, type: CreditType = "text"): boolean => {
      if (!credits) return false;
      return type === "text"
        ? credits.textCredits >= cost
        : credits.imageCredits >= cost;
    },
    [credits]
  );

  return {
    credits,
    isLoading,
    error: error as Error | null,
    hasTextCredits: derivedValues.hasTextCredits,
    hasImageCredits: derivedValues.hasImageCredits,
    textCreditsPercent: derivedValues.textCreditsPercent,
    imageCreditsPercent: derivedValues.imageCreditsPercent,
    refetch,
    canAfford,
  };
};

export const useHasCredits = (
  userId: string | undefined,
  creditType: CreditType
): boolean => {
  const { credits } = useCredits({ userId });
  if (!credits) return false;

  return creditType === "text"
    ? credits.textCredits > 0
    : credits.imageCredits > 0;
};
