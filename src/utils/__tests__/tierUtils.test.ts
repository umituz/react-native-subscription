/**
 * Tier Utilities Tests
 *
 * Tests for tier determination and comparison functions
 */

import { getUserTierInfo, checkPremiumAccess } from '../tierUtils';

describe('getUserTierInfo', () => {
  describe('Guest users', () => {
    it('should return guest tier when isGuest is true', () => {
      const result = getUserTierInfo(true, null, false);
      expect(result.tier).toBe('guest');
      expect(result.isPremium).toBe(false);
      expect(result.isGuest).toBe(true);
      expect(result.isAuthenticated).toBe(false);
      expect(result.userId).toBe(null);
    });

    it('should return guest tier when userId is null', () => {
      const result = getUserTierInfo(false, null, false);
      expect(result.tier).toBe('guest');
      expect(result.isPremium).toBe(false);
      expect(result.isGuest).toBe(true);
      expect(result.isAuthenticated).toBe(false);
      expect(result.userId).toBe(null);
    });

    it('should ignore isPremium for guest users', () => {
      const result = getUserTierInfo(true, null, true);
      expect(result.tier).toBe('guest');
      expect(result.isPremium).toBe(false);
    });
  });

  describe('Authenticated users', () => {
    it('should return premium tier for authenticated premium users', () => {
      const result = getUserTierInfo(false, 'user123', true);
      expect(result.tier).toBe('premium');
      expect(result.isPremium).toBe(true);
      expect(result.isGuest).toBe(false);
      expect(result.isAuthenticated).toBe(true);
      expect(result.userId).toBe('user123');
    });

    it('should return freemium tier for authenticated non-premium users', () => {
      const result = getUserTierInfo(false, 'user123', false);
      expect(result.tier).toBe('freemium');
      expect(result.isPremium).toBe(false);
      expect(result.isGuest).toBe(false);
      expect(result.isAuthenticated).toBe(true);
      expect(result.userId).toBe('user123');
    });
  });
});

describe('checkPremiumAccess', () => {
  it('should return false for guest users', () => {
    expect(checkPremiumAccess(true, null, true)).toBe(false);
    expect(checkPremiumAccess(true, null, false)).toBe(false);
  });

  it('should return false when userId is null', () => {
    expect(checkPremiumAccess(false, null, true)).toBe(false);
  });

  it('should return true for authenticated premium users', () => {
    expect(checkPremiumAccess(false, 'user123', true)).toBe(true);
  });

  it('should return false for authenticated freemium users', () => {
    expect(checkPremiumAccess(false, 'user123', false)).toBe(false);
  });
});
