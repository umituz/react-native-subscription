/**
 * Credits Repository
 * Optimized to use Design Patterns: Command, Observer, and Strategy.
 */

import { getDoc, setDoc, type Firestore } from "firebase/firestore";
import { BaseRepository } from "@umituz/react-native-firebase";
import type { CreditsConfig, CreditsResult, DeductCreditsResult } from "../core/Credits";
import type { UserCreditsDocumentRead, PurchaseSource } from "../core/UserCreditsDocument";
import { initializeCreditsTransaction } from "../application/CreditsInitializer";
import { CreditsMapper } from "../core/CreditsMapper";
import type { RevenueCatData } from "../../subscription/core/RevenueCatData";
import { DeductCreditsCommand } from "../application/DeductCreditsCommand";
import { CreditLimitCalculator } from "../application/CreditLimitCalculator";
import { PURCHASE_TYPE, type PurchaseType } from "../../subscription/core/SubscriptionConstants";
import { requireFirestore, buildDocRef, type CollectionConfig } from "../../../shared/infrastructure/firestore";

export class CreditsRepository extends BaseRepository {
  private deductCommand: DeductCreditsCommand;

  constructor(private config: CreditsConfig) {
    super();
    this.deductCommand = new DeductCreditsCommand((db, uid) => this.getRef(db, uid));
  }

  private getCollectionConfig(): CollectionConfig {
    return {
      collectionName: "credits",
      useUserSubcollection: this.config.useUserSubcollection,
    };
  }

  private getRef(db: Firestore, userId: string) {
    const config = this.getCollectionConfig();
    return buildDocRef(db, userId, "balance", config);
  }

  async getCredits(userId: string): Promise<CreditsResult> {
    const db = requireFirestore();
    const snap = await getDoc(this.getRef(db, userId));

    if (!snap.exists()) {
      return { success: true, data: null, error: null };
    }

    const entity = CreditsMapper.toEntity(snap.data() as UserCreditsDocumentRead);
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
    const creditLimit = CreditLimitCalculator.calculate(productId, this.config);
    const cfg = { ...this.config, creditLimit };

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
        type,
      }
    );

    return {
      success: true,
      data: result.finalData ? CreditsMapper.toEntity(result.finalData) : null,
      error: null,
    };
  }

  /**
   * Delegates to DeductCreditsCommand (Command Pattern)
   */
  async deductCredit(userId: string, cost: number): Promise<DeductCreditsResult> {
    return this.deductCommand.execute(userId, cost);
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
      status: "expired",
      willRenew: false,
      expirationDate: new Date().toISOString()
    }, { merge: true });
  }
}

export function createCreditsRepository(config: CreditsConfig): CreditsRepository {
  return new CreditsRepository(config);
}
