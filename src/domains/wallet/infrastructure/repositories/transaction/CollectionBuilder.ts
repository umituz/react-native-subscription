import { buildCollectionRef, type CollectionConfig } from "../../../../../shared/infrastructure/firestore";
import type { Firestore } from "@umituz/react-native-firebase";
import type { TransactionRepositoryConfig } from "../../../domain/types/transaction.types";

function getCollectionConfig(config: TransactionRepositoryConfig): CollectionConfig {
  return {
    collectionName: config.collectionName,
    useUserSubcollection: config.useUserSubcollection ?? false,
  };
}

export function getCollectionRef(db: Firestore, userId: string, config: TransactionRepositoryConfig) {
  const collectionConfig = getCollectionConfig(config);
  return buildCollectionRef(db, userId, collectionConfig);
}
