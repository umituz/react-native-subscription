/**
 * Credits Repository
 * Optimized to use Design Patterns: Command, Observer, and Strategy.
 */

import { doc, getDoc, type Firestore } from "firebase/firestore";
import { BaseRepository, getFirestore } from "@umituz/react-native-firebase";
import type { CreditsConfig, CreditsResult, DeductCreditsResult } from "../core/Credits";
import type { UserCreditsDocumentRead, PurchaseSource } from "../core/UserCreditsDocument";
import { initializeCreditsTransaction } from "../application/CreditsInitializer";
import { CreditsMapper } from "../core/CreditsMapper";
import type { RevenueCatData } from "../../subscription/core/RevenueCatData";
import { DeductCreditsCommand } from "../application/DeductCreditsCommand";
import { CreditLimitCalculator } from "../application/CreditLimitCalculator";
import { PURCHASE_TYPE, type PurchaseType } from "../../subscription/core/SubscriptionConstants";
import { setDoc } from "firebase/firestore";

export class CreditsRepository extends BaseRepository {
  private deductCommand: DeductCreditsCommand;

  constructor(private config: CreditsConfig) {
    super();
    this.deductCommand = new DeductCreditsCommand((db, uid) => this.getRef(db, uid));
  }

  private getRef(db: Firestore, userId: string) {
    return this.config.useUserSubcollection
      ? doc(db, "users", userId, "credits", "balance")
      : doc(db, this.config.collectionName, userId);
  }

  async getCredits(userId: string): Promise<CreditsResult> {
    const db = getFirestore();
    if (!db) {
      throw new Error("Firestore instance is not available");
    }

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
    const db = getFirestore();
    if (!db) {
      throw new Error("Firestore instance is not available");
    }

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
    const db = getFirestore();
    if (!db) throw new Error("Firestore instance is not available");

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
