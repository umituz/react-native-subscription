/**
 * useCredits Hook
 *
 * Fetches user credits with TanStack Query best practices.
 * Uses status-based state management for reliable loading detection.
 */

import { useQuery } from "@umituz/react-native-design-system";
import { useCallback, useMemo } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
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

export type CreditsLoadStatus = "idle" | "loading" | "ready" | "error";

export interface UseCreditsResult {
  credits: UserCredits | null;
  isLoading: boolean;
  isCreditsLoaded: boolean;
  loadStatus: CreditsLoadStatus;
  error: Error | null;
  hasCredits: boolean;
  creditsPercent: number;
  refetch: () => void;
  canAfford: (cost: number) => boolean;
}

function deriveLoadStatus(
  queryStatus: "pending" | "error" | "success",
  queryEnabled: boolean
): CreditsLoadStatus {
  if (!queryEnabled) return "idle";
  if (queryStatus === "pending") return "loading";
  if (queryStatus === "error") return "error";
  return "ready";
}

export const useCredits = (): UseCreditsResult => {
  const userId = useAuthStore(selectUserId);
  const isConfigured = isCreditsRepositoryConfigured();
  const config = getCreditsConfig();
  const queryEnabled = !!userId && isConfigured;

  const { data, status, error, refetch } = useQuery({
    queryKey: creditsQueryKeys.user(userId ?? ""),
    queryFn: async () => {
      if (!userId || !isConfigured) return null;

      const repository = getCreditsRepository();
      const result = await repository.getCredits(userId);

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch credits");
      }

      // If subscription is expired, immediately return 0 credits
      // to prevent any window where expired user could deduct
      if (result.data?.status === "expired") {
        // Sync to Firestore in background
        repository.syncExpiredStatus(userId).catch((syncError) => {
          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.warn("[useCredits] Background sync failed:", syncError);
          }
        });

        // Return expired data with 0 credits immediately
        return {
          ...result.data,
          credits: 0,
          isPremium: false,
        };
      }

      return result.data || null;
    },
    enabled: queryEnabled,
    staleTime: 30 * 1000, // 30 seconds - data considered fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache after unmount
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const credits = data ?? null;

  const derivedValues = useMemo(() => {
    const has = (credits?.credits ?? 0) > 0;
    const percent = credits ? Math.round((credits.credits / config.creditLimit) * 100) : 0;
    return { hasCredits: has, creditsPercent: percent };
  }, [credits, config.creditLimit]);

  const canAfford = useCallback(
    (cost: number): boolean => (credits?.credits ?? 0) >= cost,
    [credits]
  );

  const loadStatus = deriveLoadStatus(status, queryEnabled);
  const isCreditsLoaded = loadStatus === "ready";
  const isLoading = loadStatus === "loading";

  return {
    credits,
    isLoading,
    isCreditsLoaded,
    loadStatus,
    error: error instanceof Error ? error : null,
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
