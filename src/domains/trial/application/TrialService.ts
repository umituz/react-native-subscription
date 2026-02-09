/**
 * Trial Service - Facade for device-based trial tracking
 */

import { arrayUnion, serverTimestamp } from "firebase/firestore";
import { PersistentDeviceIdService } from "@umituz/react-native-design-system";
import { DeviceTrialRepository } from "../infrastructure/DeviceTrialRepository";
import { TrialEligibilityService } from "./TrialEligibilityService";
import type { TrialEligibilityResult } from "../core/TrialTypes";
export type { TrialEligibilityResult };

const repository = new DeviceTrialRepository();

export const getDeviceId = () => PersistentDeviceIdService.getDeviceId();

export async function checkTrialEligibility(userId?: string, deviceId?: string): Promise<TrialEligibilityResult> {
  try {
    const id = deviceId || await getDeviceId();
    const record = await repository.getRecord(id);
    return TrialEligibilityService.check(userId, id, record);
  } catch {
    return { eligible: false, reason: "error" };
  }
}

export async function recordTrialStart(userId: string, deviceId?: string): Promise<boolean> {
  try {
    const id = deviceId || await getDeviceId();
    return await repository.saveRecord(id, {
      deviceId: id,
      trialInProgress: true,
      trialStartedAt: serverTimestamp() as any,
      lastUserId: userId,
      userIds: arrayUnion(userId) as any,
    });
  } catch {
    return false;
  }
}

export async function recordTrialEnd(deviceId?: string): Promise<boolean> {
  try {
    const id = deviceId || await getDeviceId();
    return await repository.saveRecord(id, {
      hasUsedTrial: true,
      trialInProgress: false,
      trialEndedAt: serverTimestamp() as any,
    });
  } catch {
    return false;
  }
}

export async function recordTrialConversion(deviceId?: string): Promise<boolean> {
  try {
    const id = deviceId || await getDeviceId();
    return await repository.saveRecord(id, {
      hasUsedTrial: true,
      trialInProgress: false,
      trialConvertedAt: serverTimestamp() as any,
    });
  } catch {
    return false;
  }
}
