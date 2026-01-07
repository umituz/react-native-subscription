/**
 * Wallet Error Messages
 * Centralized error user messages for wallet operations
 */

export const WALLET_ERROR_MESSAGES = {
  PAYMENT_VALIDATION_FAILED: "Payment validation failed. Please try again.",
  PAYMENT_PROVIDER_ERROR: "Payment provider error. Please try again.",
  DUPLICATE_PAYMENT: "This payment has already been processed.",
  USER_VALIDATION_FAILED: "Invalid user information. Please log in again.",
  PACKAGE_VALIDATION_FAILED: "Invalid credit package. Please select a valid package.",
  RECEIPT_VALIDATION_FAILED: "Invalid payment receipt. Please contact support.",
  TRANSACTION_FAILED: "Transaction failed. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  CREDIT_LIMIT_EXCEEDED: "Credit limit exceeded. Please contact support.",
  REFUND_FAILED: "Refund failed. Please contact support.",
} as const;
