/**
 * RevenueCat Constants
 * Error codes, messages, and logging constants
 */

import Purchases from "react-native-purchases";

export const REVENUECAT_LOG_PREFIX = "[RevenueCat]";

/**
 * RevenueCat Error Code Type
 * Re-export for type safety
 */
export type PurchasesErrorCode = typeof Purchases.PURCHASES_ERROR_CODE[keyof typeof Purchases.PURCHASES_ERROR_CODE];

/**
 * Error Message Configuration
 */
export interface ErrorMessage {
  title: string;
  message: string;
  shouldShowAlert?: boolean;
}

/**
 * Error Code to Enum Mapping
 * Maps both string keys and numeric codes to Purchases error enum values
 */
const ERROR_CODE_MAP = new Map<string, PurchasesErrorCode>([
  ["PURCHASE_CANCELLED_ERROR", Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR],
  ["PURCHASE_NOT_ALLOWED_ERROR", Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR],
  ["PURCHASE_INVALID_ERROR", Purchases.PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR],
  ["PRODUCT_ALREADY_PURCHASED_ERROR", Purchases.PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR],
  ["PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR", Purchases.PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR],
  ["NETWORK_ERROR", Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR],
  ["UNKNOWN_ERROR", Purchases.PURCHASES_ERROR_CODE.UNKNOWN_ERROR],
  ["RECEIPT_ALREADY_IN_USE_ERROR", Purchases.PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR],
  ["INVALID_CREDENTIALS_ERROR", Purchases.PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR],
  ["UNEXPECTED_BACKEND_RESPONSE_ERROR", Purchases.PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR],
  ["CONFIGURATION_ERROR", Purchases.PURCHASES_ERROR_CODE.CONFIGURATION_ERROR],
  ["STORE_PROBLEM_ERROR", Purchases.PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR],
  ["PAYMENT_PENDING_ERROR", Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR],
  // Numeric codes as fallback
  ["1", Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR],
  ["2", Purchases.PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR],
  ["3", Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR],
  ["4", Purchases.PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR],
  ["5", Purchases.PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR],
  ["6", Purchases.PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR],
  ["7", Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR],
  ["8", Purchases.PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR],
  ["9", Purchases.PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR],
  ["10", Purchases.PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR],
  ["16", Purchases.PURCHASES_ERROR_CODE.CONFIGURATION_ERROR],
  ["20", Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR],
  ["0", Purchases.PURCHASES_ERROR_CODE.UNKNOWN_ERROR],
]);

/**
 * User-friendly error messages mapped by error code enum
 * Strategy Pattern: Each error code has its own message configuration
 */
const ERROR_MESSAGES_MAP = new Map<PurchasesErrorCode, ErrorMessage>([
  [
    Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
    {
      title: "Purchase Cancelled",
      message: "The purchase was cancelled.",
      shouldShowAlert: false, // Don't show alert for user cancellation
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR,
    {
      title: "Purchase Not Allowed",
      message: "In-app purchases are disabled on this device.",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR,
    {
      title: "Invalid Purchase",
      message: "The purchase is invalid. Please contact support.",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR,
    {
      title: "Already Purchased",
      message: "You already own this subscription. Restoring your purchase...",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR,
    {
      title: "Product Unavailable",
      message: "This product is not available for purchase at this time.",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR,
    {
      title: "Network Error",
      message: "Please check your internet connection and try again.",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.UNKNOWN_ERROR,
    {
      title: "Unknown Error",
      message: "An unexpected error occurred. Please try again.",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR,
    {
      title: "Receipt Already Used",
      message: "This receipt is already associated with another account.",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR,
    {
      title: "Configuration Error",
      message: "The app is not configured correctly. Please contact support.",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR,
    {
      title: "Server Error",
      message: "The server returned an unexpected response. Please try again later.",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.CONFIGURATION_ERROR,
    {
      title: "Configuration Error",
      message: "RevenueCat is not configured correctly. Please contact support.",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR,
    {
      title: "Store Error",
      message: "There was a problem with the app store. Please try again.",
      shouldShowAlert: true,
    },
  ],
  [
    Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR,
    {
      title: "Payment Pending",
      message: "Your payment is still being processed. Please check back later.",
      shouldShowAlert: true,
    },
  ],
]);

/**
 * Default error message for unknown errors
 */
const DEFAULT_ERROR_MESSAGE: ErrorMessage = {
  title: "Error",
  message: "An error occurred. Please try again.",
  shouldShowAlert: true,
};

/**
 * Get error message configuration for a given error code
 * Uses Strategy Pattern with Map lookup - O(1) complexity
 *
 * @param errorCode - Error code string from RevenueCat error
 * @returns ErrorMessage configuration
 */
export function getErrorMessageForCode(errorCode: string | null | undefined): ErrorMessage {
  if (!errorCode) {
    return DEFAULT_ERROR_MESSAGE;
  }

  // Try to map string code to enum value
  const enumCode = ERROR_CODE_MAP.get(errorCode);
  if (enumCode) {
    const message = ERROR_MESSAGES_MAP.get(enumCode);
    if (message) {
      return message;
    }
  }

  return DEFAULT_ERROR_MESSAGE;
}