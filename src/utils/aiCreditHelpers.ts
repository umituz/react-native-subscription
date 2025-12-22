/**
 * AI Credit Helpers
 *
 * Common patterns for AI generation apps to handle credits.
 * Provides ready-to-use functions for credit checking and deduction.
 *
 * Usage:
 *   import { createAICreditHelpers } from '@umituz/react-native-subscription';
 *
 *   const helpers = createAICreditHelpers({
 *     repository,
 *     imageGenerationTypes: ['future_image', 'santa_transform'],
 *     onCreditDeducted: (userId) => invalidateCache(userId)
 *   });
 */

import type { CreditType } from "../domain/entities/Credits";
import type { CreditsRepository } from "../infrastructure/repositories/CreditsRepository";
import { createCreditChecker } from "./creditChecker";

export interface AICreditHelpersConfig {
  /**
   * Credits repository instance
   */
  repository: CreditsRepository;

  /**
   * List of operation types that should use "image" credits.
   * All other types will use "text" credits.
   * @example ['future_image', 'santa_transform', 'photo_generation']
   */
  imageGenerationTypes: string[];

  /**
   * Optional callback called after successful credit deduction.
   * Use this to invalidate TanStack Query cache or trigger UI updates.
   */
  onCreditDeducted?: (userId: string, creditType: CreditType) => void;
}

export interface AICreditHelpers {
  /**
   * Check if user has credits for a specific generation type
   * @param userId - User ID
   * @param generationType - Type of generation (e.g., 'future_image', 'text_summary')
   * @returns boolean indicating if credits are available
   */
  checkCreditsForGeneration: (
    userId: string | undefined,
    generationType: string
  ) => Promise<boolean>;

  /**
   * Deduct credits after successful generation
   * @param userId - User ID
   * @param generationType - Type of generation that was performed
   */
  deductCreditsForGeneration: (
    userId: string | undefined,
    generationType: string
  ) => Promise<void>;

  /**
   * Get credit type for a generation type (useful for UI display)
   * @param generationType - Type of generation
   * @returns "image" or "text"
   */
  getCreditType: (generationType: string) => CreditType;
}

/**
 * Creates AI-specific credit helper functions
 */
export function createAICreditHelpers(
  config: AICreditHelpersConfig
): AICreditHelpers {
  const { repository, imageGenerationTypes, onCreditDeducted } = config;

  // Map generation type to credit type
  const getCreditType = (generationType: string): CreditType => {
    return imageGenerationTypes.includes(generationType) ? "image" : "text";
  };

  // Create credit checker with the mapping
  const checker = createCreditChecker({
    repository,
    getCreditType,
    onCreditDeducted,
  });

  // Check if credits are available for generation
  const checkCreditsForGeneration = async (
    userId: string | undefined,
    generationType: string
  ): Promise<boolean> => {
    const result = await checker.checkCreditsAvailable(userId, generationType);
    return result.success;
  };

  // Deduct credits after successful generation
  const deductCreditsForGeneration = async (
    userId: string | undefined,
    generationType: string
  ): Promise<void> => {
    const creditType = getCreditType(generationType);
    await checker.deductCreditsAfterSuccess(userId, creditType);
  };

  return {
    checkCreditsForGeneration,
    deductCreditsForGeneration,
    getCreditType,
  };
}
