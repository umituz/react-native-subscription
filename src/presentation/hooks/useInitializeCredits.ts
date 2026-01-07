/**
 * useInitializeCredits Hook
 * TanStack Query mutation hook for initializing credits after purchase.
 */

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCreditsRepository } from "../../infrastructure/repositories/CreditsRepositoryProvider";
import { creditsQueryKeys } from "./useCredits";

declare const __DEV__: boolean;

export interface UseInitializeCreditsParams {
  userId: string | undefined;
}

export interface InitializeCreditsOptions {
  purchaseId?: string;
  productId?: string;
}

export interface UseInitializeCreditsResult {
  initializeCredits: (options?: InitializeCreditsOptions) => Promise<boolean>;
  isInitializing: boolean;
}

export const useInitializeCredits = ({
  userId,
}: UseInitializeCreditsParams): UseInitializeCreditsResult => {
  const repository = getCreditsRepository();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (options?: InitializeCreditsOptions) => {
      if (!userId) throw new Error("User not authenticated");
      if (__DEV__) console.log("[useInitializeCredits] Initializing:", { userId, ...options });
      return repository.initializeCredits(userId, options?.purchaseId, options?.productId);
    },
    onSuccess: (result) => {
      if (userId && result.success && result.data) {
        if (__DEV__) console.log("[useInitializeCredits] Success:", result.data);
        queryClient.setQueryData(creditsQueryKeys.user(userId), result.data);
        queryClient.invalidateQueries({ queryKey: creditsQueryKeys.user(userId) });
      }
    },
    onError: (error) => { if (__DEV__) console.error("[useInitializeCredits] Error:", error); },
  });

  const initializeCredits = useCallback(async (opts?: InitializeCreditsOptions): Promise<boolean> => {
    try {
      const res = await mutation.mutateAsync(opts);
      return res.success;
    } catch { return false; }
  }, [mutation]);

  return { initializeCredits, isInitializing: mutation.isPending };
};
