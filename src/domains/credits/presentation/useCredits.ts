import { useQuery, useQueryClient } from "@umituz/react-native-design-system";
import { useCallback, useMemo, useEffect, useRef } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import type { UserCredits } from "../core/Credits";
import {
  getCreditsRepository,
  getCreditsConfig,
  isCreditsRepositoryConfigured,
} from "../infrastructure/CreditsRepositoryManager";
import { calculateCreditPercentage, canAfford as canAffordCheck } from "../../../shared/utils/numberUtils";

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
  
  const config = isConfigured ? getCreditsConfig() : null;
  const queryEnabled = !!userId && isConfigured;

  const { data, status, error, refetch } = useQuery({
    queryKey: userId ? creditsQueryKeys.user(userId) : creditsQueryKeys.all,
    queryFn: async () => {
      if (!userId || !isConfigured) return null;

      const repository = getCreditsRepository();
      const result = await repository.getCredits(userId);

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch credits");
      }

      return result.data || null;
    },
    enabled: queryEnabled,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);

  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscriptionEventBus.on(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, (updatedUserId) => {
      if (updatedUserId === userId) {
        queryClientRef.current.invalidateQueries({ queryKey: creditsQueryKeys.user(userId) });
      }
    });

    return unsubscribe;
  }, [userId]);

  const credits = data ?? null;

  const derivedValues = useMemo(() => {
    const has = (credits?.credits ?? 0) > 0;
    const limit = config?.creditLimit ?? 0;
    const percent = calculateCreditPercentage(credits?.credits, limit);
    return { hasCredits: has, creditsPercent: percent };
  }, [credits, config?.creditLimit]);

  const canAfford = useCallback(
    (cost: number): boolean => canAffordCheck(credits?.credits, cost),
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

