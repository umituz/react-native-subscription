import { useCallback, useState } from "react";
import { getCreditsRepository } from "../../infrastructure/CreditsRepositoryManager";
import { createLogger } from "../../../../shared/utils/logger";
import type { UseDeductCreditParams, UseDeductCreditResult } from "./types";

const logger = createLogger("useDeductCredit");

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
      logger.debug("Deduction result", { result: res });

      if (!res.success) {
        logger.warn("Deduction failed", { code: res.error?.code, message: res.error?.message });

        if (res.error?.code === "CREDITS_EXHAUSTED" || res.error?.code === "DEDUCT_ERR" || res.error?.code === "NO_CREDITS") {
          logger.info("Credits exhausted, calling onCreditsExhausted callback");
          onCreditsExhausted?.();
        }
        return false;
      }

      logger.debug("Deduction success", { remainingCredits: res.remainingCredits });
      return true;
    } catch (error) {
      logger.error("Unexpected error during credit deduction", error, { cost, userId });
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
      logger.error("Unexpected error during credit refund", error, { amount, userId });
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
