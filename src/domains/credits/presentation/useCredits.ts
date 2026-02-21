import { useQuery, useQueryClient } from "@umituz/react-native-design-system";
import { useCallback, useMemo, useEffect } from "react";
import { useAuthStore, selectUserId, selectIsAnonymous } from "@umituz/react-native-auth";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import { NO_CACHE_QUERY_CONFIG } from "../../../shared/infrastructure/react-query/queryConfig";
import { usePreviousUserCleanup } from "../../../shared/infrastructure/react-query/hooks/usePreviousUserCleanup";
import {
  getCreditsRepository,
  getCreditsConfig,
  isCreditsRepositoryConfigured,
} from "../infrastructure/CreditsRepositoryManager";
import { calculateSafePercentage, canAffordAmount } from "../utils/creditValidation";
import { isRegisteredUser } from "../../subscription/utils/authGuards";
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
  const isAnonymous = useAuthStore(selectIsAnonymous);
  const isConfigured = isCreditsRepositoryConfigured();

  const config = isConfigured ? getCreditsConfig() : null;
  const isUserRegistered = isRegisteredUser(userId, isAnonymous);
  const queryEnabled = isUserRegistered && isConfigured;

  const { data, status, error, refetch } = useQuery({
    queryKey: creditsQueryKeys.user(userId),
    queryFn: async () => {
      if (!isUserRegistered || !isConfigured) return null;

      const repository = getCreditsRepository();
      const result = await repository.getCredits(userId);

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch credits");
      }

      return result.data ?? null;
    },
    enabled: queryEnabled,
    ...NO_CACHE_QUERY_CONFIG,
  });

  const queryClient = useQueryClient();

  usePreviousUserCleanup(userId, queryClient, creditsQueryKeys.user);

  useEffect(() => {
    if (!isUserRegistered) return undefined;

    const unsubscribe = subscriptionEventBus.on(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, (updatedUserId) => {
      if (updatedUserId === userId) {
        queryClient.invalidateQueries({ queryKey: creditsQueryKeys.user(userId) });
      }
    });

    return unsubscribe;
  }, [userId, isUserRegistered, queryClient]);

  const credits = data ?? null;

  const derivedValues = useMemo(() => {
    const has = (credits?.credits ?? 0) > 0;
    const limit = credits?.creditLimit ?? config?.creditLimit ?? 0;
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
