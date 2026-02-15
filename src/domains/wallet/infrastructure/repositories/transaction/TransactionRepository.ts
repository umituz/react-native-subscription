import { BaseRepository } from "@umituz/react-native-firebase";
import type {
  CreditLog,
  TransactionRepositoryConfig,
  TransactionQueryOptions,
  TransactionResult,
  TransactionReason,
} from "../../../domain/types/transaction.types";
import { fetchTransactions } from "./TransactionFetcher";
import { addTransaction as addTransactionOp } from "./TransactionWriter";

export class TransactionRepository extends BaseRepository {
  private config: TransactionRepositoryConfig;

  constructor(config: TransactionRepositoryConfig) {
    super(config.collectionName);
    this.config = config;
  }

  async getTransactions(
    options: TransactionQueryOptions
  ): Promise<TransactionResult> {
    return fetchTransactions(this.config, options);
  }

  async addTransaction(
    userId: string,
    change: number,
    reason: TransactionReason,
    metadata?: Partial<CreditLog>
  ): Promise<TransactionResult<CreditLog>> {
    return addTransactionOp(this.config, userId, change, reason, metadata);
  }
}
