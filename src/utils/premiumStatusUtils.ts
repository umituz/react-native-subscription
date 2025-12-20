/**
 * Premium Status Utilities
 *
 * Core premium status determination logic
 */

import { validateIsGuest, validateUserId, validateFetcher } from './validation';
import type { PremiumStatusFetcher } from './types';

/**
 * Get isPremium value with centralized logic
 * 
 * This function handles the complete logic for determining premium status:
 * - Guest users NEVER have premium (returns false immediately)
 * - Authenticated users: uses provided isPremium value OR fetches using fetcher
 * 
 * This is the SINGLE SOURCE OF TRUTH for isPremium determination.
 * All apps should use this function instead of directly calling their premium service.
 * 
 * Two usage modes:
 * 1. Sync mode: If you already have isPremium value, pass it directly
 * 2. Async mode: If you need to fetch from database, pass a fetcher function
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param isPremiumOrFetcher - Either boolean (sync) or PremiumStatusFetcher (async)
 * @returns boolean (sync) or Promise<boolean> (async) - Whether user has premium subscription
 */
// Sync overload: when isPremium value is already known
export function getIsPremium(
  isGuestFlag: boolean,
  userId: string | null,
  isPremium: boolean,
): boolean;

// Async overload: when fetcher is provided
export function getIsPremium(
  isGuestFlag: boolean,
  userId: string | null,
  fetcher: PremiumStatusFetcher,
): Promise<boolean>;

// Implementation
export function getIsPremium(
  isGuestFlag: boolean,
  userId: string | null,
  isPremiumOrFetcher: boolean | PremiumStatusFetcher,
): boolean | Promise<boolean> {
  validateIsGuest(isGuestFlag);
  validateUserId(userId);

  // Guest users NEVER have premium - this is centralized logic
  if (isGuestFlag || userId === null) {
    return false;
  }

  // Check if it's a boolean (sync mode) or fetcher (async mode)
  if (typeof isPremiumOrFetcher === 'boolean') {
    // Sync mode: return the provided isPremium value
    return isPremiumOrFetcher;
  }

  // Async mode: validate fetcher and fetch premium status
  validateFetcher(isPremiumOrFetcher);

  // Authenticated users: fetch premium status using app's fetcher
  // Package handles the logic, app handles the database operation
  return (async () => {
    try {
      return await isPremiumOrFetcher.isPremium(userId);
    } catch (error) {
      // If fetcher throws, assume not premium (fail-safe)
      // Apps should handle errors in their fetcher implementation
      throw new Error(
        `Failed to fetch premium status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  })();
}