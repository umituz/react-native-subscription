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
  isGuestFlag: boolean,
  userId: string | null,
  isPremiumOrFetcher: boolean | PremiumStatusFetcher,
): boolean | Promise<boolean> {
  // Guest users NEVER have premium
  if (isGuestFlag || userId === null) return false;

  // Sync mode: return the provided isPremium value
  if (typeof isPremiumOrFetcher === 'boolean') return isPremiumOrFetcher;

  // Async mode: fetch premium status
  return (async () => {
    try {
      return await isPremiumOrFetcher.isPremium(userId);
    } catch (error) {
      throw new Error(
        `Failed to fetch premium status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  })();
}