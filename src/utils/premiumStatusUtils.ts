/**
 * Premium Status Utilities
 *
 * Core premium status determination logic
 */

import type { PremiumStatusFetcher } from './types';
import { isGuest } from './authUtils';

/**
 * Get isPremium value with centralized logic
 */
export function getIsPremium(
  isGuestFlag: boolean,
  userId: string | null,
  isPremiumOrFetcher: boolean | PremiumStatusFetcher,
): Promise<boolean> {
  // Guest users NEVER have premium
  if (isGuest(isGuestFlag, userId)) return Promise.resolve(false);

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