/**
 * Async Premium Utilities
 *
 * Async premium status fetching and tier determination
 */

import { getIsPremium } from './premiumStatusUtils';
import type { PremiumStatusFetcher } from './types';

/**
 * Get user tier info asynchronously with fetcher
 * 
 * This function combines getUserTierInfo and getIsPremium logic.
 * All tier determination logic is centralized here.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param fetcher - Premium status fetcher (app-specific implementation)
 * @returns Promise<UserTierInfo> - User tier information
 */
export async function getUserTierInfoAsync(
  isGuestFlag: boolean,
  userId: string | null,
  fetcher: PremiumStatusFetcher,
): Promise<import('./types').UserTierInfo> {
  // Import here to avoid circular dependency
  const { getUserTierInfo } = await import('./tierUtils');
  
  // Get isPremium using centralized logic (async mode)
  const isPremium = await getIsPremium(isGuestFlag, userId, fetcher);
  
  // Get tier info using centralized logic
  return getUserTierInfo(isGuestFlag, userId, isPremium);
}

/**
 * Check if user has premium access (async version with fetcher)
 * 
 * This function combines getIsPremium and checkPremiumAccess logic.
 * Guest users NEVER have premium access.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param fetcher - Premium status fetcher (app-specific implementation)
 * @returns Promise<boolean> - Whether user has premium access
 */
export async function checkPremiumAccessAsync(
  isGuestFlag: boolean,
  userId: string | null,
  fetcher: PremiumStatusFetcher,
): Promise<boolean> {
  // Import here to avoid circular dependency
  const { checkPremiumAccess } = await import('./tierUtils');
  
  // Get isPremium using centralized logic (async mode)
  const isPremium = await getIsPremium(isGuestFlag, userId, fetcher);
  
  // Apply premium access check logic
  return checkPremiumAccess(isGuestFlag, userId, isPremium);
}