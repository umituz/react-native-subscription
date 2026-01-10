/**
 * User Tier Validation Tests
 *
 * Tests for validation functions and type guards
 */

import {
  isValidUserTier,
  isUserTierInfo,
  validateUserId,
  validateIsGuest,
  validateIsPremium,
  validateFetcher,
} from '../validation';
import type { UserTierInfo, PremiumStatusFetcher } from '../types';

describe('isValidUserTier', () => {
  it('should return true for valid tiers', () => {
    expect(isValidUserTier('guest')).toBe(true);
    expect(isValidUserTier('freemium')).toBe(true);
    expect(isValidUserTier('premium')).toBe(true);
  });

  it('should return false for invalid values', () => {
    expect(isValidUserTier('invalid')).toBe(false);
    expect(isValidUserTier('')).toBe(false);
    expect(isValidUserTier(null)).toBe(false);
    expect(isValidUserTier(undefined)).toBe(false);
    expect(isValidUserTier(123)).toBe(false);
    expect(isValidUserTier({})).toBe(false);
  });
});

describe('isUserTierInfo', () => {
  it('should return true for valid UserTierInfo', () => {
    const validInfo: UserTierInfo = {
      tier: 'premium',
      isPremium: true,
      isGuest: false,
      isAuthenticated: true,
      userId: 'user123',
    };
    expect(isUserTierInfo(validInfo)).toBe(true);
  });

  it('should return false for invalid objects', () => {
    expect(isUserTierInfo(null)).toBe(false);
    expect(isUserTierInfo(undefined)).toBe(false);
    expect(isUserTierInfo('string')).toBe(false);
    expect(isUserTierInfo({})).toBe(false);
    expect(isUserTierInfo({ tier: 'invalid' })).toBe(false);
    expect(isUserTierInfo({ tier: 'premium' })).toBe(false);
  });
});

describe('validateUserId', () => {
  it('should not throw for valid userId', () => {
    expect(() => validateUserId('user123')).not.toThrow();
    expect(() => validateUserId(null)).not.toThrow();
  });

  it('should throw for invalid userId', () => {
    expect(() => validateUserId('')).toThrow(TypeError);
    expect(() => validateUserId('   ')).toThrow(TypeError);
  });
});

describe('validateIsGuest', () => {
  it('should not throw for valid isGuest', () => {
    expect(() => validateIsGuest(true)).not.toThrow();
    expect(() => validateIsGuest(false)).not.toThrow();
  });

  it('should throw for invalid isGuest', () => {
    expect(() => validateIsGuest('true' as unknown as boolean)).toThrow(TypeError);
    expect(() => validateIsGuest(1 as unknown as boolean)).toThrow(TypeError);
  });
});

describe('validateIsPremium', () => {
  it('should not throw for valid isPremium', () => {
    expect(() => validateIsPremium(true)).not.toThrow();
    expect(() => validateIsPremium(false)).not.toThrow();
  });

  it('should throw for invalid isPremium', () => {
    expect(() => validateIsPremium('true' as unknown as boolean)).toThrow(TypeError);
    expect(() => validateIsPremium(1 as unknown as boolean)).toThrow(TypeError);
  });
});

describe('validateFetcher', () => {
  it('should not throw for valid fetcher', () => {
    const validFetcher: PremiumStatusFetcher = {
      isPremium: async () => true,
    };
    expect(() => validateFetcher(validFetcher)).not.toThrow();
  });

  it('should throw for invalid fetcher', () => {
    expect(() => validateFetcher(null as unknown as PremiumStatusFetcher)).toThrow(TypeError);
    expect(() => validateFetcher({} as unknown as PremiumStatusFetcher)).toThrow(TypeError);
    expect(() => validateFetcher({ isPremium: 'not a function' } as unknown as PremiumStatusFetcher)).toThrow(TypeError);
  });
});
