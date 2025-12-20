/**
 * Tier Comparison Utilities
 *
 * Utilities for comparing and checking user tiers
 */

import type { UserTier } from './types';

/**
 * Compare two tiers to determine if first tier has higher or equal access than second
 * 
 * Tier hierarchy: guest < freemium < premium
 * 
 * @param tier1 - First tier to compare
 * @param tier2 - Second tier to compare
 * @returns Whether tier1 has higher or equal access than tier2
 * 
 * @example
 * ```typescript
 * hasTierAccess('premium', 'freemium'); // true
 * hasTierAccess('freemium', 'premium'); // false
 * hasTierAccess('premium', 'premium'); // true
 * ```
 */
export function hasTierAccess(tier1: UserTier, tier2: UserTier): boolean {
  const tierLevels: Record<UserTier, number> = {
    guest: 0,
    freemium: 1,
    premium: 2,
  };

  return tierLevels[tier1] >= tierLevels[tier2];
}

/**
 * Check if tier is premium
 * 
 * @param tier - Tier to check
 * @returns Whether tier is premium
 * 
 * @example
 * ```typescript
 * isTierPremium('premium'); // true
 * isTierPremium('freemium'); // false
 * ```
 */
export function isTierPremium(tier: UserTier): boolean {
  return tier === 'premium';
}

/**
 * Check if tier is freemium
 * 
 * @param tier - Tier to check
 * @returns Whether tier is freemium
 * 
 * @example
 * ```typescript
 * isTierFreemium('freemium'); // true
 * isTierFreemium('premium'); // false
 * ```
 */
export function isTierFreemium(tier: UserTier): boolean {
  return tier === 'freemium';
}

/**
 * Check if tier is guest
 * 
 * @param tier - Tier to check
 * @returns Whether tier is guest
 * 
 * @example
 * ```typescript
 * isTierGuest('guest'); // true
 * isTierGuest('premium'); // false
 * ```
 */
export function isTierGuest(tier: UserTier): boolean {
  return tier === 'guest';
}