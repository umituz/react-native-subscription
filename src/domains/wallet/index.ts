/**
 * Wallet Domain
 *
 * Public API for wallet functionality.
 */

// Config
export {
  configureWallet,
  getWalletConfig,
  resetWalletConfig,
  type WalletConfiguration,
} from "./infrastructure/config/walletConfig";

// Types
export type {
  TransactionReason,
  CreditLog,
  TransactionRepositoryConfig,
  TransactionQueryOptions,
  TransactionResult,
  WalletConfig,
  ProductType,
  ProductMetadata,
  ProductMetadataConfig,
  CreditBalance,
  WalletTranslations,
  CreditCostConfig,
  AICreditCosts,
  CreditCostResult,
} from "./domain/types";

export {
  DEFAULT_AI_CREDIT_COSTS,
  getCreditCost,
  creditsToDollars,
  createCreditCostConfig,
} from "./domain/types";

// Errors
export {
  WalletError,
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
  handleWalletError,
  type WalletErrorCategory,
} from "./domain/errors/WalletError";

// Entities
export {
  createCreditCostEntity,
  type CreditCostEntity,
} from "./domain/entities/CreditCost";

// Repositories
export {
  TransactionRepository,
  createTransactionRepository,
} from "./infrastructure/repositories/TransactionRepository";

// Services
export {
  ProductMetadataService,
  createProductMetadataService,
  configureProductMetadataService,
  getProductMetadataService,
  resetProductMetadataService,
} from "./infrastructure/services/ProductMetadataService";

// Hooks
export {
  useWallet,
  type UseWalletParams,
  type UseWalletResult,
} from "./presentation/hooks/useWallet";

export {
  useTransactionHistory,
  transactionQueryKeys,
  type UseTransactionHistoryParams,
  type UseTransactionHistoryResult,
} from "./presentation/hooks/useTransactionHistory";

export {
  useProductMetadata,
  productMetadataQueryKeys,
  type UseProductMetadataParams,
  type UseProductMetadataResult,
} from "./presentation/hooks/useProductMetadata";

// Components
export {
  BalanceCard,
  type BalanceCardProps,
  type BalanceCardTranslations,
} from "./presentation/components/BalanceCard";

export {
  TransactionItem,
  type TransactionItemProps,
  type TransactionItemTranslations,
} from "./presentation/components/TransactionItem";

export {
  TransactionList,
  type TransactionListProps,
  type TransactionListTranslations,
} from "./presentation/components/TransactionList";

// Screens
export {
  WalletScreen,
  type WalletScreenProps,
  type WalletScreenConfig,
  type WalletScreenTranslations,
} from "./presentation/screens/WalletScreen";

export {
  WalletScreenContainer,
  type WalletScreenContainerProps,
} from "./presentation/screens/WalletScreenContainer";
