import type { TrialEligibilityResult, DeviceTrialRecord } from "../core/TrialTypes";

export class TrialEligibilityService {
  static check(
    userId: string | undefined, 
    deviceId: string, 
    record: DeviceTrialRecord | null
  ): TrialEligibilityResult {
    if (!record) {
      return { eligible: true, deviceId };
    }

    const { hasUsedTrial, trialInProgress, userIds = [] } = record;

    if (userId && userIds.includes(userId)) {
      // Detect corrupted state: user in list but flags say trial not used
      if (!hasUsedTrial && !trialInProgress) {
        console.warn('[TrialEligibilityService] Corrupted trial state detected', {
          userId,
          deviceId,
          hasUsedTrial,
          trialInProgress,
          userIdsCount: userIds.length
        });
      }
      return { eligible: false, reason: "user_already_used", deviceId };
    }

    if (hasUsedTrial || trialInProgress) {
      return { eligible: false, reason: "already_used", deviceId };
    }

    return { eligible: true, deviceId };
  }
}
