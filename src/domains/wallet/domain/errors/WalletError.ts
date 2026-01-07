/**
 * Wallet Error
 *
 * Custom error classes for wallet and payment operations.
 * Follows the same pattern as SubscriptionError.
 */

import { WALLET_ERROR_MESSAGES } from "./WalletErrorMessages";

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
  readonly userMessage = WALLET_ERROR_MESSAGES.PAYMENT_VALIDATION_FAILED;

  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class PaymentProviderError extends WalletError {
  readonly code = "PAYMENT_PROVIDER_ERROR";
  readonly category = "PAYMENT" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.PAYMENT_PROVIDER_ERROR;

  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class DuplicatePaymentError extends WalletError {
  readonly code = "DUPLICATE_PAYMENT";
  readonly category = "PAYMENT" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.DUPLICATE_PAYMENT;

  constructor(message: string) {
    super(message);
  }
}

export class UserValidationError extends WalletError {
  readonly code = "USER_VALIDATION_ERROR";
  readonly category = "VALIDATION" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.USER_VALIDATION_FAILED;

  constructor(message: string) {
    super(message);
  }
}

export class PackageValidationError extends WalletError {
  readonly code = "PACKAGE_VALIDATION_ERROR";
  readonly category = "VALIDATION" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.PACKAGE_VALIDATION_FAILED;

  constructor(message: string) {
    super(message);
  }
}

export class ReceiptValidationError extends WalletError {
  readonly code = "RECEIPT_VALIDATION_ERROR";
  readonly category = "VALIDATION" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.RECEIPT_VALIDATION_FAILED;

  constructor(message: string) {
    super(message);
  }
}

export class TransactionError extends WalletError {
  readonly code = "TRANSACTION_ERROR";
  readonly category = "INFRASTRUCTURE" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.TRANSACTION_FAILED;

  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class NetworkError extends WalletError {
  readonly code = "NETWORK_ERROR";
  readonly category = "INFRASTRUCTURE" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.NETWORK_ERROR;

  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class CreditLimitError extends WalletError {
  readonly code = "CREDIT_LIMIT_ERROR";
  readonly category = "BUSINESS" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.CREDIT_LIMIT_EXCEEDED;

  constructor(message: string) {
    super(message);
  }
}

export class RefundError extends WalletError {
  readonly code = "REFUND_ERROR";
  readonly category = "BUSINESS" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.REFUND_FAILED;

  constructor(message: string, cause?: Error) {
    super(message, cause);
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
