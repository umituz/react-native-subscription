import { runTransaction, serverTimestamp, type Transaction, type DocumentReference, type Firestore } from "@umituz/react-native-firebase";
import type { DeductCreditsResult } from "../core/Credits";
import { CREDIT_ERROR_CODES, MAX_SINGLE_DEDUCTION } from "../core/CreditsConstants";
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
    if (__DEV__) console.log('[DeductCreditsCommand] >>> starting transaction', { userId, cost, creditsRefPath: creditsRef.path });

    const remaining = await runTransaction(async (tx: Transaction) => {
      const docSnap = await tx.get(creditsRef);

      if (__DEV__) console.log('[DeductCreditsCommand] doc exists:', docSnap.exists());

      if (!docSnap.exists()) {
        throw new Error(CREDIT_ERROR_CODES.NO_CREDITS);
      }

      const rawCredits = docSnap.data().credits;
      const current = typeof rawCredits === "number" && Number.isFinite(rawCredits) ? rawCredits : 0;

      if (__DEV__) console.log('[DeductCreditsCommand] current credits:', current, 'cost:', cost);

      if (current < cost) {
        throw new Error(CREDIT_ERROR_CODES.CREDITS_EXHAUSTED);
      }

      const updated = current - cost;
      tx.update(creditsRef, {
        credits: updated,
        lastUpdatedAt: serverTimestamp()
      });

      if (__DEV__) console.log('[DeductCreditsCommand] updated credits to:', updated);

      return updated;
    });

    if (__DEV__) console.log('[DeductCreditsCommand] transaction SUCCESS, remaining:', remaining);

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

    // Use console.warn instead of console.error for "no credits" - this is expected behavior, not a system error
    if (__DEV__) {
      if (code === CREDIT_ERROR_CODES.NO_CREDITS || code === CREDIT_ERROR_CODES.CREDITS_EXHAUSTED) {
        console.warn('[DeductCreditsCommand] ⚠️ User has no credits - paywall should open', { code, message });
      } else {
        console.error('[DeductCreditsCommand] ❌ Unexpected transaction error:', { code, message });
      }
    }

    return {
      success: false,
      remainingCredits: null,
      error: { message, code }
    };
  }
}
