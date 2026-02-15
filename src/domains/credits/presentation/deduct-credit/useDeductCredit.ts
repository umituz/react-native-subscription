import { useCallback } from "react";
import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import { getCreditsRepository } from "../../infrastructure/CreditsRepositoryManager";
import type { UseDeductCreditParams, UseDeductCreditResult } from "./types";
import type { DeductCreditsResult } from "../../core/Credits";
import { createDeductCreditMutationConfig, type MutationContext } from "./mutationConfig";

export const useDeductCredit = ({
  userId,
  onCreditsExhausted,
}: UseDeductCreditParams): UseDeductCreditResult => {
  const repository = getCreditsRepository();
  const queryClient = useQueryClient();

  const mutation = useMutation<DeductCreditsResult, Error, number, MutationContext>(
    createDeductCreditMutationConfig(userId, repository, queryClient)
  );

  const deductCredit = useCallback(async (cost: number = 1): Promise<boolean> => {
    try {
      const res = await mutation.mutateAsync(cost);
      if (!res.success) {
        if (res.error?.code === "CREDITS_EXHAUSTED") {
          onCreditsExhausted?.();
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error('[useDeductCredit] Unexpected error during credit deduction', {
        cost,
        userId,
        error
      });
      throw error;
    }
  }, [mutation, onCreditsExhausted, userId]);

  const deductCredits = useCallback(async (cost: number): Promise<boolean> => {
    return await deductCredit(cost);
  }, [deductCredit]);

  const checkCredits = useCallback(async (cost: number = 1): Promise<boolean> => {
    if (!userId) return false;
    return repository.hasCredits(userId, cost);
  }, [userId, repository]);

  return {
    checkCredits,
    deductCredit,
    deductCredits,
    isDeducting: mutation.isPending
  };
};
