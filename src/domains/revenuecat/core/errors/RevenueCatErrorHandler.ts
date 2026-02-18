/**
 * RevenueCat Error Handler
 * Error code mapping and message resolution utilities
 */

import Purchases from "react-native-purchases";
import {
  ERROR_MESSAGES_MAP,
  DEFAULT_ERROR_MESSAGE,
  type ErrorMessage,
  type PurchasesErrorCode,
} from "./RevenueCatErrorMessages";

/**
 * Error Code to Enum Mapping
 * Maps both string keys and numeric codes to Purchases error enum values
 */
const ERROR_CODE_MAP = new Map<string, PurchasesErrorCode>([
  // String error codes
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

  // Numeric error codes as fallback
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
 * Get error message configuration for a given error code
 * Strategy Pattern with Map lookup - O(1) complexity
 *
 * @param errorCode - Error code string from RevenueCat error
 * @returns ErrorMessage configuration
 */
function getErrorMessageForCode(errorCode: string | null | undefined): ErrorMessage {
  if (!errorCode) {
    return DEFAULT_ERROR_MESSAGE;
  }

  const enumCode = ERROR_CODE_MAP.get(errorCode);
  if (enumCode) {
    const message = ERROR_MESSAGES_MAP.get(enumCode);
    if (message) {
      return message;
    }
  }

  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Get error message from RevenueCat error object
 *
 * @param error - RevenueCat error object
 * @returns ErrorMessage configuration
 */
export function getErrorMessage(error: unknown): ErrorMessage {
  if (!error || typeof error !== "object") {
    return DEFAULT_ERROR_MESSAGE;
  }

  const errorCode = "code" in error
    ? String(error.code)
    : "readableErrorCode" in error
    ? String(error.readableErrorCode)
    : null;

  return getErrorMessageForCode(errorCode);
}
