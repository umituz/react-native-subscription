/**
 * Tests for Date Utilities
 */

import {
  formatExpirationDate,
  calculateExpirationDate,
} from '../utils/dateUtils';
import { SUBSCRIPTION_PLAN_TYPES } from '../utils/subscriptionConstants';

describe('Date Utils', () => {
  describe('formatExpirationDate', () => {
    it('should return null for null expiration', () => {
      expect(formatExpirationDate(null)).toBeNull();
    });

    it('should format date correctly', () => {
      const date = '2024-12-25T00:00:00.000Z';
      const formatted = formatExpirationDate(date);
      
      expect(formatted).toMatch(/December 25, 2024/);
    });

    it('should use custom locale', () => {
      const date = '2024-12-25T00:00:00.000Z';
      const formatted = formatExpirationDate(date, 'tr-TR');
      
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should return null for invalid date', () => {
      const formatted = formatExpirationDate('invalid-date');
      expect(formatted).toBeNull();
    });
  });

  describe('calculateExpirationDate', () => {
    beforeEach(() => {
      // Mock current date for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return null for null productId', () => {
      expect(calculateExpirationDate(null)).toBeNull();
      expect(calculateExpirationDate('')).toBeNull();
      expect(calculateExpirationDate(undefined)).toBeNull();
    });

    it('should calculate weekly expiration', () => {
      const result = calculateExpirationDate('com.app.weekly');
      const expectedDate = new Date('2024-01-22T00:00:00.000Z');
      
      expect(result).toBe(expectedDate.toISOString());
    });

    it('should calculate monthly expiration', () => {
      const result = calculateExpirationDate('com.app.monthly');
      const expectedDate = new Date('2024-02-15T00:00:00.000Z');
      
      expect(result).toBe(expectedDate.toISOString());
    });

    it('should calculate yearly expiration', () => {
      const result = calculateExpirationDate('com.app.yearly');
      const expectedDate = new Date('2025-01-15T00:00:00.000Z');
      
      expect(result).toBe(expectedDate.toISOString());
    });

    it('should default to monthly for unknown plan', () => {
      const result = calculateExpirationDate('com.app.unknown');
      const expectedDate = new Date('2024-02-15T00:00:00.000Z');
      
      expect(result).toBe(expectedDate.toISOString());
    });

    it('should trust valid RevenueCat date', () => {
      const futureDate = new Date('2024-02-20T00:00:00.000Z');
      const result = calculateExpirationDate('com.app.monthly', futureDate.toISOString());
      
      expect(result).toBe(futureDate.toISOString());
    });

    it('should ignore RevenueCat date if too short (sandbox)', () => {
      const nearFutureDate = new Date('2024-01-16T00:00:00.000Z'); // Only 1 day
      const result = calculateExpirationDate('com.app.monthly', nearFutureDate.toISOString());
      
      // Should calculate manually instead of using RevenueCat date
      const expectedDate = new Date('2024-02-15T00:00:00.000Z');
      expect(result).toBe(expectedDate.toISOString());
    });

    it('should ignore past RevenueCat date', () => {
      const pastDate = new Date('2024-01-10T00:00:00.000Z');
      const result = calculateExpirationDate('com.app.monthly', pastDate.toISOString());
      
      // Should calculate manually instead of using RevenueCat date
      const expectedDate = new Date('2024-02-15T00:00:00.000Z');
      expect(result).toBe(expectedDate.toISOString());
    });

    it('should handle invalid RevenueCat date', () => {
      const result = calculateExpirationDate('com.app.monthly', 'invalid-date');
      
      // Should calculate manually instead of using RevenueCat date
      const expectedDate = new Date('2024-02-15T00:00:00.000Z');
      expect(result).toBe(expectedDate.toISOString());
    });
  });
});