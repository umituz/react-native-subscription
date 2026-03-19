import { useMemo } from "react";
import type { DocumentReference } from "firebase/firestore";
import type { UserCreditsDocumentRead } from "../core/UserCreditsDocument";
import { getCreditsConfig } from "../infrastructure/CreditsRepositoryManager";
import { mapCreditsDocumentToEntity } from "../core/CreditsMapper";
import { requireFirestore, buildDocRef } from "../../../shared/infrastructure/firestore/collectionUtils";
import { useFirestoreDocumentRealTime } from "../../../shared/presentation/hooks/useFirestoreRealTime";

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
  // Build document reference
  const docRef = useMemo(() => {
    if (!userId) return null;

    const db = requireFirestore();
    const config = getCreditsConfig();
    const ref = buildDocRef(db, userId, "balance", config);
    return ref as DocumentReference<UserCreditsDocumentRead>;
  }, [userId]);

  // Use generic real-time sync hook
  const { data, isLoading, error, refetch } = useFirestoreDocumentRealTime(
    userId,
    docRef,
    mapCreditsDocumentToEntity,
    "useCreditsRealTime"
  );

  return {
    credits: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get derived credit values with real-time sync.
 * This is the real-time equivalent of the computed values in useCredits.
 *
 * PERFORMANCE: Uses useMemo to avoid recalculating on every render
 */
export function useCreditsRealTimeDerived(userId: string | null | undefined) {
  const { credits, isLoading } = useCreditsRealTime(userId);

  const { hasCredits, creditsPercent } = useMemo(() => {
    const hasCredits = (credits?.credits ?? 0) > 0;
    const creditsPercent = credits ? Math.min(
      (credits.credits / credits.creditLimit) * 100,
      100
    ) : 0;
    return { hasCredits, creditsPercent };
  }, [credits]); // Include full credits object to catch all changes

  return {
    hasCredits,
    creditsPercent,
    isLoading,
    credits,
  };
}
