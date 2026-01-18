/**
 * useCredits Hook
 *
 * Fetches user credits with TanStack Query best practices.
 * Uses status-based state management for reliable loading detection.
 * Free credits initialization is delegated to useFreeCreditsInit hook.
 */

import { useQuery } from "@umituz/react-native-design-system";
import { useCallback, useMemo } from "react";
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
import { useFreeCreditsInit } from "./useFreeCreditsInit";

declare const __DEV__: boolean;

export const creditsQueryKeys = {
  all: ["credits"] as const,
  user: (userId: string) => ["credits", userId] as const,
};

export type CreditsLoadStatus = "idle" | "loading" | "initializing" | "ready" | "error";

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
  isInitializing: boolean,
  queryEnabled: boolean
): CreditsLoadStatus {
  if (!queryEnabled) return "idle";
  if (queryStatus === "pending") return "loading";
  if (queryStatus === "error") return "error";
  if (isInitializing) return "initializing";
  return "ready";
}

export const useCredits = (): UseCreditsResult => {
  const userId = useAuthStore(selectUserId);
  const isAnonymous = useAuthStore(selectIsAnonymous);
  const isRegisteredUser = !!userId && !isAnonymous;

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
  const querySuccess = status === "success";
  const hasCreditsData = (credits?.credits ?? 0) > 0;

  // Delegate free credits initialization to dedicated hook
  const { isInitializing, needsInit } = useFreeCreditsInit({
    userId,
    isRegisteredUser,
    isAnonymous,
    hasCredits: hasCreditsData,
    querySuccess,
    onInitComplete: refetch,
  });

  const derivedValues = useMemo(() => {
    const has = (credits?.credits ?? 0) > 0;
    const percent = credits ? Math.round((credits.credits / config.creditLimit) * 100) : 0;
    return { hasCredits: has, creditsPercent: percent };
  }, [credits, config.creditLimit]);

  const canAfford = useCallback(
    (cost: number): boolean => (credits?.credits ?? 0) >= cost,
    [credits]
  );

  // Include needsInit in initializing state for accurate loading detection
  const loadStatus = deriveLoadStatus(
    status,
    isInitializing || needsInit,
    queryEnabled
  );
  const isCreditsLoaded = loadStatus === "ready";
  const isLoading = loadStatus === "loading" || loadStatus === "initializing";

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
