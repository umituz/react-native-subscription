/**
 * useTrialEligibility Hook
 * Checks if device is eligible for free trial
 * Uses persistent device ID to prevent trial abuse
 */

import { useState, useEffect, useCallback } from "react";
import {
  checkTrialEligibility,
  getDeviceId,
} from "../../infrastructure/services/TrialService";

export interface UseTrialEligibilityResult {
  /** Whether device is eligible for trial */
  isEligible: boolean;
  /** Whether eligibility check is in progress */
  isLoading: boolean;
  /** Reason why not eligible (if applicable) */
  reason?: "already_used" | "device_not_found" | "error";
  /** Device ID used for checking */
  deviceId: string | null;
  /** Refresh eligibility status */
  refresh: () => Promise<void>;
}

/**
 * Hook to check trial eligibility based on device ID
 * Device ID persists across app reinstalls via Keychain
 */
export function useTrialEligibility(): UseTrialEligibilityResult {
  const [isEligible, setIsEligible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [reason, setReason] = useState<"already_used" | "device_not_found" | "error">();
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const checkEligibility = useCallback(async () => {
    setIsLoading(true);

    try {
      const id = await getDeviceId();
      setDeviceId(id);

      const result = await checkTrialEligibility(id);
      setIsEligible(result.eligible);
      setReason(result.reason);
    } catch {
      // On error, allow trial (better UX)
      setIsEligible(true);
      setReason("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  return {
    isEligible,
    isLoading,
    reason,
    deviceId,
    refresh: checkEligibility,
  };
}
