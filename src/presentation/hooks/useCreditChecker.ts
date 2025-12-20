/**
 * useCreditChecker Hook
 *
 * Provides credit checking utilities using context repository.
 */

import { useMemo } from "react";
import type { CreditType } from "../../domain/entities/Credits";
import { useCreditsRepository } from "../context/CreditsContext";
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
  const repository = useCreditsRepository();

  const checker = useMemo(
    () => createCreditChecker({ repository, getCreditType }),
    [repository, getCreditType]
  );

  return checker;
};
