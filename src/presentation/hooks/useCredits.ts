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
} from "../../infrastructure/repositories/CreditsRepositoryProvider";

const CACHE_CONFIG = {
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
};

export const creditsQueryKeys = {
  all: ["credits"] as const,
  user: (userId: string) => ["credits", userId] as const,
};

export interface UseCreditsParams {
  userId: string | undefined;
  enabled?: boolean;
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
}

export const useCredits = ({
  userId,
  enabled = true,
}: UseCreditsParams): UseCreditsResult => {
  const repository = getCreditsRepository();
  const config = getCreditsConfig();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: creditsQueryKeys.user(userId ?? ""),
    queryFn: async () => {
      if (!userId) return null;
      const result = await repository.getCredits(userId);
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch credits");
      }
      return result.data || null;
    },
    enabled: enabled && !!userId,
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
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

  return {
    credits,
    isLoading,
    error: error as Error | null,
    hasTextCredits,
    hasImageCredits,
    textCreditsPercent,
    imageCreditsPercent,
    refetch,
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
