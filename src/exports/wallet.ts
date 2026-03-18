/**
 * WALLET Features (Optional)
 *
 * Import only if your app needs wallet UI and transaction history
 *
 * @example
 * import { WalletScreen } from '@umituz/react-native-subscription/exports/wallet';
 */

// Wallet Screen
export {
  WalletScreen as WalletScreenContainer,
} from '../../domains/wallet/presentation/screens/WalletScreen';

export type {
  WalletScreenProps,
  WalletScreenTranslations,
} from '../../domains/wallet/presentation/screens/WalletScreen.types';

// Wallet Hooks
export { useWallet } from '../../domains/wallet/presentation/hooks/useWallet';
export type { WalletData } from '../../domains/wallet/presentation/hooks/useWallet';

export { useTransactionHistory } from '../../domains/wallet/presentation/hooks/useTransactionHistory';
export type { TransactionHistoryResult } from '../../domains/wallet/presentation/hooks/useTransactionHistory';

// Wallet Components
export { BalanceCard } from '../../domains/wallet/presentation/components/BalanceCard';
export type { BalanceCardProps } from '../../domains/wallet/presentation/components/BalanceCard.types';

export { TransactionList } from '../../domains/wallet/presentation/components/TransactionList';
export type { TransactionListProps } from '../../domains/wallet/presentation/components/TransactionList.types';

export { TransactionItem } from '../../domains/wallet/presentation/components/TransactionItem';
export type { TransactionItemProps } from '../../domains/wallet/presentation/components/TransactionItem.types';
