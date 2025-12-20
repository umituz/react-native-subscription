/**
 * Credits Package Entity
 * Represents a credit package for purchase
 */

export interface CreditsPackage {
  id: string;
  credits: number;
  price: number;
  priceString?: string;
  currency: string;
  bonus?: number;
  popular?: boolean;
  badge?: string;
  description?: string;
}
