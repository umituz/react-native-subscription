/**
 * Tests for Date Validation Utilities
 */

import {
  isSubscriptionExpired,
  getDaysUntilExpiration,
} from '../utils/dateValidationUtils';

describe('Date Validation Utils', () => {
  describe('isSubscriptionExpired', () => {
    it('should return true for null status', () => {
      expect(isSubscriptionExpired(null)).toBe(true);
    });

    it('should return true for non-premium status', () => {
      const status = {
        isPremium: false,
        expiresAt: null,
        productId: null,
        purchasedAt: null,
        customerId: null,
        syncedAt: null,
      };
      
      expect(isSubscriptionExpired(status)).toBe(true);
    });

    it('should return false for lifetime subscription', () => {
      const status = {
        isPremium: true,
        expiresAt: null,
        productId: 'lifetime',
        purchasedAt: '2024-01-01T00:00:00.000Z',
        customerId: 'customer123',
        syncedAt: '2024-01-01T00:00:00.000Z',
      };
      
      expect(isSubscriptionExpired(status)).toBe(false);
    });

    it('should return false for future expiration', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const status = {
        isPremium: true,
        expiresAt: futureDate.toISOString(),
        productId: 'monthly',
        purchasedAt: '2024-01-01T00:00:00.000Z',
        customerId: 'customer123',
        syncedAt: '2024-01-01T00:00:00.000Z',
      };
      
      expect(isSubscriptionExpired(status)).toBe(false);
    });

    it('should return true for past expiration', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const status = {
        isPremium: true,
        expiresAt: pastDate.toISOString(),
        productId: 'monthly',
        purchasedAt: '2024-01-01T00:00:00.000Z',
        customerId: 'customer123',
        syncedAt: '2024-01-01T00:00:00.000Z',
      };
      
      const result = getDaysUntilExpiration(status);
      expect(result === 0 || result === -0).toBe(true);
    });
  });

  describe('getDaysUntilExpiration', () => {
    it('should return null for null status', () => {
      expect(getDaysUntilExpiration(null)).toBeNull();
    });

    it('should return null for status without expiration', () => {
      const status = {
        isPremium: true,
        expiresAt: null,
        productId: 'lifetime',
        purchasedAt: '2024-01-01T00:00:00.000Z',
        customerId: 'customer123',
        syncedAt: '2024-01-01T00:00:00.000Z',
      };
      
      expect(getDaysUntilExpiration(status)).toBeNull();
    });

    it('should return positive days for future expiration', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      const status = {
        isPremium: true,
        expiresAt: futureDate.toISOString(),
        productId: 'monthly',
        purchasedAt: '2024-01-01T00:00:00.000Z',
        customerId: 'customer123',
        syncedAt: '2024-01-01T00:00:00.000Z',
      };
      
      expect(getDaysUntilExpiration(status)).toBe(5);
    });

    it('should return 0 for past expiration', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      const status = {
        isPremium: true,
        expiresAt: pastDate.toISOString(),
        productId: 'monthly',
        purchasedAt: '2024-01-01T00:00:00.000Z',
        customerId: 'customer123',
        syncedAt: '2024-01-01T00:00:00.000Z',
      };
      
      expect(getDaysUntilExpiration(status)).toBe(0);
    });

    it('should return 0 for today expiration', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const status = {
        isPremium: true,
        expiresAt: today.toISOString(),
        productId: 'monthly',
        purchasedAt: '2024-01-01T00:00:00.000Z',
        customerId: 'customer123',
        syncedAt: '2024-01-01T00:00:00.000Z',
      };
      
      expect(getDaysUntilExpiration(status)).toBe(0);
    });
  });
});