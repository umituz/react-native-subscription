import { useCallback, useMemo } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
import {
  getCreditsConfig,
  isCreditsRepositoryConfigured,
} from "../infrastructure/CreditsRepositoryManager";
import { calculateSafePercentage, canAffordAmount } from "../utils/creditValidation";
import { isAuthenticated } from "../../subscription/utils/authGuards";
import type { UseCreditsResult, CreditsLoadStatus } from "./useCredits.types";
import { useCreditsRealTime } from "./useCreditsRealTime";

const deriveLoadStatus = (
  isLoading: boolean,
  error: Error | null,
  queryEnabled: boolean
): CreditsLoadStatus => {
  if (!queryEnabled) return "idle";
  if (isLoading) return "loading";
  if (error) return "error";
  return "ready";
};

export const useCredits = (): UseCreditsResult => {
  const userId = useAuthStore(selectUserId);
  const isConfigured = isCreditsRepositoryConfigured();

  const config = isConfigured ? getCreditsConfig() : null;
  const hasUser = isAuthenticated(userId);
  const queryEnabled = hasUser && isConfigured;

  const { credits, isLoading, error } = useCreditsRealTime(userId);

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

  const loadStatus = deriveLoadStatus(isLoading, error, queryEnabled);
  const isCreditsLoaded = loadStatus === "ready";

  return {
    credits,
    isLoading,
    isCreditsLoaded,
    loadStatus,
    error,
    hasCredits: derivedValues.hasCredits,
    creditsPercent: derivedValues.creditsPercent,
    refetch: async () => {},
    canAfford,
  };
};
