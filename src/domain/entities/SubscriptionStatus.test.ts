/**
 * Tests for Subscription Status Entity
 */

import {
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
} from './SubscriptionStatus';

describe('SubscriptionStatus', () => {
  describe('createDefaultSubscriptionStatus', () => {
    it('should create default subscription status', () => {
      const status = createDefaultSubscriptionStatus();
      
      expect(status).toEqual({
        isPremium: false,
        expiresAt: null,
        productId: null,
        purchasedAt: null,
        customerId: null,
        syncedAt: null,
      });
    });
  });

  describe('isSubscriptionValid', () => {
    it('should return false for null status', () => {
      expect(isSubscriptionValid(null)).toBe(false);
    });

    it('should return false for non-premium status', () => {
      const status = {
        isPremium: false,
        expiresAt: null,
        productId: null,
        purchasedAt: null,
        customerId: null,
        syncedAt: null,
      };
      
      expect(isSubscriptionValid(status)).toBe(false);
    });

    it('should return true for lifetime subscription', () => {
      const status = {
        isPremium: true,
        expiresAt: null,
        productId: 'lifetime',
        purchasedAt: '2024-01-01T00:00:00.000Z',
        customerId: 'customer123',
        syncedAt: '2024-01-01T00:00:00.000Z',
      };
      
      expect(isSubscriptionValid(status)).toBe(true);
    });

    it('should return true for active subscription', () => {
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
      
      expect(isSubscriptionValid(status)).toBe(true);
    });

    it('should return true for subscription expired within 24 hour buffer', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      pastDate.setHours(pastDate.getHours() + 1); // 23 hours ago
      
      const status = {
        isPremium: true,
        expiresAt: pastDate.toISOString(),
        productId: 'monthly',
        purchasedAt: '2024-01-01T00:00:00.000Z',
        customerId: 'customer123',
        syncedAt: '2024-01-01T00:00:00.000Z',
      };
      
      expect(isSubscriptionValid(status)).toBe(true);
    });

    it('should return false for expired subscription beyond buffer', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      
      const status = {
        isPremium: true,
        expiresAt: pastDate.toISOString(),
        productId: 'monthly',
        purchasedAt: '2024-01-01T00:00:00.000Z',
        customerId: 'customer123',
        syncedAt: '2024-01-01T00:00:00.000Z',
      };
      
      expect(isSubscriptionValid(status)).toBe(false);
    });
  });
});