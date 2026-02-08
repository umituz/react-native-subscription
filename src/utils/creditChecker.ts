/**
 * Credit Checker Utility
 *
 * Validates credit availability before operations.
 * Generic - works with any generation type mapping.
 */

import type { CreditsRepository } from "../domains/credits/infrastructure/CreditsRepository";

export interface CreditCheckResult {
  success: boolean;
  error?: string;
}

export interface CreditCheckerConfig {
  repository: CreditsRepository;
  /**
   * Optional callback called after successful credit deduction.
   * Use this to invalidate TanStack Query cache or trigger UI updates.
   * @param userId - The user whose credits were deducted
   * @param cost - The amount of credits deducted
   */
  onCreditDeducted?: (userId: string, cost: number) => void;
}

export const createCreditChecker = (config: CreditCheckerConfig) => {
  const { repository, onCreditDeducted } = config;

  const checkCreditsAvailable = async (
    userId: string | undefined,
    cost: number = 1
  ): Promise<CreditCheckResult> => {
    if (!userId) {
      return { success: false, error: "anonymous_user_blocked" };
    }

    const hasCreditsAvailable = await repository.hasCredits(userId, cost);

    if (!hasCreditsAvailable) {
      return {
        success: false,
        error: "credits_exhausted",
      };
    }

    return { success: true };
  };

  const deductCreditsAfterSuccess = async (
    userId: string | undefined,
    cost: number = 1
  ): Promise<void> => {
    if (!userId) return;

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const result = await repository.deductCredit(userId, cost);
      if (result.success) {
        // Notify subscribers that credits were deducted
        onCreditDeducted?.(userId, cost);
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

