/**
 * useCreditChecker Hook
 *
 * Provides credit checking utilities using module-level repository.
 */

import { useMemo } from "react";
import type { CreditType } from "../../domain/entities/Credits";
import { getCreditsRepository } from "../../infrastructure/repositories/CreditsRepositoryProvider";
import {
  createCreditChecker,
  type CreditCheckResult,
} from "../../utils/creditChecker";

export interface UseCreditCheckerParams {
  getCreditType: (operationType: string) => CreditType;
}

export interface UseCreditCheckerResult {
  checkCreditsAvailable: (
    userId: string | undefined,
    operationType: string
  ) => Promise<CreditCheckResult>;
  deductCreditsAfterSuccess: (
    userId: string | undefined,
    creditType: CreditType
  ) => Promise<void>;
}

export const useCreditChecker = ({
  getCreditType,
}: UseCreditCheckerParams): UseCreditCheckerResult => {
  const repository = getCreditsRepository();

  const checker = useMemo(
    () => createCreditChecker({ repository, getCreditType }),
    [getCreditType]
  );

  return checker;
};
