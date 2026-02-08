import type { TrialEligibilityResult, DeviceTrialRecord } from "./TrialTypes";

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
      return { eligible: false, reason: "user_already_used", deviceId };
    }

    if (hasUsedTrial || trialInProgress) {
      return { eligible: false, reason: "already_used", deviceId };
    }

    return { eligible: true, deviceId };
  }
}
