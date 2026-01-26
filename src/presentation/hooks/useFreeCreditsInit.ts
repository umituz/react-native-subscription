/**
 * useFreeCreditsInit Hook
 *
 * Handles free credits initialization for newly registered users.
 * Uses singleton pattern to prevent race conditions across multiple hook instances.
 *
 * @see https://medium.com/@shubhamkandharkar/creating-a-singleton-hook-in-react-a-practical-guide-fe5bf9aaefed
 */

import { useEffect, useCallback, useSyncExternalStore } from "react";
import {
  getCreditsRepository,
  getCreditsConfig,
  isCreditsRepositoryConfigured,
} from "../../infrastructure/repositories/CreditsRepositoryProvider";

declare const __DEV__: boolean;

// ============================================================================
// SINGLETON STATE - Shared across all hook instances
// ============================================================================
const freeCreditsInitAttempted = new Set<string>();
const freeCreditsInitInProgress = new Set<string>();
const initPromises = new Map<string, Promise<boolean>>();
const subscribers = new Set<() => void>();

function notifySubscribers(): void {
  subscribers.forEach((cb) => cb());
}

function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function getSnapshot(): Set<string> {
  return freeCreditsInitInProgress;
}

async function initializeFreeCreditsForUser(
  userId: string,
  onComplete: () => void
): Promise<boolean> {
  // Already completed for this user
  if (freeCreditsInitAttempted.has(userId) && !freeCreditsInitInProgress.has(userId)) {
    return true;
  }

  // Already in progress - return existing promise
  const existingPromise = initPromises.get(userId);
  if (existingPromise) {
    return existingPromise;
  }

  // Mark as attempted and in progress
  freeCreditsInitAttempted.add(userId);
  freeCreditsInitInProgress.add(userId);
  notifySubscribers();

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[useFreeCreditsInit] Initializing free credits:", userId.slice(0, 8));
  }

  const promise = (async () => {
    try {
      if (!isCreditsRepositoryConfigured()) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.warn("[useFreeCreditsInit] Credits repository not configured");
        }
        return false;
      }

      const repository = getCreditsRepository();
      const result = await repository.initializeFreeCredits(userId);

      if (result.success) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[useFreeCreditsInit] Free credits initialized:", result.data?.credits);
        }
        onComplete();
        return true;
      } else {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.warn("[useFreeCreditsInit] Free credits init failed:", result.error?.message);
        }
        return false;
      }
    } catch (error) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.error("[useFreeCreditsInit] Unexpected error:", error);
      }
      return false;
    } finally {
      freeCreditsInitInProgress.delete(userId);
      initPromises.delete(userId);
      notifySubscribers();
    }
  })();

  initPromises.set(userId, promise);
  return promise;
}

// ============================================================================
// HOOK INTERFACE
// ============================================================================
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

  // Subscribe to singleton state changes
  const inProgressSet = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const isConfigured = isCreditsRepositoryConfigured();
  const config = getCreditsConfig();
  const freeCredits = config.freeCredits ?? 0;
  // Free credits only enabled when explicitly set to true AND freeCredits > 0
  const isFreeCreditsEnabled = config.enableFreeCredits === true && freeCredits > 0;

  // Check if THIS user's init is in progress (shared across all hook instances)
  const isInitializing = userId ? inProgressSet.has(userId) : false;

  // Need init if: query succeeded, registered user, no credits, not attempted yet
  const needsInit =
    querySuccess &&
    !!userId &&
    isRegisteredUser &&
    isConfigured &&
    !hasCredits &&
    isFreeCreditsEnabled &&
    !freeCreditsInitAttempted.has(userId);

  // Stable callback reference
  const stableOnComplete = useCallback(() => {
    onInitComplete();
  }, [onInitComplete]);

  useEffect(() => {
    if (!userId) return;

    if (needsInit) {
      // Double-check inside effect to handle race conditions
      if (!freeCreditsInitAttempted.has(userId)) {
        initializeFreeCreditsForUser(userId, stableOnComplete).catch((error) => {
          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.error("[useFreeCreditsInit] Init failed:", error);
          }
        });
      }
    } else if (querySuccess && isAnonymous && !hasCredits && isFreeCreditsEnabled) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useFreeCreditsInit] Skipping - anonymous user must register first");
      }
    }
  }, [needsInit, userId, querySuccess, isAnonymous, hasCredits, isFreeCreditsEnabled, stableOnComplete]);

  return {
    isInitializing: isInitializing || needsInit,
    needsInit,
  };
}
