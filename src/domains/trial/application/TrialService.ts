/**
 * Trial Service - Facade for device-based trial tracking
 */

import { arrayUnion, type FieldValue } from "firebase/firestore";
import { serverTimestamp } from "@umituz/react-native-firebase";
import { PersistentDeviceIdService } from "@umituz/react-native-design-system";
import { DeviceTrialRepository } from "../infrastructure/DeviceTrialRepository";
import { TrialEligibilityService } from "./TrialEligibilityService";
import type { TrialEligibilityResult } from "../core/TrialTypes";
export type { TrialEligibilityResult };

// Type for Firestore write operations with FieldValue
interface TrialRecordWrite {
  deviceId?: string;
  hasUsedTrial?: boolean;
  trialInProgress?: boolean;
  trialStartedAt?: FieldValue;
  trialEndedAt?: FieldValue;
  trialConvertedAt?: FieldValue;
  lastUserId?: string;
  userIds?: FieldValue;
}

const repository = new DeviceTrialRepository();

export const getDeviceId = () => PersistentDeviceIdService.getDeviceId();

/**
 * Ensures a valid device ID is available
 * Uses provided deviceId if non-empty, otherwise fetches from PersistentDeviceIdService
 */
async function ensureDeviceId(deviceId?: string): Promise<string> {
  return (deviceId && deviceId.length > 0) ? deviceId : await getDeviceId();
}

export async function checkTrialEligibility(userId?: string, deviceId?: string): Promise<TrialEligibilityResult> {
  try {
    const id = await ensureDeviceId(deviceId);
    const record = await repository.getRecord(id);
    return TrialEligibilityService.check(userId, id, record);
  } catch {
    return { eligible: false, reason: "error" };
  }
}

export async function recordTrialStart(userId: string, deviceId?: string): Promise<boolean> {
  try {
    const id = await ensureDeviceId(deviceId);
    const record: TrialRecordWrite = {
      deviceId: id,
      trialInProgress: true,
      trialStartedAt: serverTimestamp(),
      lastUserId: userId,
      userIds: arrayUnion(userId),
    };
    return await repository.saveRecord(id, record as any);
  } catch {
    return false;
  }
}

export async function recordTrialEnd(deviceId?: string): Promise<boolean> {
  try {
    const id = await ensureDeviceId(deviceId);
    const record: TrialRecordWrite = {
      hasUsedTrial: true,
      trialInProgress: false,
      trialEndedAt: serverTimestamp(),
    };
    return await repository.saveRecord(id, record as any);
  } catch {
    return false;
  }
}

export async function recordTrialConversion(deviceId?: string): Promise<boolean> {
  try {
    const id = await ensureDeviceId(deviceId);
    const record: TrialRecordWrite = {
      hasUsedTrial: true,
      trialInProgress: false,
      trialConvertedAt: serverTimestamp(),
    };
    return await repository.saveRecord(id, record as any);
  } catch {
    return false;
  }
}
