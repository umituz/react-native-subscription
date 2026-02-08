/**
 * Credits Repository
 * Optimized to use Design Patterns: Command, Observer, and Strategy.
 */

import { doc, getDoc, serverTimestamp, updateDoc, type Firestore } from "firebase/firestore";
import { BaseRepository, getFirestore } from "@umituz/react-native-firebase";
import type { CreditsConfig, CreditsResult, DeductCreditsResult } from "../core/Credits";
import type { UserCreditsDocumentRead, PurchaseSource } from "../core/UserCreditsDocument";
import { initializeCreditsTransaction } from "../application/CreditsInitializer";
import { CreditsMapper } from "../core/CreditsMapper";
import type { RevenueCatData } from "../../subscription/core/RevenueCatData";
import { DeductCreditsCommand } from "../application/DeductCreditsCommand";
import { CreditLimitCalculator } from "../application/CreditLimitCalculator";

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
    if (!db) return { success: false, error: { message: "No DB", code: "DB_ERR" } };
    try {
      const snap = await getDoc(this.getRef(db, userId));
      if (!snap.exists()) return { success: true, data: undefined };
      
      const entity = CreditsMapper.toEntity(snap.data() as UserCreditsDocumentRead);
      return { success: true, data: entity };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false, error: { message, code: "FETCH_ERR" } };
    }
  }

  async initializeCredits(
    userId: string, purchaseId?: string, productId?: string,
    source?: PurchaseSource, revenueCatData?: RevenueCatData
  ): Promise<CreditsResult> {
    const db = getFirestore();
    if (!db) return { success: false, error: { message: "No DB", code: "INIT_ERR" } };
    try {
      // Use CreditLimitCalculator (Refactoring Logic)
      const creditLimit = CreditLimitCalculator.calculate(productId, this.config);
      const cfg = { ...this.config, creditLimit };

      const result = await initializeCreditsTransaction(db, this.getRef(db, userId), cfg, purchaseId, {
        productId, source,
        expirationDate: revenueCatData?.expirationDate,
        willRenew: revenueCatData?.willRenew,
        originalTransactionId: revenueCatData?.originalTransactionId,
        isPremium: revenueCatData?.isPremium,
        periodType: revenueCatData?.periodType,
      });
      
      return {
        success: true,
        data: result.finalData ? CreditsMapper.toEntity(result.finalData) : undefined,
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false, error: { message, code: "INIT_ERR" } };
    }
  }

  /**
   * Delegates to DeductCreditsCommand (Command Pattern)
   */
  async deductCredit(userId: string, cost: number = 1): Promise<DeductCreditsResult> {
    return this.deductCommand.execute(userId, cost);
  }

  async hasCredits(userId: string, cost: number = 1): Promise<boolean> {
    const res = await this.getCredits(userId);
    return !!(res.success && res.data && res.data.credits >= cost);
  }

  async syncExpiredStatus(userId: string): Promise<void> {
    const db = getFirestore();
    if (!db) return;
    try {
      await updateDoc(this.getRef(db, userId), { 
        isPremium: false, 
        status: "expired", 
        lastUpdatedAt: serverTimestamp() 
      });
    } catch (e) {
      if (__DEV__) console.error("[CreditsRepository] Sync expired failed:", e);
    }
  }
}

export const createCreditsRepository = (c: CreditsConfig) => new CreditsRepository(c);
