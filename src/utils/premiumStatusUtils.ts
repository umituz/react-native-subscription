/**
 * Premium Status Utilities
 *
 * Core premium status determination logic
 */

import type { PremiumStatusFetcher } from './types';


/**
 * Get isPremium value with centralized logic
 */
export function getIsPremium(
  isAnonymous: boolean,
  userId: string | null,
  isPremiumOrFetcher: boolean | PremiumStatusFetcher,
): Promise<boolean> {
  // Anonymous users NEVER have premium
  if (isAnonymous || userId === null) return Promise.resolve(false);

  // Sync mode: return the provided isPremium value
  if (typeof isPremiumOrFetcher === 'boolean') return Promise.resolve(isPremiumOrFetcher);

  // Async mode: fetch premium status
  return (async () => {
    try {
      return await isPremiumOrFetcher.isPremium(userId!);
    } catch (error) {
      throw new Error(
        `Failed to fetch premium status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  })();
}