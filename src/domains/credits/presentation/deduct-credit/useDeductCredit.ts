import { useCallback, useState } from "react";
import { getCreditsRepository } from "../../infrastructure/CreditsRepositoryManager";
import type { UseDeductCreditParams, UseDeductCreditResult } from "./types";

export const useDeductCredit = ({
  userId,
  onCreditsExhausted,
}: UseDeductCreditParams): UseDeductCreditResult => {
  const repository = getCreditsRepository();
  const [isDeducting, setIsDeducting] = useState(false);

  const deductCredit = useCallback(async (cost: number = 1): Promise<boolean> => {
    if (!userId) return false;

    setIsDeducting(true);
    try {
      const res = await repository.deductCredit(userId, cost);
      if (__DEV__) console.log('[useDeductCredit] deduction result:', JSON.stringify(res));

      if (!res.success) {
        if (__DEV__) console.log('[useDeductCredit] deduction FAILED:', res.error?.code, res.error?.message);

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
    } finally {
      setIsDeducting(false);
    }
  }, [userId, repository, onCreditsExhausted]);

  const checkCredits = useCallback(async (cost: number = 1): Promise<boolean> => {
    if (!userId) return false;
    return repository.hasCredits(userId, cost);
  }, [userId, repository]);

  const refundCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (!userId) return false;
    try {
      const result = await repository.refundCredit(userId, amount);
      return result.success;
    } catch (error) {
      if (__DEV__) {
        console.error('[useDeductCredit] Unexpected error during credit refund', {
          amount,
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      return false;
    }
  }, [userId, repository]);

  return {
    checkCredits,
    deductCredit,
    refundCredits,
    isDeducting
  };
};
