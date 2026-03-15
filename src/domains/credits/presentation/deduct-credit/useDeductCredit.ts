import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@umituz/react-native-design-system/tanstack";
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
    if (__DEV__) console.log('[useDeductCredit] >>> deductCredit called', { cost, userId });
    try {
      const res = await mutateAsyncRef.current(cost);
      if (__DEV__) console.log('[useDeductCredit] mutation result:', JSON.stringify(res));
      if (!res.success) {
        if (__DEV__) console.log('[useDeductCredit] deduction FAILED:', res.error?.code, res.error?.message);
        // Call onCreditsExhausted for any credit-related error codes
        if (res.error?.code === "CREDITS_EXHAUSTED" || res.error?.code === "DEDUCT_ERR" || res.error?.code === "NO_CREDITS") {
          if (__DEV__) console.log('[useDeductCredit] Credits exhausted, calling onCreditsExhausted callback');
          onCreditsExhausted?.();
        }
        return false;
      }
      if (__DEV__) console.log('[useDeductCredit] deduction SUCCESS, remaining:', res.remainingCredits);
      return true;
    } catch (error) {
      if (__DEV__) console.error('[useDeductCredit] UNEXPECTED ERROR during credit deduction', {
        cost,
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }, [onCreditsExhausted, userId]);

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
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }, [userId, repository, queryClient]);

  return {
    checkCredits,
    deductCredit,
    refundCredits,
    isDeducting: mutation.isPending
  };
};
