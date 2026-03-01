import type { Firestore, DocumentReference } from "@umituz/react-native-firebase";
import { BaseRepository } from "@umituz/react-native-firebase";
import type { CreditsConfig, CreditsResult, DeductCreditsResult } from "../core/Credits";
import type { PurchaseSource } from "../core/UserCreditsDocument";
import type { RevenueCatData } from "../../revenuecat/core/types";
import { deductCreditsOperation } from "../application/DeductCreditsCommand";
import { refundCreditsOperation } from "../application/RefundCreditsCommand";
import { PURCHASE_TYPE, type PurchaseType } from "../../subscription/core/SubscriptionConstants";
import { requireFirestore, buildDocRef, type CollectionConfig } from "../../../shared/infrastructure/firestore";
import { fetchCredits, checkHasCredits } from "./operations/CreditsFetcher";
import { syncExpiredStatus, syncPremiumMetadata, createRecoveryCreditsDocument, type PremiumMetadata } from "./operations/CreditsWriter";
import { initializeCreditsWithRetry } from "./operations/CreditsInitializer";
import { calculateCreditLimit } from "../application/CreditLimitCalculator";

export class CreditsRepository extends BaseRepository {
  constructor(private config: CreditsConfig) {
    super(config.collectionName);
  }

  private getCollectionConfig(): CollectionConfig {
    return {
      collectionName: this.config.collectionName,
      useUserSubcollection: this.config.useUserSubcollection,
    };
  }

  private getRef(db: Firestore, userId: string): DocumentReference {
    const config = this.getCollectionConfig();
    return buildDocRef(db, userId, "balance", config);
  }

  async getCredits(userId: string): Promise<CreditsResult> {
    const db = requireFirestore();
    return fetchCredits(this.getRef(db, userId));
  }

  async initializeCredits(
    userId: string,
    purchaseId: string,
    productId: string,
    source: PurchaseSource,
    revenueCatData: RevenueCatData,
    type: PurchaseType = PURCHASE_TYPE.INITIAL
  ): Promise<CreditsResult> {
    const db = requireFirestore();
    return initializeCreditsWithRetry({
      db,
      ref: this.getRef(db, userId),
      config: this.config,
      userId,
      purchaseId,
      productId,
      source,
      revenueCatData,
      type,
    });
  }

  async deductCredit(userId: string, cost: number): Promise<DeductCreditsResult> {
    const db = requireFirestore();
    return deductCreditsOperation(db, this.getRef(db, userId), cost, userId);
  }

  async refundCredit(userId: string, amount: number): Promise<DeductCreditsResult> {
    const db = requireFirestore();
    return refundCreditsOperation(db, this.getRef(db, userId), amount, userId);
  }

  async hasCredits(userId: string, cost: number): Promise<boolean> {
    const db = requireFirestore();
    return checkHasCredits(this.getRef(db, userId), cost);
  }

  async syncExpiredStatus(userId: string): Promise<void> {
    const db = requireFirestore();
    await syncExpiredStatus(this.getRef(db, userId));
  }

  async syncPremiumMetadata(userId: string, metadata: PremiumMetadata): Promise<void> {
    const db = requireFirestore();
    await syncPremiumMetadata(this.getRef(db, userId), metadata);
  }

  async ensurePremiumCreditsExist(
    userId: string,
    productId: string,
    willRenew: boolean,
    expirationDate: string | null,
    periodType: string | null,
  ): Promise<boolean> {
    const db = requireFirestore();
    const creditLimit = calculateCreditLimit(productId, this.config);
    return createRecoveryCreditsDocument(
      this.getRef(db, userId),
      creditLimit,
      productId,
      willRenew,
      expirationDate,
      periodType,
    );
  }
}

export function createCreditsRepository(config: CreditsConfig): CreditsRepository {
  return new CreditsRepository(config);
}
