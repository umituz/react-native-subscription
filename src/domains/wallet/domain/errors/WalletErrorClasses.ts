import { WalletError } from "./WalletError.types";
import { WALLET_ERROR_MESSAGES } from "./WalletErrorMessages";

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
}

export class UserValidationError extends WalletError {
  readonly code = "USER_VALIDATION_ERROR";
  readonly category = "VALIDATION" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.USER_VALIDATION_FAILED;
}

export class PackageValidationError extends WalletError {
  readonly code = "PACKAGE_VALIDATION_ERROR";
  readonly category = "VALIDATION" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.PACKAGE_VALIDATION_FAILED;
}

export class ReceiptValidationError extends WalletError {
  readonly code = "RECEIPT_VALIDATION_ERROR";
  readonly category = "VALIDATION" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.RECEIPT_VALIDATION_FAILED;
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
}

export class RefundError extends WalletError {
  readonly code = "REFUND_ERROR";
  readonly category = "BUSINESS" as const;
  readonly userMessage = WALLET_ERROR_MESSAGES.REFUND_FAILED;

  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}
