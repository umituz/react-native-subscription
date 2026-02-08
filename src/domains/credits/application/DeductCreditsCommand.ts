import { runTransaction, serverTimestamp, type Firestore, type Transaction, type DocumentReference } from "firebase/firestore";
import { getFirestore } from "@umituz/react-native-firebase";
import type { DeductCreditsResult } from "../core/Credits";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";

export interface IDeductCreditsCommand {
  execute(userId: string, cost: number): Promise<DeductCreditsResult>;
}

/**
 * Command for deducting credits.
 * Encapsulates the domain rules and transaction logic for credit usage.
 */
export class DeductCreditsCommand implements IDeductCreditsCommand {
  constructor(
    private getCreditsRef: (db: Firestore, userId: string) => DocumentReference
  ) {}

  async execute(userId: string, cost: number): Promise<DeductCreditsResult> {
    const db = getFirestore();
    if (!db) {
      return {
        success: false,
        remainingCredits: null,
        error: { message: "No DB", code: "ERR" }
      };
    }

    try {
      const remaining = await runTransaction(db, async (tx: Transaction) => {
        const ref = this.getCreditsRef(db, userId);
        const docSnap = await tx.get(ref);

        if (!docSnap.exists()) {
          throw new Error("NO_CREDITS");
        }

        const current = docSnap.data().credits as number;
        if (current < cost) {
          throw new Error("CREDITS_EXHAUSTED");
        }

        const updated = current - cost;
        tx.update(ref, {
          credits: updated,
          lastUpdatedAt: serverTimestamp()
        });

        return updated;
      });

      // Emit event via EventBus (Observer Pattern)
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);

      return {
        success: true,
        remainingCredits: remaining,
        error: null
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const code = message === "NO_CREDITS" || message === "CREDITS_EXHAUSTED" ? message : "DEDUCT_ERR";
      return {
        success: false,
        remainingCredits: null,
        error: { message, code }
      };
    }
  }
}
