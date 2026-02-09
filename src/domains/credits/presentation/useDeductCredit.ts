/**
 * useDeductCredit Hook
 * TanStack Query mutation hook for deducting credits.
 */

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import type { UserCredits } from "../core/Credits";
import { getCreditsRepository } from "../infrastructure/CreditsRepositoryManager";
import { creditsQueryKeys } from "./useCredits";
import { calculateRemainingCredits } from "../utils/creditCalculations";

import { timezoneService } from "@umituz/react-native-design-system";

export interface UseDeductCreditParams {
  userId: string | undefined;
  onCreditsExhausted?: () => void;
}

export interface UseDeductCreditResult {
  /** Check if user has enough credits (server-side validation) */
  checkCredits: (cost?: number) => Promise<boolean>;
  deductCredit: (cost?: number) => Promise<boolean>;
  deductCredits: (cost: number) => Promise<boolean>;
  isDeducting: boolean;
}

export const useDeductCredit = ({
  userId,
  onCreditsExhausted,
}: UseDeductCreditParams): UseDeductCreditResult => {
  const repository = getCreditsRepository();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (cost: number) => {
      if (!userId) throw new Error("User not authenticated");
      return repository.deductCredit(userId, cost);
    },
    onMutate: async (cost: number) => {
      if (!userId) return { previousCredits: null, skippedOptimistic: true };

      await queryClient.cancelQueries({ queryKey: creditsQueryKeys.user(userId) });
      const previousCredits = queryClient.getQueryData<UserCredits>(creditsQueryKeys.user(userId));

      if (!previousCredits) {
        return { previousCredits: null, skippedOptimistic: true };
      }

      // Calculate new credits using utility
      const newCredits = calculateRemainingCredits(previousCredits.credits, cost);

      queryClient.setQueryData<UserCredits | null>(creditsQueryKeys.user(userId), (old) => {
        if (!old) return old;
        return {
          ...old,
          credits: newCredits,
          lastUpdatedAt: timezoneService.getNow()
        };
      });

      return {
        previousCredits,
        skippedOptimistic: false,
        wasInsufficient: previousCredits.credits < cost
      };
    },
    onError: (_err, _cost, mutationData) => {
      // Always restore previous credits on error to prevent UI desync
      // Use optional chaining to be safe
      if (userId && mutationData?.previousCredits && !mutationData.skippedOptimistic) {
         queryClient.setQueryData(creditsQueryKeys.user(userId), mutationData.previousCredits);
      }
    },
    onSuccess: () => {
      // Only invalidate on success to get fresh server data
      if (userId) {
        queryClient.invalidateQueries({ queryKey: creditsQueryKeys.user(userId) });
      }
    },
  });

  const deductCredit = useCallback(async (cost: number = 1): Promise<boolean> => {
    try {
      const res = await mutation.mutateAsync(cost);
      if (!res.success) {
        if (res.error?.code === "CREDITS_EXHAUSTED") onCreditsExhausted?.();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [mutation, onCreditsExhausted]);

  const deductCredits = useCallback(async (cost: number): Promise<boolean> => {
    return await deductCredit(cost);
  }, [deductCredit]);

  const checkCredits = useCallback(async (cost: number = 1): Promise<boolean> => {
    if (!userId) return false;
    return repository.hasCredits(userId, cost);
  }, [userId, repository]);

  return { checkCredits, deductCredit, deductCredits, isDeducting: mutation.isPending };
};
