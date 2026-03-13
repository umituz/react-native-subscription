/**
 * Credit calculation utilities
 * All credit-related calculations consolidated in one place
 */

import type { CreditsConfig } from "../core/Credits";
import { isValidNumber, isNonNegativeNumber } from "../../../shared/utils/validators";
import { detectPackageType } from "../../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../../utils/creditMapper";
import { resolveSubscriptionStatus } from "../../subscription/core/SubscriptionStatus";
import { isPast } from "../../../utils/dateUtils";
import type { CalculateCreditsParams } from "../application/creditOperationUtils.types";

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

const isValidBalance = (balance: number | null | undefined): balance is number => {
  return isValidNumber(balance) && isNonNegativeNumber(balance);
};

const isValidCost = (cost: number): boolean => {
  return isValidNumber(cost) && isNonNegativeNumber(cost);
};

const isValidMaxCredits = (max: number): boolean => {
  return isValidNumber(max) && max > 0;
};

// ============================================================================
// CREDIT AMOUNT CALCULATIONS
// ============================================================================

/**
 * Calculate remaining credits after a deduction
 * Ensures result is never negative (minimum 0)
 */
export function calculateRemaining(current: number, cost: number): number {
  return Math.max(0, current - cost);
}

/**
 * Check if a balance can afford a cost
 * Returns false if balance is invalid or insufficient
 */
export function canAffordAmount(
  balance: number | null | undefined,
  cost: number
): boolean {
  if (!isValidBalance(balance) || !isValidCost(cost)) return false;
  return balance >= cost;
}

/**
 * Calculate percentage of current vs max credits
 * Returns 0 for invalid inputs, clamped between 0-100
 */
export function calculateSafePercentage(
  current: number | null | undefined,
  max: number
): number {
  if (!isValidNumber(current) || !isValidMaxCredits(max)) return 0;
  const percentage = (current / max) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

/**
 * Calculate credit limit for a product ID
 * Throws if product ID is missing or limit cannot be determined
 */
export function calculateCreditLimit(
  productId: string | undefined,
  config: CreditsConfig
): number {
  if (!productId) {
    throw new Error(
      "[CreditCalculations] Cannot calculate credit limit without productId"
    );
  }

  // Check for explicit amount override
  const explicitAmount = config.creditPackageAmounts?.[productId];
  if (
    explicitAmount !== undefined &&
    explicitAmount !== null &&
    typeof explicitAmount === "number"
  ) {
    return explicitAmount;
  }

  // Calculate from package type allocations
  const packageType = detectPackageType(productId);
  const dynamicLimit = getCreditAllocation(packageType, config.packageAllocations);

  if (dynamicLimit === null || dynamicLimit === undefined) {
    throw new Error(
      `[CreditCalculations] Cannot determine credit limit for productId: ${productId}, packageType: ${packageType}`
    );
  }

  return dynamicLimit;
}

/**
 * Calculate new credit balance for a purchase/subscription
 * Takes into account: current balance, subscription status, package type, credit limit
 */
export function calculateNewCredits(params: CalculateCreditsParams): number {
  const { metadata, existingData, creditLimit } = params;

  // Determine if subscription is expired
  const isExpired = metadata.expirationDate
    ? isPast(metadata.expirationDate)
    : false;
  const isPremium = metadata.isPremium;

  // Resolve subscription status
  const status = resolveSubscriptionStatus({
    isPremium,
    willRenew: metadata.willRenew ?? false,
    isExpired,
    periodType: metadata.periodType ?? undefined,
  });

  // Import orchestrator lazily to avoid circular dependency
  const { creditAllocationOrchestrator } = require("../application/credit-strategies/CreditAllocationOrchestrator");

  return creditAllocationOrchestrator.allocate({
    status,
    existingData,
    creditLimit,
    isSubscriptionActive: isPremium && !isExpired,
    productId: metadata.productId ?? null,
  });
}

// ============================================================================
// LOAD STATUS CALCULATIONS
// ============================================================================

/**
 * Calculate credits load status from query state
 */
export function deriveCreditsLoadStatus(
  queryStatus: "pending" | "error" | "success",
  queryEnabled: boolean
): "idle" | "loading" | "error" | "ready" {
  if (!queryEnabled) return "idle";
  if (queryStatus === "pending") return "loading";
  if (queryStatus === "error") return "error";
  return "ready";
}

/**
 * Derive credit-related computed values
 */
export interface DerivedCreditValues {
  hasCredits: boolean;
  creditsPercent: number;
}

export function deriveCreditValues(
  credits: { credits?: number | null } | null,
  creditLimit: number
): DerivedCreditValues {
  const creditAmount = credits?.credits ?? 0;
  const has = creditAmount > 0;
  const percent = calculateSafePercentage(creditAmount, creditLimit);

  return { hasCredits: has, creditsPercent: percent };
}
