/**
 * Credit Calculation Utilities
 * Centralized logic for credit mathematical operations
 */

export const calculateCreditPercentage = (
  currentCredits: number | null | undefined,
  creditLimit: number
): number => {
  if (currentCredits === null || currentCredits === undefined || creditLimit <= 0) {
    return 0;
  }
  
  const percent = Math.round((currentCredits / creditLimit) * 100);
  return Math.min(Math.max(percent, 0), 100); // Clamp between 0-100
};

export const canAffordCost = (
  currentCredits: number | null | undefined,
  cost: number
): boolean => {
  if (currentCredits === null || currentCredits === undefined) {
    return false;
  }
  return currentCredits >= cost;
};

export const calculateRemainingCredits = (
  currentCredits: number,
  cost: number
): number => {
  return Math.max(0, currentCredits - cost);
};
