import { runTransaction, serverTimestamp, type Transaction, type DocumentReference, type Firestore } from "@umituz/react-native-firebase";
import type { DeductCreditsResult } from "../core/Credits";
import { CREDIT_ERROR_CODES } from "../core/CreditsConstants";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";

export async function refundCreditsOperation(
  _db: Firestore,
  creditsRef: DocumentReference,
  amount: number,
  userId: string
): Promise<DeductCreditsResult> {
  if (!userId || userId.trim().length === 0) {
    return {
      success: false,
      remainingCredits: null,
      error: {
        message: 'Valid userId is required for credit refund',
        code: 'INVALID_USER'
      }
    };
  }

  if (amount <= 0 || !Number.isFinite(amount)) {
    return {
      success: false,
      remainingCredits: null,
      error: {
        message: 'Refund amount must be positive',
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

      const current = docSnap.data().credits as number;
      const updated = current + amount;

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
    const code = message === CREDIT_ERROR_CODES.NO_CREDITS
      ? message
      : 'REFUND_ERROR';

    return {
      success: false,
      remainingCredits: null,
      error: { message, code }
    };
  }
}
