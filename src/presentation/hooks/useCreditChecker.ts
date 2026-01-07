/**
 * useCreditChecker Hook
 *
 * Provides credit checking utilities using module-level repository.
 */

import { useMemo } from "react";
import { getCreditsRepository } from "../../infrastructure/repositories/CreditsRepositoryProvider";
import {
    createCreditChecker,
    type CreditCheckResult,
} from "../../utils/creditChecker";

export interface UseCreditCheckerParams {
  onCreditDeducted?: (userId: string, cost: number) => void;
}

export interface UseCreditCheckerResult {
  checkCreditsAvailable: (
    userId: string | undefined,
    cost?: number
  ) => Promise<CreditCheckResult>;
  deductCreditsAfterSuccess: (
    userId: string | undefined,
    cost?: number
  ) => Promise<void>;
}

export const useCreditChecker = (
  params?: UseCreditCheckerParams
): UseCreditCheckerResult => {
  const repository = getCreditsRepository();
  const onCreditDeducted = params?.onCreditDeducted;

  const checker = useMemo(
    () => createCreditChecker({ repository, onCreditDeducted }),
    [repository, onCreditDeducted]
  );

  return checker;
};
