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
 * User-friendly error messages for RevenueCat errors
 * Maps error codes to human-readable messages
 */
export const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  PURCHASE_CANCELLED_ERROR: {
    title: "Purchase Cancelled",
    message: "The purchase was cancelled.",
  },
  PURCHASE_NOT_ALLOWED_ERROR: {
    title: "Purchase Not Allowed",
    message: "In-app purchases are disabled on this device.",
  },
  PURCHASE_INVALID_ERROR: {
    title: "Invalid Purchase",
    message: "The purchase is invalid. Please contact support.",
  },
  PRODUCT_ALREADY_PURCHASED_ERROR: {
    title: "Already Purchased",
    message: "You already own this subscription. Restoring your purchase...",
  },
  PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR: {
    title: "Product Unavailable",
    message: "This product is not available for purchase at this time.",
  },
  NETWORK_ERROR: {
    title: "Network Error",
    message: "Please check your internet connection and try again.",
  },
  UNKNOWN_ERROR: {
    title: "Unknown Error",
    message: "An unexpected error occurred. Please try again.",
  },
  RECEIPT_ALREADY_IN_USE_ERROR: {
    title: "Receipt Already Used",
    message: "This receipt is already associated with another account.",
  },
  INVALID_CREDENTIALS_ERROR: {
    title: "Configuration Error",
    message: "The app is not configured correctly. Please contact support.",
  },
  UNEXPECTED_BACKEND_RESPONSE_ERROR: {
    title: "Server Error",
    message: "The server returned an unexpected response. Please try again later.",
  },
  CONFIGURATION_ERROR: {
    title: "Configuration Error",
    message: "RevenueCat is not configured correctly. Please contact support.",
  },
  STORE_PROBLEM_ERROR: {
    title: "Store Error",
    message: "There was a problem with the app store. Please try again.",
  },
  PAYMENT_PENDING_ERROR: {
    title: "Payment Pending",
    message: "Your payment is still being processed. Please check back later.",
  },
};