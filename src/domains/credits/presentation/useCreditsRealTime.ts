import { useEffect, useState, useCallback } from "react";
import { onSnapshot } from "firebase/firestore";
import type { UserCredits } from "../core/Credits";
import { getCreditsConfig } from "../infrastructure/CreditsRepositoryManager";
import { mapCreditsDocumentToEntity } from "../core/CreditsMapper";
import { requireFirestore, buildDocRef, type CollectionConfig } from "../../../shared/infrastructure/firestore/collectionUtils";
import type { UserCreditsDocumentRead } from "../core/UserCreditsDocument";

/**
 * Real-time sync for credits using Firestore onSnapshot.
 * Provides instant updates without cache invalidation complexity.
 *
 * Benefits:
 * - Zero cache invalidation needed
 * - Instant updates from Firestore
 * - Always consistent with server state
 * - Simpler code (no event listeners needed)
 *
 * @param userId - User ID to sync credits for
 * @returns Credits state and loading status
 */
export function useCreditsRealTime(userId: string | null | undefined) {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when userId changes
    if (!userId) {
      setCredits(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const config = getCreditsConfig();

      // Build doc ref using same logic as repository
      const collectionConfig: CollectionConfig = {
        collectionName: config.collectionName,
        useUserSubcollection: config.useUserSubcollection,
      };
      const docRef = buildDocRef(db, userId, "balance", collectionConfig);

      // Real-time listener
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const entity = mapCreditsDocumentToEntity(snapshot.data() as UserCreditsDocumentRead);
            setCredits(entity);
          } else {
            setCredits(null);
          }
          setIsLoading(false);
        },
        (err) => {
          console.error("[useCreditsRealTime] Snapshot error:", err);
          setError(err as Error);
          setIsLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[useCreditsRealTime] Setup error:", err);
      setError(error);
      setIsLoading(false);
    }
  }, [userId]);

  const refetch = useCallback(() => {
    // Real-time sync doesn't need refetch, but keep for API compatibility
    // The snapshot listener will automatically update when data changes
    if (__DEV__) {
      console.warn("[useCreditsRealTime] Refetch called - not needed for real-time sync");
    }
  }, []);

  return {
    credits,
    isLoading,
    error,
    refetch, // No-op but kept for compatibility
  };
}

/**
 * Hook to get derived credit values with real-time sync.
 * This is the real-time equivalent of the computed values in useCredits.
 */
export function useCreditsRealTimeDerived(userId: string | null | undefined) {
  const { credits, isLoading } = useCreditsRealTime(userId);

  const hasCredits = (credits?.credits ?? 0) > 0;
  const creditsPercent = credits ? Math.min(
    (credits.credits / credits.creditLimit) * 100,
    100
  ) : 0;

  return {
    hasCredits,
    creditsPercent,
    isLoading,
    credits,
  };
}
