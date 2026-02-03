/**
 * Free Credits Service
 * Handles initialization of free credits for new users
 */
declare const __DEV__: boolean;

import { runTransaction, serverTimestamp, type Firestore, type DocumentReference, type Transaction } from "firebase/firestore";
import { getFirestore } from "@umituz/react-native-firebase";
import type { CreditsConfig, CreditsResult, UserCredits } from "../../domain/entities/Credits";
import type { UserCreditsDocumentRead } from "../models/UserCreditsDocument";
import { CreditsMapper } from "../mappers/CreditsMapper";

export interface FreeCreditsServiceConfig {
  config: CreditsConfig;
  getRef: (db: Firestore, userId: string) => DocumentReference;
}

/**
 * Initialize free credits for new users
 * Creates a credits document with freeCredits amount (no subscription)
 * Uses transaction to prevent race condition with premium init
 */
export async function initializeFreeCredits(
  deps: FreeCreditsServiceConfig,
  userId: string
): Promise<CreditsResult> {
  const db = getFirestore();
  if (!db) return { success: false, error: { message: "No DB", code: "INIT_ERR" } };

  const freeCredits = deps.config.freeCredits ?? 0;
  if (freeCredits <= 0) {
    return { success: false, error: { message: "Free credits not configured", code: "NO_FREE_CREDITS" } };
  }

  try {
    const ref = deps.getRef(db, userId);

    const result = await runTransaction(db, async (tx: Transaction) => {
      const snap = await tx.get(ref);

      // Don't overwrite if document already exists (premium or previous init)
      if (snap.exists()) {
        if (__DEV__) console.log("[FreeCreditsService] Credits document exists, skipping");
        const existing = snap.data() as UserCreditsDocumentRead;
        return { skipped: true, data: CreditsMapper.toEntity(existing) };
      }

      // Create new document with free credits
      const now = serverTimestamp();
      const creditsData = {
        isPremium: false,
        status: "free" as const,
        credits: freeCredits,
        creditLimit: freeCredits,
        initialFreeCredits: freeCredits,
        isFreeCredits: true,
        createdAt: now,
        lastUpdatedAt: now,
      };

      tx.set(ref, creditsData);

      if (__DEV__) console.log("[FreeCreditsService] Initialized:", { userId: userId.slice(0, 8), credits: freeCredits });

      const entity: UserCredits = {
        isPremium: false,
        status: "free",
        credits: freeCredits,
        creditLimit: freeCredits,
        purchasedAt: null,
        expirationDate: null,
        lastUpdatedAt: null,
        willRenew: false,
      };
      return { skipped: false, data: entity };
    });

    return { success: true, data: result.data };
  } catch (e: any) {
    if (__DEV__) console.error("[FreeCreditsService] Init error:", e.message);
    return { success: false, error: { message: e.message, code: "INIT_ERR" } };
  }
}
