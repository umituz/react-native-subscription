/**
 * Credits Repository
 *
 * Firestore operations for user credits management.
 * Extends BaseRepository from @umituz/react-native-firestore.
 *
 * Generic and reusable - accepts config from main app.
 */

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  type FieldValue,
  type Firestore,
} from "firebase/firestore";
import { BaseRepository, getFirestore } from "@umituz/react-native-firestore";
import type {
  CreditType,
  CreditsConfig,
  CreditsResult,
  DeductCreditsResult,
} from "../../domain/entities/Credits";

interface FirestoreTimestamp {
  toDate: () => Date;
}

// Document structure when READING from Firestore
interface UserCreditsDocumentRead {
  textCredits: number;
  imageCredits: number;
  purchasedAt?: FirestoreTimestamp;
  lastUpdatedAt?: FirestoreTimestamp;
  lastPurchaseAt?: FirestoreTimestamp;
  processedPurchases?: string[];
}

export class CreditsRepository extends BaseRepository {
  private config: CreditsConfig;

  constructor(config: CreditsConfig) {
    super();
    this.config = config;
  }

  private getCreditsDocRef(db: Firestore, userId: string) {
    if (this.config.useUserSubcollection) {
      return doc(db, "users", userId, "credits", "data");
    }
    return doc(db, this.config.collectionName, userId);
  }

  async getCredits(userId: string): Promise<CreditsResult> {
    const db = this.getDb();
    if (!db) {
      return {
        success: false,
        error: { message: "Database not available", code: "DB_NOT_AVAILABLE" },
      };
    }

    try {
      const creditsRef = this.getCreditsDocRef(db, userId);
      const snapshot = await getDoc(creditsRef);

      if (!snapshot.exists()) {
        return { success: true, data: undefined };
      }

      const data = snapshot.data() as UserCreditsDocumentRead;
      return {
        success: true,
        data: {
          textCredits: data.textCredits,
          imageCredits: data.imageCredits,
          purchasedAt: data.purchasedAt?.toDate?.() || new Date(),
          lastUpdatedAt: data.lastUpdatedAt?.toDate?.() || new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to get credits",
          code: "FETCH_FAILED",
        },
      };
    }
  }

  async initializeCredits(
    userId: string,
    purchaseId?: string
  ): Promise<CreditsResult> {
    const db = getFirestore();
    if (!db) {
      return {
        success: false,
        error: { message: "Database not available", code: "INIT_FAILED" },
      };
    }

    try {
      const creditsRef = this.getCreditsDocRef(db, userId);

      const result = await runTransaction(db, async (transaction) => {
        const creditsDoc = await transaction.get(creditsRef);
        const now = serverTimestamp();

        let newTextCredits = this.config.textCreditLimit;
        let newImageCredits = this.config.imageCreditLimit;
        let purchasedAt = now;
        let processedPurchases: string[] = [];

        if (creditsDoc.exists()) {
          const existing = creditsDoc.data() as UserCreditsDocumentRead;
          processedPurchases = existing.processedPurchases || [];

          if (purchaseId && processedPurchases.includes(purchaseId)) {
            return {
              textCredits: existing.textCredits,
              imageCredits: existing.imageCredits,
              alreadyProcessed: true,
            };
          }

          newTextCredits =
            (existing.textCredits || 0) + this.config.textCreditLimit;
          newImageCredits =
            (existing.imageCredits || 0) + this.config.imageCreditLimit;
          // Keep existing purchasedAt if available, otherwise use server timestamp
          if (existing.purchasedAt) {
            purchasedAt = existing.purchasedAt as unknown as FieldValue;
          }
        }

        if (purchaseId) {
          processedPurchases = [...processedPurchases, purchaseId].slice(-10);
        }

        transaction.set(creditsRef, {
          textCredits: newTextCredits,
          imageCredits: newImageCredits,
          purchasedAt,
          lastUpdatedAt: now,
          lastPurchaseAt: now,
          processedPurchases,
        });

        return { textCredits: newTextCredits, imageCredits: newImageCredits };
      });

      return {
        success: true,
        data: {
          textCredits: result.textCredits,
          imageCredits: result.imageCredits,
          purchasedAt: new Date(),
          lastUpdatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to initialize credits",
          code: "INIT_FAILED",
        },
      };
    }
  }

  async deductCredit(
    userId: string,
    creditType: CreditType
  ): Promise<DeductCreditsResult> {
    const db = getFirestore();
    if (!db) {
      return {
        success: false,
        error: { message: "Database not available", code: "DEDUCT_FAILED" },
      };
    }

    try {
      const creditsRef = this.getCreditsDocRef(db, userId);
      const fieldName = creditType === "text" ? "textCredits" : "imageCredits";

      const newCredits = await runTransaction(db, async (transaction) => {
        const creditsDoc = await transaction.get(creditsRef);

        if (!creditsDoc.exists()) {
          throw new Error("NO_CREDITS");
        }

        const currentCredits = creditsDoc.data()[fieldName] as number;

        if (currentCredits <= 0) {
          throw new Error("CREDITS_EXHAUSTED");
        }

        const updatedCredits = currentCredits - 1;
        transaction.update(creditsRef, {
          [fieldName]: updatedCredits,
          lastUpdatedAt: serverTimestamp(),
        });

        return updatedCredits;
      });

      return { success: true, remainingCredits: newCredits };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage === "NO_CREDITS") {
        return {
          success: false,
          error: { message: "No credits found", code: "NO_CREDITS" },
        };
      }

      if (errorMessage === "CREDITS_EXHAUSTED") {
        return {
          success: false,
          error: { message: "Credits exhausted", code: "CREDITS_EXHAUSTED" },
        };
      }

      return {
        success: false,
        error: { message: errorMessage, code: "DEDUCT_FAILED" },
      };
    }
  }

  async hasCredits(userId: string, creditType: CreditType): Promise<boolean> {
    const result = await this.getCredits(userId);
    if (!result.success || !result.data) {
      return false;
    }

    const credits =
      creditType === "text" ? result.data.textCredits : result.data.imageCredits;
    return credits > 0;
  }
}

export const createCreditsRepository = (
  config: CreditsConfig
): CreditsRepository => {
  return new CreditsRepository(config);
};
