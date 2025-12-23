/**
 * Credit Checker Utility
 *
 * Validates credit availability before operations.
 * Generic - works with any generation type mapping.
 */

import type { CreditType } from "../domain/entities/Credits";
import type { CreditsRepository } from "../infrastructure/repositories/CreditsRepository";

export interface CreditCheckResult {
  success: boolean;
  error?: string;
  creditType?: CreditType;
}

export interface CreditCheckerConfig {
  repository: CreditsRepository;
  getCreditType: (operationType: string) => CreditType;
  /**
   * Optional callback called after successful credit deduction.
   * Use this to invalidate TanStack Query cache or trigger UI updates.
   * @param userId - The user whose credits were deducted
   * @param creditType - The type of credit that was deducted
   */
  onCreditDeducted?: (userId: string, creditType: CreditType) => void;
}

export const createCreditChecker = (config: CreditCheckerConfig) => {
  const { repository, getCreditType, onCreditDeducted } = config;

  const checkCreditsAvailable = async (
    userId: string | undefined,
    operationType: string
  ): Promise<CreditCheckResult> => {
    if (!userId) {
      return { success: false, error: "anonymous_user_blocked" };
    }

    const creditType = getCreditType(operationType);
    const hasCreditsAvailable = await repository.hasCredits(userId, creditType);

    if (!hasCreditsAvailable) {
      return {
        success: false,
        error:
          creditType === "image"
            ? "credits_exhausted_image"
            : "credits_exhausted_text",
        creditType,
      };
    }

    return { success: true, creditType };
  };

  const deductCreditsAfterSuccess = async (
    userId: string | undefined,
    creditType: CreditType
  ): Promise<void> => {
    if (!userId) return;

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const result = await repository.deductCredit(userId, creditType);
      if (result.success) {
        // Notify subscribers that credits were deducted
        onCreditDeducted?.(userId, creditType);
        return;
      }
      lastError = new Error(result.error?.message || "Deduction failed");
      await new Promise<void>((r) => setTimeout(() => r(), 500 * (attempt + 1)));
    }

    if (lastError) {
      throw lastError;
    }
  };

  return {
    checkCreditsAvailable,
    deductCreditsAfterSuccess,
  };
};

export type CreditChecker = ReturnType<typeof createCreditChecker>;

