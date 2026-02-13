import { isValidNumber, isNonNegativeNumber } from "../../../shared/utils/validators";

export const isValidBalance = (balance: number | null | undefined): balance is number => {
  return isValidNumber(balance) && isNonNegativeNumber(balance);
};

export const isValidCost = (cost: number): boolean => {
  return isValidNumber(cost) && isNonNegativeNumber(cost);
};

export const isValidMaxCredits = (max: number): boolean => {
  return isValidNumber(max) && max > 0;
};

export const canAffordAmount = (balance: number | null | undefined, cost: number): boolean => {
  if (!isValidBalance(balance) || !isValidCost(cost)) return false;
  return balance >= cost;
};

export const calculateSafePercentage = (
  current: number | null | undefined,
  max: number
): number => {
  if (!isValidNumber(current) || !isValidMaxCredits(max)) return 0;
  const percentage = (current / max) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};
