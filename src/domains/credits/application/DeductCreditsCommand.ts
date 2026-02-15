import { runTransaction, serverTimestamp, type Transaction, type DocumentReference, type Firestore } from "@umituz/react-native-firebase";
import type { DeductCreditsResult } from "../core/Credits";
import { CREDIT_ERROR_CODES } from "../core/CreditsConstants";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";

/**
 * Deducts credits from a user's balance.
 * Encapsulates the domain rules and transaction logic for credit usage.
 */
export async function deductCreditsOperation(
  _db: Firestore,
  creditsRef: DocumentReference,
  cost: number,
  userId: string
): Promise<DeductCreditsResult> {
  if (!userId || userId.trim().length === 0) {
    return {
      success: false,
      remainingCredits: null,
      error: {
        message: 'Valid userId is required for credit deduction',
        code: 'INVALID_USER'
      }
    };
  }

  try {
    const remaining = await runTransaction(async (tx: Transaction) => {
      const docSnap = await tx.get(creditsRef);

      if (!docSnap.exists()) {
        throw new Error(CREDIT_ERROR_CODES.NO_CREDITS);
      }

      const current = docSnap.data().credits as number;
      if (current < cost) {
        throw new Error(CREDIT_ERROR_CODES.CREDITS_EXHAUSTED);
      }

      const updated = current - cost;
      tx.update(creditsRef, {
        credits: updated,
        lastUpdatedAt: serverTimestamp()
      });

      return updated;
    });

    subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);

    return {
      success: true,
      remainingCredits: remaining,
      error: null
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    const code = (message === CREDIT_ERROR_CODES.NO_CREDITS || message === CREDIT_ERROR_CODES.CREDITS_EXHAUSTED) 
      ? message 
      : CREDIT_ERROR_CODES.DEDUCT_ERR;

    return {
      success: false,
      remainingCredits: null,
      error: { message, code }
    };
  }
}
