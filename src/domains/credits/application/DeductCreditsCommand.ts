import { runTransaction, serverTimestamp, type DocumentReference } from "firebase/firestore";
import type { Firestore } from "@umituz/react-native-firebase";
import type { DeductCreditsResult } from "../core/Credits";
import { CREDIT_ERROR_CODES, MAX_SINGLE_DEDUCTION } from "../core/CreditsConstants";
import { createLogger } from "../../../shared/utils/logger";

const logger = createLogger("DeductCreditsCommand");

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
    logger.debug(">>> starting transaction", { userId, cost, creditsRefPath: creditsRef.path });

    const remaining = await runTransaction(_db, async (tx) => {
      const docSnap = await tx.get(creditsRef);

      logger.debug("doc exists", { exists: docSnap.exists() });

      if (!docSnap.exists()) {
        throw new Error(CREDIT_ERROR_CODES.NO_CREDITS);
      }

      const rawCredits = docSnap.data().credits;
      const current = typeof rawCredits === "number" && Number.isFinite(rawCredits) ? rawCredits : 0;

      logger.debug("current credits", { current, cost });

      if (current < cost) {
        throw new Error(CREDIT_ERROR_CODES.CREDITS_EXHAUSTED);
      }

      const updated = current - cost;
      tx.update(creditsRef, {
        credits: updated,
        lastUpdatedAt: serverTimestamp()
      });

      logger.debug("updated credits to", { updated });

      return updated;
    });

    logger.debug("transaction SUCCESS", { remaining });

    return {
      success: true,
      remainingCredits: remaining as number,
      error: null
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    const code = (message === CREDIT_ERROR_CODES.NO_CREDITS || message === CREDIT_ERROR_CODES.CREDITS_EXHAUSTED)
      ? message
      : CREDIT_ERROR_CODES.DEDUCT_ERR;

    // Use logger.warn instead of logger.error for "no credits" - this is expected behavior, not a system error
    if (code === CREDIT_ERROR_CODES.NO_CREDITS || code === CREDIT_ERROR_CODES.CREDITS_EXHAUSTED) {
      logger.warn("User has no credits - paywall should open", { code, message });
    } else {
      logger.error("Unexpected transaction error", e, { code, message });
    }

    return {
      success: false,
      remainingCredits: null,
      error: { message, code }
    };
  }
}
