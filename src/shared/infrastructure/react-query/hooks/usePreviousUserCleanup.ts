/**
 * User Cache Cleanup Hook
 * Automatically cleans up previous user's query cache when userId changes
 */

import { useEffect, useRef } from "react";
import type { QueryClient } from "@umituz/react-native-design-system";
import { isAuthenticated } from "../../../../domains/subscription/utils/authGuards";

/**
 * Cleans up previous user's cache when userId changes (logout or user switch)
 * Prevents data leakage between users
 *
 * @param userId - Current user ID
 * @param queryClient - TanStack Query client
 * @param queryKey - Query key factory function that takes userId
 *
 * @example
 * usePreviousUserCleanup(userId, queryClient, (id) => creditsQueryKeys.user(id));
 */
export function usePreviousUserCleanup(
  userId: string | null | undefined,
  queryClient: QueryClient,
  queryKey: (userId: string) => readonly unknown[]
): void {
  const prevUserIdRef = useRef(userId);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    // Clear previous user's cache when userId changes (logout or user switch)
    if (prevUserId !== userId && isAuthenticated(prevUserId)) {
      queryClient.removeQueries({
        queryKey: queryKey(prevUserId),
      });
    }
  }, [userId, queryClient, queryKey]);
}
