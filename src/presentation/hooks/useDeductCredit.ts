/**
 * useDeductCredit Hook
 * TanStack Query mutation hook for deducting credits.
 */

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserCredits } from "../../domain/entities/Credits";
import { getCreditsRepository } from "../../infrastructure/repositories/CreditsRepositoryProvider";
import { creditsQueryKeys } from "./useCredits";

import { timezoneService } from "@umituz/react-native-timezone";

export interface UseDeductCreditParams {
  userId: string | undefined;
  onCreditsExhausted?: () => void;
}

export interface UseDeductCreditResult {
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
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: creditsQueryKeys.user(userId) });
      const previousCredits = queryClient.getQueryData<UserCredits>(creditsQueryKeys.user(userId));
      queryClient.setQueryData<UserCredits | null>(creditsQueryKeys.user(userId), (old) => {
        if (!old) return old;
        return { 
          ...old, 
          credits: Math.max(0, old.credits - cost), 
          lastUpdatedAt: timezoneService.getNow() 
        };
      });
      return { previousCredits };
    },
    onError: (_err, _cost, context) => {
      if (userId && context?.previousCredits) {
        queryClient.setQueryData(creditsQueryKeys.user(userId), context.previousCredits);
      }
    },
    onSettled: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: creditsQueryKeys.user(userId) });
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
    } catch { return false; }
  }, [mutation, onCreditsExhausted]);

  const deductCredits = useCallback(async (cost: number): Promise<boolean> => {
    return await deductCredit(cost);
  }, [deductCredit]);

  return { deductCredit, deductCredits, isDeducting: mutation.isPending };
};
