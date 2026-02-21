import Purchases from "react-native-purchases";

export interface ErrorMessage {
  title: string;
  message: string;
  shouldShowAlert?: boolean;
}

export type PurchasesErrorCode = typeof Purchases.PURCHASES_ERROR_CODE[keyof typeof Purchases.PURCHASES_ERROR_CODE];

export const ERROR_MESSAGES_MAP = new Map<PurchasesErrorCode, ErrorMessage>([
  [
    Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
    {
      title: "Purchase Cancelled",
      message: "The purchase was cancelled.",
      shouldShowAlert: false,
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

export const DEFAULT_ERROR_MESSAGE: ErrorMessage = {
  title: "Error",
  message: "An error occurred. Please try again.",
  shouldShowAlert: true,
};
