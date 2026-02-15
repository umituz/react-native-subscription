import { useCallback } from "react";
import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import { getCreditsRepository } from "../../infrastructure/CreditsRepositoryManager";
import type { UseDeductCreditParams, UseDeductCreditResult } from "./types";
import { createDeductCreditMutationConfig } from "./mutationConfig";

export const useDeductCredit = ({
  userId,
  onCreditsExhausted,
}: UseDeductCreditParams): UseDeductCreditResult => {
  const repository = getCreditsRepository();
  const queryClient = useQueryClient();

  const mutation = useMutation(createDeductCreditMutationConfig(userId, repository, queryClient));

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

  return {
    checkCredits,
    deductCredit,
    deductCredits,
    isDeducting: mutation.isPending
  };
};
