/**
 * Wallet Types
 *
 * Types for wallet configuration and product metadata.
 * Generic types for use across hundreds of apps.
 */

export interface WalletConfig {
  transactionCollectionName: string;
  productMetadataCollectionName: string;
  useUserSubcollection?: boolean;
  cacheTTL?: number;
}

export type ProductType = "credits" | "subscription";

export interface ProductMetadata {
  productId: string;
  type: ProductType;
  name: string;
  description?: string;
  credits?: number;
  bonus?: number;
  popular?: boolean;
  features?: string[];
  order?: number;
}

export interface ProductMetadataConfig {
  collectionName: string;
  cacheTTL?: number;
}

export interface CreditBalance {
  credits: number;
  textCredits?: number;
  imageCredits?: number;
}

export interface WalletTranslations {
  title: string;
  balance: string;
  availableCredits: string;
  transactionHistory: string;
  noTransactions: string;
  loading: string;
  purchase: string;
  packages: string;
  viewHistory: string;
}
