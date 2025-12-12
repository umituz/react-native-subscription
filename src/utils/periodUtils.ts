/**
 * Period Utilities
 * Subscription period-related helper functions
 *
 * Following SOLID, DRY, KISS principles:
 * - Single Responsibility: Only period-related operations
 * - DRY: No code duplication
 * - KISS: Simple, clear implementations
 */

import { SUBSCRIPTION_PERIOD_UNITS } from './subscriptionConstants';

/**
 * Get subscription period text from RevenueCat package
 * Extracts readable period text from PurchasesPackage or subscription period object
 *
 * @param input - RevenueCat PurchasesPackage or subscription period object
 * @returns Human-readable period text (e.g., "month", "year", "2 months")
 *
 * @example
 * // From PurchasesPackage
 * getPeriodText(pkg) // Returns: "month"
 *
 * @example
 * // From subscription period object
 * getPeriodText({ unit: "MONTH", numberOfUnits: 1 }) // Returns: "month"
 * getPeriodText({ unit: "YEAR", numberOfUnits: 1 }) // Returns: "year"
 * getPeriodText({ unit: "MONTH", numberOfUnits: 3 }) // Returns: "3 months"
 */
export function getPeriodText(
  input:
    | {
        product?: {
          subscriptionPeriod?:
            | {
                unit: string;
                numberOfUnits: number;
              }
            | string
            | null;
        };
      }
    | {
        unit: string;
        numberOfUnits: number;
      }
    | null
    | undefined,
): string {
  if (!input) return '';

  // Extract subscription period from PurchasesPackage or use directly
  let subscriptionPeriod:
    | {
        unit: string;
        numberOfUnits: number;
      }
    | null
    | undefined;

  // Check if input is PurchasesPackage (has product property)
  if ('product' in input && input.product?.subscriptionPeriod) {
    const period = input.product.subscriptionPeriod;
    // Type guard: check if period is an object with unit and numberOfUnits
    // RevenueCat's subscriptionPeriod can be string | null | object
    if (
      typeof period === 'object' &&
      period !== null &&
      'unit' in period &&
      'numberOfUnits' in period
    ) {
      subscriptionPeriod = {
        unit: period.unit as string,
        numberOfUnits: period.numberOfUnits as number,
      };
    }
    // If period is string, we can't extract unit/numberOfUnits, return empty
  } else if ('unit' in input && 'numberOfUnits' in input) {
    // Input is already a subscription period object
    subscriptionPeriod = {
      unit: input.unit,
      numberOfUnits: input.numberOfUnits,
    };
  }

  if (!subscriptionPeriod) return '';

  const { unit, numberOfUnits } = subscriptionPeriod;

  if (unit === SUBSCRIPTION_PERIOD_UNITS.MONTH) {
    return numberOfUnits === 1 ? 'month' : `${numberOfUnits} months`;
  }

  if (unit === SUBSCRIPTION_PERIOD_UNITS.YEAR) {
    return numberOfUnits === 1 ? 'year' : `${numberOfUnits} years`;
  }

  if (unit === SUBSCRIPTION_PERIOD_UNITS.WEEK) {
    return numberOfUnits === 1 ? 'week' : `${numberOfUnits} weeks`;
  }

  return '';
}

