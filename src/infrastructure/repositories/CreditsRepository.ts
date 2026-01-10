/**
 * Credits Repository
 */

import { doc, getDoc, runTransaction, serverTimestamp, type Firestore, type Transaction } from "firebase/firestore";
import { BaseRepository, getFirestore } from "@umituz/react-native-firebase";
import type { CreditsConfig, CreditsResult, DeductCreditsResult } from "../../domain/entities/Credits";
import type { UserCreditsDocumentRead, PurchaseSource } from "../models/UserCreditsDocument";
import { initializeCreditsTransaction, type InitializeCreditsMetadata } from "../services/CreditsInitializer";
import { detectPackageType } from "../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../utils/creditMapper";

import { CreditsMapper } from "../mappers/CreditsMapper";

export class CreditsRepository extends BaseRepository {
  constructor(private config: CreditsConfig) { super(); }

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
      const d = snap.data() as UserCreditsDocumentRead;
      return { success: true, data: CreditsMapper.toEntity(d) };
    } catch (e: any) { return { success: false, error: { message: e.message, code: "FETCH_ERR" } }; }
  }

  async initializeCredits(
    userId: string,
    purchaseId?: string,
    productId?: string,
    source?: PurchaseSource
  ): Promise<CreditsResult> {
    const db = getFirestore();
    if (!db) return { success: false, error: { message: "No DB", code: "INIT_ERR" } };
    try {
      let cfg = { ...this.config };
      if (productId) {
        const amt = this.config.creditPackageAmounts?.[productId];
        if (amt) cfg = { ...cfg, creditLimit: amt };
        else {
          const packageType = detectPackageType(productId);
          const dynamicLimit = getCreditAllocation(packageType, this.config.packageAllocations);
          if (dynamicLimit !== null) cfg = { ...cfg, creditLimit: dynamicLimit };
        }
      }

      const metadata: InitializeCreditsMetadata = {
        productId,
        source,
      };

      const res = await initializeCreditsTransaction(
        db,
        this.getRef(db, userId),
        cfg,
        purchaseId,
        metadata
      );

      return {
        success: true,
        data: CreditsMapper.toEntity({
            ...res,
            purchasedAt: undefined,
            lastUpdatedAt: undefined,
        })
      };
    } catch (e: any) { return { success: false, error: { message: e.message, code: "INIT_ERR" } }; }
  }

  async deductCredit(userId: string, cost: number = 1): Promise<DeductCreditsResult> {
    const db = getFirestore();
    if (!db) return { success: false, error: { message: "No DB", code: "ERR" } };
    try {
      const remaining = await runTransaction(db, async (tx: Transaction) => {
        const docSnap = await tx.get(this.getRef(db, userId));
        if (!docSnap.exists()) throw new Error("NO_CREDITS");
        const current = docSnap.data().credits as number;
        if (current < cost) throw new Error("CREDITS_EXHAUSTED");
        const updated = current - cost;
        tx.update(this.getRef(db, userId), { credits: updated, lastUpdatedAt: serverTimestamp() });
        return updated;
      });
      return { success: true, remainingCredits: remaining };
    } catch (e: any) {
      const code = e.message === "NO_CREDITS" || e.message === "CREDITS_EXHAUSTED" ? e.message : "DEDUCT_ERR";
      return { success: false, error: { message: e.message, code } };
    }
  }

  async hasCredits(userId: string, cost: number = 1): Promise<boolean> {
    const res = await this.getCredits(userId);
    return !!(res.success && res.data && res.data.credits >= cost);
  }
}

export const createCreditsRepository = (c: CreditsConfig) => new CreditsRepository(c);
