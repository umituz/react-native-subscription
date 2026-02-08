import { 
  SUBSCRIPTION_STATUS,
} from './SubscriptionConstants';
import {
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
  calculateDaysRemaining,
  resolveSubscriptionStatus,
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
        status: SUBSCRIPTION_STATUS.NONE,
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

    it('should return false for expired subscription', () => {
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
      
      expect(isSubscriptionValid(status)).toBe(false);
    });
  });

  describe('calculateDaysRemaining', () => {
    it('should return null for null input', () => {
      expect(calculateDaysRemaining(null)).toBeNull();
    });

    it('should return positive days for future expiration', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(calculateDaysRemaining(futureDate.toISOString())).toBe(5);
    });

    it('should return 0 for past expiration', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(calculateDaysRemaining(pastDate.toISOString())).toBe(0);
    });
  });

  describe('resolveSubscriptionStatus', () => {
    it('should return NONE when not premium', () => {
      expect(resolveSubscriptionStatus({ isPremium: false })).toBe(SUBSCRIPTION_STATUS.NONE);
    });

    it('should return EXPIRED when expired', () => {
      expect(resolveSubscriptionStatus({ isPremium: true, isExpired: true })).toBe(SUBSCRIPTION_STATUS.EXPIRED);
    });

    it('should return TRIAL when trialing and set to renew', () => {
      expect(resolveSubscriptionStatus({
        isPremium: true,
        periodType: 'TRIAL',
        willRenew: true
      })).toBe(SUBSCRIPTION_STATUS.TRIAL);
    });

    it('should return TRIAL_CANCELED when trialing and will not renew', () => {
      expect(resolveSubscriptionStatus({
        isPremium: true,
        periodType: 'TRIAL',
        willRenew: false
      })).toBe(SUBSCRIPTION_STATUS.TRIAL_CANCELED);
    });

    it('should return ACTIVE when premium, not expired, not trial, and set to renew', () => {
      expect(resolveSubscriptionStatus({
        isPremium: true,
        willRenew: true
      })).toBe(SUBSCRIPTION_STATUS.ACTIVE);
    });

    it('should return CANCELED when premium, not expired, not trial, and will not renew', () => {
      expect(resolveSubscriptionStatus({
        isPremium: true,
        willRenew: false
      })).toBe(SUBSCRIPTION_STATUS.CANCELED);
    });
  });
});