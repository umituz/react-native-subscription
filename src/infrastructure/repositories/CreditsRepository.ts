
/**
 * Credits Repository
 *
 * Firestore operations for user credits management.
 * Extends BaseRepository from @umituz/react-native-firebase.
 */

  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  type Firestore,
  type Transaction,
} from "firebase/firestore";
import { BaseRepository, getFirestore } from "@umituz/react-native-firebase";
import type {
  CreditType,
  CreditsConfig,
  CreditsResult,
  DeductCreditsResult,
} from "../../domain/entities/Credits";
import type { UserCreditsDocumentRead } from "../models/UserCreditsDocument";
import { initializeCreditsTransaction } from "../services/CreditsInitializer";
import { detectPackageType } from "../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../utils/creditMapper";

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
    const db = getFirestore();
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
          message: error instanceof Error ? error.message : "Failed to get credits",
          code: "FETCH_FAILED",
        },
      };
    }
  }

  async initializeCredits(
    userId: string,
    purchaseId?: string,
    productId?: string
  ): Promise<CreditsResult> {
    const db = getFirestore();
    if (!db) {
      return {
        success: false,
        error: { message: "Database not available", code: "INIT_FAILED" },
      };
    }

    if (__DEV__) {
      console.log("[CreditsRepository] Initialize credits:", {
        userId,
        purchaseId,
        productId,
      });
    }

    try {
      const creditsRef = this.getCreditsDocRef(db, userId);

      // Determine credit allocation based on product ID
      let configToUse = this.config;

      if (productId) {
        const packageType = detectPackageType(productId);
        const allocation = getCreditAllocation(packageType);

        if (allocation) {
          // Override config with tier-specific credit amounts
          configToUse = {
            ...this.config,
            imageCreditLimit: allocation.imageCredits,
            textCreditLimit: allocation.textCredits,
          };

          if (__DEV__) {
            console.log("[CreditsRepository] Using tier-based allocation:", {
              packageType,
              imageCredits: allocation.imageCredits,
              textCredits: allocation.textCredits,
            });
          }
        } else {
          if (__DEV__) {
            console.warn(
              "[CreditsRepository] Could not determine package type, using default config:",
              this.config
            );
          }
        }
      }

      const result = await initializeCreditsTransaction(
        db,
        creditsRef,
        configToUse,
        purchaseId
      );

      if (__DEV__) {
        console.log("[CreditsRepository] Credits initialized successfully:", {
          imageCredits: result.imageCredits,
          textCredits: result.textCredits,
        });
      }

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
      if (__DEV__) {
        console.error("[CreditsRepository] Failed to initialize credits:", error);
      }

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Failed to initialize credits",
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

      const newCredits = await runTransaction(db, async (transaction: Transaction) => {
        const creditsDoc = await transaction.get(creditsRef);
        if (!creditsDoc.exists()) throw new Error("NO_CREDITS");

        const currentCredits = creditsDoc.data()[fieldName] as number;
        if (currentCredits <= 0) throw new Error("CREDITS_EXHAUSTED");

        const updatedCredits = currentCredits - 1;
        transaction.update(creditsRef, {
          [fieldName]: updatedCredits,
          lastUpdatedAt: serverTimestamp(),
        });
        return updatedCredits;
      });

      return { success: true, remainingCredits: newCredits };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      const code = msg === "NO_CREDITS" || msg === "CREDITS_EXHAUSTED" ? msg : "DEDUCT_FAILED";
      const message = msg === "NO_CREDITS" ? "No credits found" : msg === "CREDITS_EXHAUSTED" ? "Credits exhausted" : msg;

      return { success: false, error: { message, code } };
    }
  }

  async hasCredits(userId: string, creditType: CreditType): Promise<boolean> {
    const result = await this.getCredits(userId);
    if (!result.success || !result.data) return false;
    const credits = creditType === "text" ? result.data.textCredits : result.data.imageCredits;
    return credits > 0;
  }
}

export const createCreditsRepository = (
  config: CreditsConfig
): CreditsRepository => {
  return new CreditsRepository(config);
};
