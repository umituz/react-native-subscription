/**
 * Credits Repository
 */

declare const __DEV__: boolean;

import { doc, getDoc, runTransaction, serverTimestamp, type Firestore, type Transaction } from "firebase/firestore";
import { BaseRepository, getFirestore } from "@umituz/react-native-firebase";
import type { CreditsConfig, CreditsResult, DeductCreditsResult } from "../../domain/entities/Credits";
import type { UserCreditsDocumentRead, PurchaseSource } from "../models/UserCreditsDocument";
import { initializeCreditsTransaction, type InitializeCreditsMetadata } from "../services/CreditsInitializer";
import { detectPackageType } from "../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../utils/creditMapper";

import { CreditsMapper } from "../mappers/CreditsMapper";

/** RevenueCat subscription data to save (Single Source of Truth) */
export interface RevenueCatData {
  expirationDate?: string | null;
  willRenew?: boolean;
  originalTransactionId?: string;
  isPremium?: boolean;
  /** RevenueCat period type: NORMAL, INTRO, or TRIAL */
  periodType?: "NORMAL" | "INTRO" | "TRIAL";
}

export class CreditsRepository extends BaseRepository {
  constructor(private config: CreditsConfig) { super(); }

  private getRef(db: Firestore, userId: string) {
    return this.config.useUserSubcollection
      ? doc(db, "users", userId, "credits", "balance")
      : doc(db, this.config.collectionName, userId);
  }

  async getCredits(userId: string): Promise<CreditsResult> {
    const db = getFirestore();
    if (!db) {
      if (__DEV__) console.log("[CreditsRepository] No Firestore instance");
      return { success: false, error: { message: "No DB", code: "DB_ERR" } };
    }
    try {
      const ref = this.getRef(db, userId);
      if (__DEV__) console.log("[CreditsRepository] Fetching credits:", { userId: userId.slice(0, 8), path: ref.path });
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        if (__DEV__) console.log("[CreditsRepository] No credits document found");
        return { success: true, data: undefined };
      }
      const d = snap.data() as UserCreditsDocumentRead;
      const entity = CreditsMapper.toEntity(d);
      if (__DEV__) console.log("[CreditsRepository] Credits fetched:", { credits: entity.credits, limit: entity.creditLimit });
      return { success: true, data: entity };
    } catch (e: any) {
      if (__DEV__) console.error("[CreditsRepository] Fetch error:", e.message);
      return { success: false, error: { message: e.message, code: "FETCH_ERR" } };
    }
  }

  async initializeCredits(
    userId: string,
    purchaseId?: string,
    productId?: string,
    source?: PurchaseSource,
    revenueCatData?: RevenueCatData
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
        // RevenueCat data for Single Source of Truth
        expirationDate: revenueCatData?.expirationDate,
        willRenew: revenueCatData?.willRenew,
        originalTransactionId: revenueCatData?.originalTransactionId,
        isPremium: revenueCatData?.isPremium,
        periodType: revenueCatData?.periodType,
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

  /**
   * Initialize free credits for new users
   * Creates a credits document with freeCredits amount (no subscription)
   * Uses transaction to prevent race condition with premium init
   */
  async initializeFreeCredits(userId: string): Promise<CreditsResult> {
    const db = getFirestore();
    if (!db) return { success: false, error: { message: "No DB", code: "INIT_ERR" } };

    const freeCredits = this.config.freeCredits ?? 0;
    if (freeCredits <= 0) {
      return { success: false, error: { message: "Free credits not configured", code: "NO_FREE_CREDITS" } };
    }

    try {
      const ref = this.getRef(db, userId);

      // Use transaction to atomically check-and-set
      const result = await runTransaction(db, async (tx: Transaction) => {
        const snap = await tx.get(ref);

        // Don't overwrite if document already exists (premium or previous init)
        if (snap.exists()) {
          if (__DEV__) console.log("[CreditsRepository] Credits document already exists, skipping free credits init");
          const existing = snap.data() as UserCreditsDocumentRead;
          return { skipped: true, data: CreditsMapper.toEntity(existing) };
        }

        // Create new document with free credits
        const now = serverTimestamp();

        const creditsData = {
          // Not premium - just free credits
          isPremium: false,
          status: "free" as const,

          // Free credits - store initial amount for tracking
          credits: freeCredits,
          creditLimit: freeCredits,
          initialFreeCredits: freeCredits,
          isFreeCredits: true,

          // Dates
          createdAt: now,
          lastUpdatedAt: now,
        };

        tx.set(ref, creditsData);

        if (__DEV__) console.log("[CreditsRepository] Initialized free credits:", { userId: userId.slice(0, 8), credits: freeCredits });

        return {
          skipped: false,
          data: {
            isPremium: false,
            status: "free" as const,
            credits: freeCredits,
            creditLimit: freeCredits,
            purchasedAt: null,
            expirationDate: null,
            lastUpdatedAt: null,
            willRenew: false,
          }
        };
      });

      return { success: true, data: result.data };
    } catch (e: any) {
      if (__DEV__) console.error("[CreditsRepository] Free credits init error:", e.message);
      return { success: false, error: { message: e.message, code: "INIT_ERR" } };
    }
  }

  /** Sync expired subscription status to Firestore (background) */
  async syncExpiredStatus(userId: string): Promise<void> {
    const db = getFirestore();
    if (!db) return;

    try {
      const ref = this.getRef(db, userId);
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(ref, {
        isPremium: false,
        status: "expired",
        lastUpdatedAt: serverTimestamp(),
      });
      if (__DEV__) console.log("[CreditsRepository] Synced expired status for:", userId.slice(0, 8));
    } catch (e) {
      if (__DEV__) console.error("[CreditsRepository] Sync expired failed:", e);
    }
  }

}

export const createCreditsRepository = (c: CreditsConfig) => new CreditsRepository(c);
