/**
 * Price Utilities
 * Subscription price-related helper functions
 *
 * Following SOLID, DRY, KISS principles:
 * - Single Responsibility: Only price-related operations
 * - DRY: No code duplication
 * - KISS: Simple, clear implementations
 */

import { DATE_CONSTANTS } from './subscriptionConstants';

/**
 * Format price for display
 * Formats a price value with currency code using Intl.NumberFormat
 *
 * @param price - Price value (e.g., 9.99)
 * @param currencyCode - ISO 4217 currency code (e.g., "USD", "EUR", "TRY")
 * @returns Formatted price string (e.g., "$9.99", "€9.99", "₺9.99")
 *
 * @example
 * formatPrice(9.99, "USD") // Returns: "$9.99"
 * formatPrice(229.99, "TRY") // Returns: "₺229.99"
 */
export function formatPrice(price: number, currencyCode: string): string {
  return new Intl.NumberFormat(DATE_CONSTANTS.DEFAULT_LOCALE, {
    style: 'currency',
    currency: currencyCode,
  }).format(price);
}

