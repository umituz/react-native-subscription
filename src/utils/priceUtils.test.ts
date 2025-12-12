/**
 * Tests for Price Utilities
 */

import { formatPrice } from '../utils/priceUtils';

describe('Price Utils', () => {
  describe('formatPrice', () => {
    it('should format USD price', () => {
      expect(formatPrice(9.99, 'USD')).toBe('$9.99');
    });

    it('should format EUR price', () => {
      expect(formatPrice(19.99, 'EUR')).toMatch(/€19\.99/);
    });

    it('should format TRY price', () => {
      const result = formatPrice(229.99, 'TRY');
      expect(result).toBeTruthy();
      expect(result).toContain('229.99');
    });

    it('should format whole numbers', () => {
      expect(formatPrice(10, 'USD')).toBe('$10.00');
    });

    it('should handle zero price', () => {
      expect(formatPrice(0, 'USD')).toBe('$0.00');
    });

    it('should format large numbers', () => {
      expect(formatPrice(999.99, 'USD')).toBe('$999.99');
    });
  });
});