/**
 * Premium Utilities Tests
 *
 * Tests for premium status fetching and async functions
 */

import { getIsPremium } from '../premiumStatusUtils';
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
  });
});
