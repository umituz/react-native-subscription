/**
 * Credits Repository
 */

import { doc, getDoc, runTransaction, serverTimestamp, type Firestore, type Transaction } from "firebase/firestore";
import { BaseRepository, getFirestore } from "@umituz/react-native-firebase";
import type { CreditType, CreditsConfig, CreditsResult, DeductCreditsResult } from "../../domain/entities/Credits";
import type { UserCreditsDocumentRead } from "../models/UserCreditsDocument";
import { initializeCreditsTransaction } from "../services/CreditsInitializer";
import { detectPackageType } from "../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../utils/creditMapper";

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
      return { success: true, data: { textCredits: d.textCredits, imageCredits: d.imageCredits, purchasedAt: d.purchasedAt?.toDate?.() || new Date(), lastUpdatedAt: d.lastUpdatedAt?.toDate?.() || new Date() } };
    } catch (e: any) { return { success: false, error: { message: e.message, code: "FETCH_ERR" } }; }
  }

  async initializeCredits(userId: string, purchaseId?: string, productId?: string): Promise<CreditsResult> {
    const db = getFirestore();
    if (!db) return { success: false, error: { message: "No DB", code: "INIT_ERR" } };
    try {
      let cfg = { ...this.config };
      if (productId) {
        const amt = this.config.creditPackageAmounts?.[productId];
        if (amt) cfg = { ...cfg, imageCreditLimit: amt, textCreditLimit: amt };
        else {
          const alloc = getCreditAllocation(detectPackageType(productId));
          if (alloc) cfg = { ...cfg, imageCreditLimit: alloc.imageCredits, textCreditLimit: alloc.textCredits };
        }
      }
      const res = await initializeCreditsTransaction(db, this.getRef(db, userId), cfg, purchaseId);
      return { success: true, data: { textCredits: res.textCredits, imageCredits: res.imageCredits, purchasedAt: new Date(), lastUpdatedAt: new Date() } };
    } catch (e: any) { return { success: false, error: { message: e.message, code: "INIT_ERR" } }; }
  }

  async deductCredit(userId: string, type: CreditType): Promise<DeductCreditsResult> {
    const db = getFirestore();
    if (!db) return { success: false, error: { message: "No DB", code: "ERR" } };
    const field = type === "text" ? "textCredits" : "imageCredits";
    try {
      const remaining = await runTransaction(db, async (tx: Transaction) => {
        const docSnap = await tx.get(this.getRef(db, userId));
        if (!docSnap.exists()) throw new Error("NO_CREDITS");
        const current = docSnap.data()[field] as number;
        if (current <= 0) throw new Error("CREDITS_EXHAUSTED");
        const updated = current - 1;
        tx.update(this.getRef(db, userId), { [field]: updated, lastUpdatedAt: serverTimestamp() });
        return updated;
      });
      return { success: true, remainingCredits: remaining };
    } catch (e: any) {
      const code = e.message === "NO_CREDITS" || e.message === "CREDITS_EXHAUSTED" ? e.message : "DEDUCT_ERR";
      return { success: false, error: { message: e.message, code } };
    }
  }

  async hasCredits(userId: string, type: CreditType): Promise<boolean> {
    const res = await this.getCredits(userId);
    return !!(res.success && res.data && (type === "text" ? res.data.textCredits : res.data.imageCredits) > 0);
  }
}

export const createCreditsRepository = (c: CreditsConfig) => new CreditsRepository(c);
