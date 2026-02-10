/**
 * Credit Calculation Utilities
 * Centralized logic for credit mathematical operations
 * Uses shared number utilities for consistency
 */

import { calculateCreditPercentage as calcPct, canAfford as canAffordCheck, calculateRemaining } from "../../../shared/utils/numberUtils";

export const calculateCreditPercentage = (
  currentCredits: number | null | undefined,
  creditLimit: number
): number => {
  return calcPct(currentCredits, creditLimit);
};

export const canAffordCost = (
  currentCredits: number | null | undefined,
  cost: number
): boolean => {
  return canAffordCheck(currentCredits, cost);
};

export const calculateRemainingCredits = (
  currentCredits: number,
  cost: number
): number => {
  return calculateRemaining(currentCredits, cost);
};
