/**
 * useFreeCreditsInit Hook
 *
 * Handles free credits initialization for newly registered users.
 * Separated from useCredits for better maintainability and testability.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getCreditsRepository,
  getCreditsConfig,
  isCreditsRepositoryConfigured,
} from "../../infrastructure/repositories/CreditsRepositoryProvider";

declare const __DEV__: boolean;

const freeCreditsInitAttempted = new Set<string>();

export interface UseFreeCreditsInitParams {
  userId: string | null | undefined;
  isRegisteredUser: boolean;
  isAnonymous: boolean;
  hasCredits: boolean;
  querySuccess: boolean;
  onInitComplete: () => void;
}

export interface UseFreeCreditsInitResult {
  isInitializing: boolean;
  needsInit: boolean;
}

export function useFreeCreditsInit(params: UseFreeCreditsInitParams): UseFreeCreditsInitResult {
  const { userId, isRegisteredUser, isAnonymous, hasCredits, querySuccess, onInitComplete } = params;
  const [isInitializing, setIsInitializing] = useState(false);

  const isConfigured = isCreditsRepositoryConfigured();
  const config = getCreditsConfig();
  const freeCredits = config.freeCredits ?? 0;
  const autoInit = config.autoInitializeFreeCredits !== false && freeCredits > 0;

  const needsInit =
    querySuccess &&
    !!userId &&
    isRegisteredUser &&
    isConfigured &&
    !hasCredits &&
    autoInit &&
    !freeCreditsInitAttempted.has(userId);

  const initializeFreeCredits = useCallback(async (uid: string) => {
    freeCreditsInitAttempted.add(uid);
    setIsInitializing(true);

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[useFreeCreditsInit] Initializing free credits:", uid.slice(0, 8));
    }

    const repository = getCreditsRepository();
    const result = await repository.initializeFreeCredits(uid);
    setIsInitializing(false);

    if (result.success) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useFreeCreditsInit] Free credits initialized:", result.data?.credits);
      }
      onInitComplete();
    } else if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn("[useFreeCreditsInit] Free credits init failed:", result.error?.message);
    }
  }, [onInitComplete]);

  useEffect(() => {
    if (needsInit && userId) {
      initializeFreeCredits(userId);
    } else if (querySuccess && userId && isAnonymous && !hasCredits && autoInit) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useFreeCreditsInit] Skipping - anonymous user must register first");
      }
    }
  }, [needsInit, userId, querySuccess, isAnonymous, hasCredits, autoInit, initializeFreeCredits]);

  return {
    isInitializing,
    needsInit,
  };
}
