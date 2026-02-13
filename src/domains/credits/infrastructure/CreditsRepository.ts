import { getDoc, setDoc } from "firebase/firestore";
import { BaseRepository, type Firestore, type DocumentReference } from "@umituz/react-native-firebase";
import type { CreditsConfig, CreditsResult, DeductCreditsResult } from "../core/Credits";
import type { UserCreditsDocumentRead, PurchaseSource } from "../core/UserCreditsDocument";
import { initializeCreditsTransaction } from "../application/CreditsInitializer";
import { mapCreditsDocumentToEntity } from "../core/CreditsMapper";
import type { RevenueCatData } from "../../subscription/core/RevenueCatData";
import { deductCreditsOperation } from "../application/DeductCreditsCommand";
import { calculateCreditLimit } from "../application/CreditLimitCalculator";
import { PURCHASE_TYPE, type PurchaseType } from "../../subscription/core/SubscriptionConstants";
import { requireFirestore, buildDocRef, type CollectionConfig } from "../../../shared/infrastructure/firestore";
import { SUBSCRIPTION_STATUS } from "../../subscription/core/SubscriptionConstants";

/**
 * Credits Repository
 * Provides domain-specific database operations for credits system.
 */
export class CreditsRepository extends BaseRepository {
  constructor(private config: CreditsConfig) {
    super();
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
    const snap = await getDoc(this.getRef(db, userId));

    if (!snap.exists()) {
      return { success: true, data: null, error: null };
    }

    const entity = mapCreditsDocumentToEntity(snap.data() as UserCreditsDocumentRead);
    return { success: true, data: entity, error: null };
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
    const creditLimit = calculateCreditLimit(productId, this.config);
    const cfg = { ...this.config, creditLimit };

    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await initializeCreditsTransaction(
          db,
          this.getRef(db, userId),
          cfg,
          purchaseId,
          {
            productId,
            source,
            expirationDate: revenueCatData.expirationDate,
            willRenew: revenueCatData.willRenew,
            originalTransactionId: revenueCatData.originalTransactionId,
            isPremium: revenueCatData.isPremium,
            periodType: revenueCatData.periodType,
            unsubscribeDetectedAt: revenueCatData.unsubscribeDetectedAt,
            type,
          }
        );

        return {
          success: true,
          data: result.finalData ? mapCreditsDocumentToEntity(result.finalData) : null,
          error: null,
        };
      } catch (error: any) {
        lastError = error;
        const isAlreadyExists = error?.code === 'already-exists' || error?.message?.includes('already-exists');
        if (isAlreadyExists && attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
          continue;
        }
        break;
      }
    }

    return {
      success: false,
      data: null,
      error: lastError?.message || 'Unknown error during credit initialization',
    };
  }

  /**
   * Deducts credits using atomic transaction logic.
   */
  async deductCredit(userId: string, cost: number): Promise<DeductCreditsResult> {
    const db = requireFirestore();
    return deductCreditsOperation(db, this.getRef(db, userId), cost, userId);
  }

  async hasCredits(userId: string, cost: number): Promise<boolean> {
    const result = await this.getCredits(userId);
    if (!result.success || !result.data) return false;
    return result.data.credits >= cost;
  }

  async syncExpiredStatus(userId: string): Promise<void> {
    const db = requireFirestore();
    const ref = this.getRef(db, userId);
    await setDoc(ref, {
      isPremium: false,
      status: SUBSCRIPTION_STATUS.EXPIRED,
      willRenew: false,
      expirationDate: new Date().toISOString()
    }, { merge: true });
  }
}

export function createCreditsRepository(config: CreditsConfig): CreditsRepository {
  return new CreditsRepository(config);
}
