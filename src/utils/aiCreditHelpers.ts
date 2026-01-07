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

import type { CreditsRepository } from "../infrastructure/repositories/CreditsRepository";
import { createCreditChecker } from "./creditChecker";

export interface AICreditHelpersConfig {
  /**
   * Credits repository instance
   */
  repository: CreditsRepository;

  /**
   * Optional map of operation types to credit costs.
   * If an operation isn't in this map, cost defaults to 1.
   * @example { 'high_res_image': 5, 'text_summary': 1 }
   */
  operationCosts?: Record<string, number>;

  /**
   * Optional callback called after successful credit deduction.
   * Use this to invalidate TanStack Query cache or trigger UI updates.
   */
  onCreditDeducted?: (userId: string, cost: number) => void;
}

export interface AICreditHelpers {
  /**
   * Check if user has credits for a specific generation type
   * @param userId - User ID
   * @param generationType - Type of generation
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
   * Get cost for a generation type
   * @param generationType - Type of generation
   * @returns number of credits
   */
  getCost: (generationType: string) => number;
}

/**
 * Creates AI-specific credit helper functions
 */
export function createAICreditHelpers(
  config: AICreditHelpersConfig
): AICreditHelpers {
  const { repository, operationCosts = {}, onCreditDeducted } = config;

  // Map generation type to cost
  const getCost = (generationType: string): number => {
    return operationCosts[generationType] ?? 1;
  };

  // Create credit checker
  const checker = createCreditChecker({
    repository,
    onCreditDeducted,
  });

  // Check if credits are available for generation
  const checkCreditsForGeneration = async (
    userId: string | undefined,
    generationType: string
  ): Promise<boolean> => {
    const cost = getCost(generationType);
    const result = await checker.checkCreditsAvailable(userId, cost);
    return result.success;
  };

  // Deduct credits after successful generation
  const deductCreditsForGeneration = async (
    userId: string | undefined,
    generationType: string
  ): Promise<void> => {
    const cost = getCost(generationType);
    await checker.deductCreditsAfterSuccess(userId, cost);
  };

  return {
    checkCreditsForGeneration,
    deductCreditsForGeneration,
    getCost,
  };
}
