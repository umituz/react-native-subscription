/**
 * Wallet Error
 *
 * Custom error classes for wallet and payment operations.
 * Follows the same pattern as SubscriptionError.
 */

export type WalletErrorCategory =
  | "PAYMENT"
  | "VALIDATION"
  | "INFRASTRUCTURE"
  | "BUSINESS";

export abstract class WalletError extends Error {
  abstract readonly code: string;
  abstract readonly userMessage: string;
  abstract readonly category: WalletErrorCategory;

  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      userMessage: this.userMessage,
      category: this.category,
      message: this.message,
      cause: this.cause?.message,
    };
  }
}

export class PaymentValidationError extends WalletError {
  readonly code = "PAYMENT_VALIDATION_ERROR";
  readonly category = "PAYMENT" as const;
  readonly userMessage: string;

  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.userMessage = "Payment validation failed. Please try again.";
  }
}

export class PaymentProviderError extends WalletError {
  readonly code = "PAYMENT_PROVIDER_ERROR";
  readonly category = "PAYMENT" as const;
  readonly userMessage: string;

  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.userMessage = "Payment provider error. Please try again.";
  }
}

export class DuplicatePaymentError extends WalletError {
  readonly code = "DUPLICATE_PAYMENT";
  readonly category = "PAYMENT" as const;
  readonly userMessage: string;

  constructor(message: string) {
    super(message);
    this.userMessage = "This payment has already been processed.";
  }
}

export class UserValidationError extends WalletError {
  readonly code = "USER_VALIDATION_ERROR";
  readonly category = "VALIDATION" as const;
  readonly userMessage: string;

  constructor(message: string) {
    super(message);
    this.userMessage = "Invalid user information. Please log in again.";
  }
}

export class PackageValidationError extends WalletError {
  readonly code = "PACKAGE_VALIDATION_ERROR";
  readonly category = "VALIDATION" as const;
  readonly userMessage: string;

  constructor(message: string) {
    super(message);
    this.userMessage = "Invalid credit package. Please select a valid package.";
  }
}

export class ReceiptValidationError extends WalletError {
  readonly code = "RECEIPT_VALIDATION_ERROR";
  readonly category = "VALIDATION" as const;
  readonly userMessage: string;

  constructor(message: string) {
    super(message);
    this.userMessage = "Invalid payment receipt. Please contact support.";
  }
}

export class TransactionError extends WalletError {
  readonly code = "TRANSACTION_ERROR";
  readonly category = "INFRASTRUCTURE" as const;
  readonly userMessage: string;

  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.userMessage = "Transaction failed. Please try again.";
  }
}

export class NetworkError extends WalletError {
  readonly code = "NETWORK_ERROR";
  readonly category = "INFRASTRUCTURE" as const;
  readonly userMessage: string;

  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.userMessage = "Network error. Please check your connection.";
  }
}

export class CreditLimitError extends WalletError {
  readonly code = "CREDIT_LIMIT_ERROR";
  readonly category = "BUSINESS" as const;
  readonly userMessage: string;

  constructor(message: string) {
    super(message);
    this.userMessage = "Credit limit exceeded. Please contact support.";
  }
}

export class RefundError extends WalletError {
  readonly code = "REFUND_ERROR";
  readonly category = "BUSINESS" as const;
  readonly userMessage: string;

  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.userMessage = "Refund failed. Please contact support.";
  }
}

export function handleWalletError(error: unknown): WalletError {
  if (error instanceof WalletError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("timeout")) {
      return new NetworkError(error.message, error);
    }

    if (message.includes("permission") || message.includes("unauthorized")) {
      return new UserValidationError("Authentication failed");
    }

    return new TransactionError(error.message, error);
  }

  return new TransactionError("Unexpected error occurred");
}
