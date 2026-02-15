import { buildCollectionRef, type CollectionConfig } from "../../../../../shared/infrastructure/firestore";
import type { TransactionRepositoryConfig } from "../../../domain/types/transaction.types";

export function getCollectionConfig(config: TransactionRepositoryConfig): CollectionConfig {
  return {
    collectionName: config.collectionName,
    useUserSubcollection: config.useUserSubcollection ?? false,
  };
}

export function getCollectionRef(db: any, userId: string, config: TransactionRepositoryConfig) {
  const collectionConfig = getCollectionConfig(config);
  return buildCollectionRef(db, userId, collectionConfig);
}
