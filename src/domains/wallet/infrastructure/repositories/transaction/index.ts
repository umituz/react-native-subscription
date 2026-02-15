import type { TransactionRepositoryConfig } from "../../../domain/types/transaction.types";
import { TransactionRepository } from "./TransactionRepository";

export { TransactionRepository } from "./TransactionRepository";

export function createTransactionRepository(
  config: TransactionRepositoryConfig
): TransactionRepository {
  return new TransactionRepository(config);
}
