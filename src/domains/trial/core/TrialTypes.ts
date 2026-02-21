export const TRIAL_CONFIG = {
  DURATION_DAYS: 3,
  CREDITS: 0,
} as const;

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

export interface TrialEligibilityResult {
  eligible: boolean;
  reason?: "already_used" | "device_not_found" | "error" | "user_already_used";
  deviceId?: string;
}
