import { useEffect, useRef } from "react";
import type { QueryClient } from "@umituz/react-native-design-system";
import { isAuthenticated } from "../../../../domains/subscription/utils/authGuards";

export function usePreviousUserCleanup(
  userId: string | null | undefined,
  queryClient: QueryClient,
  queryKey: (userId: string) => readonly unknown[]
): void {
  const prevUserIdRef = useRef(userId);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (prevUserId !== userId && isAuthenticated(prevUserId)) {
      queryClient.removeQueries({
        queryKey: queryKey(prevUserId),
      });
    }
  }, [userId, queryClient, queryKey]);
}
