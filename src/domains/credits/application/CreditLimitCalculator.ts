import type { CreditsConfig } from "../core/Credits";
import { calculateCreditLimit as calculateLimit } from "../utils/creditCalculations";

/**
 * Service to calculate credit limits based on product configuration.
 * Uses centralized utility functions for calculations.
 */
export function calculateCreditLimit(productId: string | undefined, config: CreditsConfig): number {
  return calculateLimit(productId, config);
}
