/**
 * Trial Service
 * Handles device-based trial tracking to prevent abuse
 * Uses persistent device ID that survives app reinstalls
 */

declare const __DEV__: boolean;

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { getFirestore } from "@umituz/react-native-firebase";
import { PersistentDeviceIdService } from "@umituz/react-native-design-system";

const DEVICE_TRIALS_COLLECTION = "device_trials";

/** Trial constants */
export const TRIAL_CONFIG = {
  DURATION_DAYS: 3,
  CREDITS: 5,
} as const;

/** Device trial record in Firestore */
export interface DeviceTrialRecord {
  deviceId: string;
  hasUsedTrial: boolean;
  trialStartedAt?: Date;
  trialEndedAt?: Date;
  trialConvertedAt?: Date;
  lastUserId?: string;
  userIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Trial eligibility result */
export interface TrialEligibilityResult {
  eligible: boolean;
  reason?: "already_used" | "device_not_found" | "error";
  deviceId?: string;
}

/**
 * Get persistent device ID
 */
export async function getDeviceId(): Promise<string> {
  return PersistentDeviceIdService.getDeviceId();
}

/**
 * Check if device is eligible for trial
 */
export async function checkTrialEligibility(
  deviceId?: string
): Promise<TrialEligibilityResult> {
  try {
    const effectiveDeviceId = deviceId || await getDeviceId();
    const db = getFirestore();

    if (!db) {
      if (__DEV__) {
        console.log("[TrialService] No Firestore instance");
      }
      return { eligible: true, deviceId: effectiveDeviceId };
    }

    const trialRef = doc(db, DEVICE_TRIALS_COLLECTION, effectiveDeviceId);
    const trialDoc = await getDoc(trialRef);

    if (!trialDoc.exists()) {
      if (__DEV__) {
        console.log("[TrialService] No trial record found, eligible");
      }
      return { eligible: true, deviceId: effectiveDeviceId };
    }

    const data = trialDoc.data();
    const hasUsedTrial = data?.hasUsedTrial === true;

    if (__DEV__) {
      console.log("[TrialService] Trial record found:", {
        deviceId: effectiveDeviceId.slice(0, 8),
        hasUsedTrial,
      });
    }

    if (hasUsedTrial) {
      return {
        eligible: false,
        reason: "already_used",
        deviceId: effectiveDeviceId,
      };
    }

    return { eligible: true, deviceId: effectiveDeviceId };
  } catch (error) {
    if (__DEV__) {
      console.error("[TrialService] Eligibility check error:", error);
    }
    return { eligible: true, reason: "error" };
  }
}

/**
 * Record trial start for a device
 */
export async function recordTrialStart(
  userId: string,
  deviceId?: string
): Promise<boolean> {
  try {
    const effectiveDeviceId = deviceId || await getDeviceId();
    const db = getFirestore();

    if (!db) {
      if (__DEV__) {
        console.log("[TrialService] No Firestore instance");
      }
      return false;
    }

    const trialRef = doc(db, DEVICE_TRIALS_COLLECTION, effectiveDeviceId);

    await setDoc(
      trialRef,
      {
        deviceId: effectiveDeviceId,
        hasUsedTrial: true,
        trialStartedAt: serverTimestamp(),
        lastUserId: userId,
        userIds: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Also set createdAt if it's a new record
    const existingDoc = await getDoc(trialRef);
    if (!existingDoc.data()?.createdAt) {
      await setDoc(
        trialRef,
        { createdAt: serverTimestamp() },
        { merge: true }
      );
    }

    if (__DEV__) {
      console.log("[TrialService] Trial recorded:", {
        deviceId: effectiveDeviceId.slice(0, 8),
        userId: userId.slice(0, 8),
      });
    }

    return true;
  } catch (error) {
    if (__DEV__) {
      console.error("[TrialService] Record trial error:", error);
    }
    return false;
  }
}

/**
 * Record trial end (cancelled or expired)
 */
export async function recordTrialEnd(
  deviceId?: string
): Promise<boolean> {
  try {
    const effectiveDeviceId = deviceId || await getDeviceId();
    const db = getFirestore();

    if (!db) {
      return false;
    }

    const trialRef = doc(db, DEVICE_TRIALS_COLLECTION, effectiveDeviceId);

    await setDoc(
      trialRef,
      {
        trialEndedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (__DEV__) {
      console.log("[TrialService] Trial end recorded");
    }

    return true;
  } catch (error) {
    if (__DEV__) {
      console.error("[TrialService] Record trial end error:", error);
    }
    return false;
  }
}

/**
 * Record trial conversion to paid subscription
 */
export async function recordTrialConversion(
  deviceId?: string
): Promise<boolean> {
  try {
    const effectiveDeviceId = deviceId || await getDeviceId();
    const db = getFirestore();

    if (!db) {
      return false;
    }

    const trialRef = doc(db, DEVICE_TRIALS_COLLECTION, effectiveDeviceId);

    await setDoc(
      trialRef,
      {
        trialConvertedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (__DEV__) {
      console.log("[TrialService] Trial conversion recorded");
    }

    return true;
  } catch (error) {
    if (__DEV__) {
      console.error("[TrialService] Record conversion error:", error);
    }
    return false;
  }
}
