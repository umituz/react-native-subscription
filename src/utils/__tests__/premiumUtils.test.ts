/**
 * Premium Utilities Tests
 * 
 * Tests for premium status fetching and async functions
 */

import {
  getIsPremium,
} from '../premiumStatusUtils';
import {
  getUserTierInfoAsync,
  checkPremiumAccessAsync,
} from '../premiumAsyncUtils';
import type { PremiumStatusFetcher } from '../types';

describe('getIsPremium', () => {
  describe('Sync mode (boolean isPremium)', () => {
    it('should return false for guest users', () => {
      const result = getIsPremium(true, null, true);
      expect(result).toBe(false);
    });

    it('should return false when userId is null', () => {
      const result = getIsPremium(false, null, true);
      expect(result).toBe(false);
    });

    it('should return true when isPremium is true', () => {
      const result = getIsPremium(false, 'user123', true);
      expect(result).toBe(true);
    });

    it('should return false when isPremium is false', () => {
      const result = getIsPremium(false, 'user123', false);
      expect(result).toBe(false);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => getIsPremium('invalid' as any, null, true)).toThrow(TypeError);
      expect(() => getIsPremium(true, 123 as any, true)).toThrow(TypeError);
    });
  });

  describe('Async mode (fetcher)', () => {
    const mockFetcher: PremiumStatusFetcher = {
      isPremium: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return false for guest users without calling fetcher', async () => {
      const result = await getIsPremium(true, null, mockFetcher);
      expect(result).toBe(false);
      expect(mockFetcher.isPremium).not.toHaveBeenCalled();
    });

    it('should return false when userId is null without calling fetcher', async () => {
      const result = await getIsPremium(false, null, mockFetcher);
      expect(result).toBe(false);
      expect(mockFetcher.isPremium).not.toHaveBeenCalled();
    });

    it('should call fetcher for authenticated users', async () => {
      (mockFetcher.isPremium as jest.Mock).mockResolvedValue(true);
      
      const result = await getIsPremium(false, 'user123', mockFetcher);
      expect(result).toBe(true);
      expect(mockFetcher.isPremium).toHaveBeenCalledWith('user123');
      expect(mockFetcher.isPremium).toHaveBeenCalledTimes(1);
    });

    it('should return false when fetcher returns false', async () => {
      (mockFetcher.isPremium as jest.Mock).mockResolvedValue(false);
      
      const result = await getIsPremium(false, 'user123', mockFetcher);
      expect(result).toBe(false);
      expect(mockFetcher.isPremium).toHaveBeenCalledWith('user123');
    });

    it('should throw error when fetcher throws Error', async () => {
      const error = new Error('Database error');
      (mockFetcher.isPremium as jest.Mock).mockRejectedValue(error);
      
      await expect(getIsPremium(false, 'user123', mockFetcher)).rejects.toThrow(
        'Failed to fetch premium status: Database error'
      );
    });

    it('should throw error when fetcher throws non-Error', async () => {
      const error = 'String error';
      (mockFetcher.isPremium as jest.Mock).mockRejectedValue(error);
      
      await expect(getIsPremium(false, 'user123', mockFetcher)).rejects.toThrow(
        'Failed to fetch premium status: String error'
      );
    });

    it('should throw error for invalid inputs', () => {
      // Invalid isGuest/userId - validation happens before async check (sync)
      expect(() => getIsPremium('invalid' as any, null, mockFetcher)).toThrow(TypeError);
      expect(() => getIsPremium(true, 123 as any, mockFetcher)).toThrow(TypeError);
      
      // Invalid fetcher - validation happens in async mode but throws sync
      // Use authenticated user (not guest) to reach fetcher validation
      expect(() => getIsPremium(false, 'user123', null as any)).toThrow(TypeError);
      expect(() => getIsPremium(false, 'user123', {} as any)).toThrow(TypeError);
    });
  });
});

describe('getUserTierInfoAsync', () => {
  const mockFetcher: PremiumStatusFetcher = {
    isPremium: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return guest tier for guest users', async () => {
    const result = await getUserTierInfoAsync(true, null, mockFetcher);
    expect(result.tier).toBe('guest');
    expect(result.isPremium).toBe(false);
    expect(mockFetcher.isPremium).not.toHaveBeenCalled();
  });

  it('should return premium tier when fetcher returns true', async () => {
    (mockFetcher.isPremium as jest.Mock).mockResolvedValue(true);
    
    const result = await getUserTierInfoAsync(false, 'user123', mockFetcher);
    expect(result.tier).toBe('premium');
    expect(result.isPremium).toBe(true);
    expect(result.isGuest).toBe(false);
    expect(result.isAuthenticated).toBe(true);
  });

  it('should return freemium tier when fetcher returns false', async () => {
    (mockFetcher.isPremium as jest.Mock).mockResolvedValue(false);
    
    const result = await getUserTierInfoAsync(false, 'user123', mockFetcher);
    expect(result.tier).toBe('freemium');
    expect(result.isPremium).toBe(false);
    expect(result.isGuest).toBe(false);
    expect(result.isAuthenticated).toBe(true);
  });
});

describe('checkPremiumAccessAsync', () => {
  const mockFetcher: PremiumStatusFetcher = {
    isPremium: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false for guest users', async () => {
    const result = await checkPremiumAccessAsync(true, null, mockFetcher);
    expect(result).toBe(false);
    expect(mockFetcher.isPremium).not.toHaveBeenCalled();
  });

  it('should return true when fetcher returns true', async () => {
    (mockFetcher.isPremium as jest.Mock).mockResolvedValue(true);
    
    const result = await checkPremiumAccessAsync(false, 'user123', mockFetcher);
    expect(result).toBe(true);
  });

  it('should return false when fetcher returns false', async () => {
    (mockFetcher.isPremium as jest.Mock).mockResolvedValue(false);
    
    const result = await checkPremiumAccessAsync(false, 'user123', mockFetcher);
    expect(result).toBe(false);
  });
});