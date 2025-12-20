/**
 * Price Formatting Utilities
 */

/**
 * Format price for display
 * @param price - Price value
 * @param currencyCode - Currency code (e.g., 'USD', 'EUR')
 * @returns Formatted price string
 */
export function formatPrice(price: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(price);
  } catch {
    return `${currencyCode} ${price.toFixed(2)}`;
  }
}
