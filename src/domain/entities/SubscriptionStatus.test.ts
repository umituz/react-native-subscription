import {
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
  calculateDaysRemaining,
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
        status: 'none',
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
});