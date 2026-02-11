export type { WalletErrorCategory } from "./WalletError.types";
export { WalletError } from "./WalletError.types";

export {
  PaymentValidationError,
  PaymentProviderError,
  DuplicatePaymentError,
  UserValidationError,
  PackageValidationError,
  ReceiptValidationError,
  TransactionError,
  NetworkError,
  CreditLimitError,
  RefundError,
} from "./WalletErrorClasses";

export { handleWalletError } from "./WalletErrorFactory";
