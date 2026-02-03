/**
 * Trial Types and Constants
 * Device-based trial tracking types
 */

/** Trial constants */
export const TRIAL_CONFIG = {
  DURATION_DAYS: 3,
  CREDITS: 5,
} as const;

/** Device trial record in Firestore */
export interface DeviceTrialRecord {
  deviceId: string;
  hasUsedTrial: boolean;
  trialInProgress?: boolean;
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
