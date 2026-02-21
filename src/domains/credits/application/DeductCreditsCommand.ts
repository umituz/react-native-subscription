import { runTransaction, serverTimestamp, type Transaction, type DocumentReference, type Firestore } from "@umituz/react-native-firebase";
import type { DeductCreditsResult } from "../core/Credits";
import { CREDIT_ERROR_CODES } from "../core/CreditsConstants";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";

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

  const MAX_SINGLE_DEDUCTION = 10000;
  if (cost <= 0 || !Number.isFinite(cost) || cost > MAX_SINGLE_DEDUCTION) {
    return {
      success: false,
      remainingCredits: null,
      error: {
        message: `Cost must be a positive finite number not exceeding ${MAX_SINGLE_DEDUCTION}`,
        code: 'INVALID_AMOUNT'
      }
    };
  }

  try {
    const remaining = await runTransaction(async (tx: Transaction) => {
      const docSnap = await tx.get(creditsRef);

      if (!docSnap.exists()) {
        throw new Error(CREDIT_ERROR_CODES.NO_CREDITS);
      }

      const rawCredits = docSnap.data().credits;
      const current = typeof rawCredits === "number" && Number.isFinite(rawCredits) ? rawCredits : 0;
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
