/**
 * Feedback Submit Hooks
 * React hooks for submitting feedback to Firestore
 */

import { useCallback } from "react";
import { useAuth } from "@umituz/react-native-auth";
import {
  submitPaywallFeedback,
  submitSettingsFeedback,
} from "../../../infrastructure/services/FeedbackService";

export interface UsePaywallFeedbackSubmitOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * Hook for submitting paywall decline feedback
 */
export function usePaywallFeedbackSubmit(
  options: UsePaywallFeedbackSubmitOptions = {}
) {
  const { user } = useAuth();
  const { onSuccess, onError, onComplete } = options;

  const submit = useCallback(
    async (reason: string) => {
      if (__DEV__) {
        console.log("[usePaywallFeedbackSubmit] Submitting:", {
          userId: user?.uid?.slice(0, 8),
          reason: reason.slice(0, 20),
        });
      }

      const result = await submitPaywallFeedback(
        user?.uid ?? null,
        user?.email ?? null,
        reason
      );

      if (result.success) {
        onSuccess?.();
      } else if (result.error) {
        onError?.(result.error);
      }

      onComplete?.();
    },
    [user, onSuccess, onError, onComplete]
  );

  return { submit };
}

export interface SettingsFeedbackData {
  type?: string;
  title?: string;
  description: string;
  rating?: number;
}

export interface UseSettingsFeedbackSubmitOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for submitting general settings feedback
 */
export function useSettingsFeedbackSubmit(
  options: UseSettingsFeedbackSubmitOptions = {}
) {
  const { user } = useAuth();
  const { onSuccess, onError } = options;

  const submit = useCallback(
    async (data: SettingsFeedbackData) => {
      if (__DEV__) {
        console.log("[useSettingsFeedbackSubmit] Submitting:", {
          userId: user?.uid?.slice(0, 8),
          type: data.type,
        });
      }

      const result = await submitSettingsFeedback(
        user?.uid ?? null,
        user?.email ?? null,
        data
      );

      if (result.success) {
        onSuccess?.();
      } else if (result.error) {
        onError?.(result.error);
      }

      return result;
    },
    [user, onSuccess, onError]
  );

  return { submit };
}
