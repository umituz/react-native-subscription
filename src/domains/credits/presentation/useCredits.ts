import { useQuery, useQueryClient } from "@umituz/react-native-design-system";
import { useCallback, useMemo, useEffect, useRef } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import {
  getCreditsRepository,
  getCreditsConfig,
  isCreditsRepositoryConfigured,
} from "../infrastructure/CreditsRepositoryManager";
import { calculateSafePercentage, canAffordAmount } from "../utils/creditValidation";
import { isAuthenticated } from "../../subscription/utils/authGuards";
import { creditsQueryKeys } from "./creditsQueryKeys";
import type { UseCreditsResult, CreditsLoadStatus } from "./useCredits.types";

const deriveLoadStatus = (
  queryStatus: "pending" | "error" | "success",
  queryEnabled: boolean
): CreditsLoadStatus => {
  if (!queryEnabled) return "idle";
  if (queryStatus === "pending") return "loading";
  if (queryStatus === "error") return "error";
  return "ready";
};

export const useCredits = (): UseCreditsResult => {
  const userId = useAuthStore(selectUserId);
  const isConfigured = isCreditsRepositoryConfigured();

  const config = isConfigured ? getCreditsConfig() : null;
  const queryEnabled = isAuthenticated(userId) && isConfigured;

  const { data, status, error, refetch } = useQuery({
    queryKey: creditsQueryKeys.user(userId),
    queryFn: async () => {
      if (!isAuthenticated(userId) || !isConfigured) return null;

      const repository = getCreditsRepository();
      const result = await repository.getCredits(userId);

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch credits");
      }

      return result.data ?? null;
    },
    enabled: queryEnabled,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });

  const queryClient = useQueryClient();

  // Track previous userId to clear stale cache on logout/user switch
  const prevUserIdRef = useRef(userId);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    // Clear previous user's cache when userId changes (logout or user switch)
    if (prevUserId !== userId && isAuthenticated(prevUserId)) {
      queryClient.removeQueries({
        queryKey: creditsQueryKeys.user(prevUserId),
      });
    }
  }, [userId, queryClient]);

  useEffect(() => {
    if (!isAuthenticated(userId)) return undefined;

    const unsubscribe = subscriptionEventBus.on(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, (updatedUserId) => {
      if (updatedUserId === userId) {
        queryClient.invalidateQueries({ queryKey: creditsQueryKeys.user(userId) });
      }
    });

    return unsubscribe;
  }, [userId, queryClient]);

  const credits = data ?? null;

  const derivedValues = useMemo(() => {
    const has = (credits?.credits ?? 0) > 0;
    const limit = config?.creditLimit ?? 0;
    const percent = calculateSafePercentage(credits?.credits, limit);
    return { hasCredits: has, creditsPercent: percent };
  }, [credits, config?.creditLimit]);

  const canAfford = useCallback(
    (cost: number): boolean => canAffordAmount(credits?.credits, cost),
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
