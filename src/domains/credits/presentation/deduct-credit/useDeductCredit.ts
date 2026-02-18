import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import { getCreditsRepository } from "../../infrastructure/CreditsRepositoryManager";
import type { UseDeductCreditParams, UseDeductCreditResult } from "./types";
import type { DeductCreditsResult } from "../../core/Credits";
import { createDeductCreditMutationConfig, type MutationContext } from "./mutationConfig";
import { creditsQueryKeys } from "../creditsQueryKeys";

export const useDeductCredit = ({
  userId,
  onCreditsExhausted,
}: UseDeductCreditParams): UseDeductCreditResult => {
  const repository = getCreditsRepository();
  const queryClient = useQueryClient();

  const mutation = useMutation<DeductCreditsResult, Error, number, MutationContext>(
    createDeductCreditMutationConfig(userId, repository, queryClient)
  );

  // Use ref for stable reference to mutateAsync — avoids re-creating callbacks every render
  const mutateAsyncRef = useRef(mutation.mutateAsync);
  mutateAsyncRef.current = mutation.mutateAsync;

  const deductCredit = useCallback(async (cost: number = 1): Promise<boolean> => {
    try {
      const res = await mutateAsyncRef.current(cost);
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
  }, [onCreditsExhausted, userId]);

  const deductCredits = useCallback(async (cost: number): Promise<boolean> => {
    return await deductCredit(cost);
  }, [deductCredit]);

  const checkCredits = useCallback(async (cost: number = 1): Promise<boolean> => {
    if (!userId) return false;
    return repository.hasCredits(userId, cost);
  }, [userId, repository]);

  const refundCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (!userId) return false;
    try {
      const result = await repository.refundCredit(userId, amount);
      if (result.success) {
        // Invalidate queries to refresh credit balance
        await queryClient.invalidateQueries({ queryKey: creditsQueryKeys.user(userId) });
        return true;
      }
      return false;
    } catch (error) {
      console.error('[useDeductCredit] Unexpected error during credit refund', {
        amount,
        userId,
        error
      });
      return false;
    }
  }, [userId, repository, queryClient]);

  return {
    checkCredits,
    deductCredit,
    deductCredits,
    refundCredits,
    isDeducting: mutation.isPending
  };
};
