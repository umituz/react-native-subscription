/**
 * useCredits Hook
 *
 * TanStack Query hook for fetching user credits.
 * Generic and reusable - uses config from module-level provider.
 */

import { useQuery } from "@tanstack/react-query";
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

export interface CreditsCacheConfig {
  /** Time in ms before data is considered stale. Default: 0 (always fresh) */
  staleTime?: number;
  /** Time in ms before inactive data is garbage collected. Default: 0 */
  gcTime?: number;
}

export interface UseCreditsParams {
  userId: string | undefined;
  enabled?: boolean;
  /** Cache configuration. Default: no caching (always fresh data) */
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

  // Default: no caching (always fresh data)
  const staleTime = cache?.staleTime ?? 0;
  const gcTime = cache?.gcTime ?? 0;

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
  const hasTextCredits = (credits?.textCredits ?? 0) > 0;
  const hasImageCredits = (credits?.imageCredits ?? 0) > 0;

  if (__DEV__) {
    console.log("[useCredits] State", {
      userId,
      enabled,
      isLoading,
      imageCredits: credits?.imageCredits ?? 0,
      textCredits: credits?.textCredits ?? 0,
      hasImageCredits,
      hasTextCredits,
    });
  }

  const textCreditsPercent = credits
    ? Math.round((credits.textCredits / config.textCreditLimit) * 100)
    : 0;

  const imageCreditsPercent = credits
    ? Math.round((credits.imageCredits / config.imageCreditLimit) * 100)
    : 0;

  const canAfford = (cost: number, type: CreditType = "text"): boolean => {
    if (!credits) return false;
    return type === "text"
      ? credits.textCredits >= cost
      : credits.imageCredits >= cost;
  };

  return {
    credits,
    isLoading,
    error: error as Error | null,
    hasTextCredits,
    hasImageCredits,
    textCreditsPercent,
    imageCreditsPercent,
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
