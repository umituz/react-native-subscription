/**
 * Credits Domain Entities
 *
 * Generic credit system types for subscription-based apps.
 * Designed to be used across hundreds of apps with configurable limits.
 */

export type CreditType = "text" | "image";

export interface UserCredits {
  textCredits: number;
  imageCredits: number;
  purchasedAt: Date;
  lastUpdatedAt: Date;
}

export interface CreditsConfig {
  collectionName: string;
  textCreditLimit: number;
  imageCreditLimit: number;
  /** When true, stores credits at users/{userId}/credits instead of {collectionName}/{userId} */
  useUserSubcollection?: boolean;
}

export interface CreditsResult<T = UserCredits> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface DeductCreditsResult {
  success: boolean;
  remainingCredits?: number;
  error?: {
    message: string;
    code: string;
  };
}

export const DEFAULT_CREDITS_CONFIG: CreditsConfig = {
  collectionName: "user_credits",
  textCreditLimit: 1000,
  imageCreditLimit: 100,
};
