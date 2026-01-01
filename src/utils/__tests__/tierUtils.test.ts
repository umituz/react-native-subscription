/**
 * Tier Utilities Tests
 * 
 * Tests for tier determination and comparison functions
 */

  getUserTierInfo,
  checkPremiumAccess,
} from '../tierUtils';
  hasTierAccess,
  isTierPremium,
  isTierFreemium,
  isTierGuest,
} from '../userTierUtils';

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
      expect(result.isPremium).toBe(false); // Guest users NEVER have premium
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

  it('should throw error for invalid inputs', () => {
    expect(() => getUserTierInfo('invalid' as any, null, false)).toThrow(TypeError);
    expect(() => getUserTierInfo(true, 123 as any, false)).toThrow(TypeError);
    expect(() => getUserTierInfo(true, null, 'invalid' as any)).toThrow(TypeError);
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

  it('should throw error for invalid inputs', () => {
    expect(() => checkPremiumAccess('invalid' as any, null, true)).toThrow(TypeError);
    expect(() => checkPremiumAccess(true, 123 as any, true)).toThrow(TypeError);
    expect(() => checkPremiumAccess(true, null, 'invalid' as any)).toThrow(TypeError);
  });
});

describe('hasTierAccess', () => {
  it('should return true when tier1 has higher access', () => {
    expect(hasTierAccess('premium', 'freemium')).toBe(true);
    expect(hasTierAccess('premium', 'guest')).toBe(true);
    expect(hasTierAccess('freemium', 'guest')).toBe(true);
  });

  it('should return true when tiers are equal', () => {
    expect(hasTierAccess('premium', 'premium')).toBe(true);
    expect(hasTierAccess('freemium', 'freemium')).toBe(true);
    expect(hasTierAccess('guest', 'guest')).toBe(true);
  });

  it('should return false when tier1 has lower access', () => {
    expect(hasTierAccess('freemium', 'premium')).toBe(false);
    expect(hasTierAccess('guest', 'premium')).toBe(false);
    expect(hasTierAccess('guest', 'freemium')).toBe(false);
  });
});

describe('isTierPremium', () => {
  it('should return true for premium tier', () => {
    expect(isTierPremium('premium')).toBe(true);
  });

  it('should return false for non-premium tiers', () => {
    expect(isTierPremium('freemium')).toBe(false);
    expect(isTierPremium('guest')).toBe(false);
  });
});

describe('isTierFreemium', () => {
  it('should return true for freemium tier', () => {
    expect(isTierFreemium('freemium')).toBe(true);
  });

  it('should return false for non-freemium tiers', () => {
    expect(isTierFreemium('premium')).toBe(false);
    expect(isTierFreemium('guest')).toBe(false);
  });
});

describe('isTierGuest', () => {
  it('should return true for guest tier', () => {
    expect(isTierGuest('guest')).toBe(true);
  });

  it('should return false for non-guest tiers', () => {
    expect(isTierGuest('premium')).toBe(false);
    expect(isTierGuest('freemium')).toBe(false);
  });
});