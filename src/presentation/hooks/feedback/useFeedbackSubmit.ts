/**
 * Feedback Submit Hooks
 * React hooks for submitting feedback to Firestore
 */

import { useCallback } from "react";
import { useAuth } from "@umituz/react-native-auth";
import {
  submitPaywallFeedback,
  submitSettingsFeedback,
} from "../../../shared/application/FeedbackService";

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
      try {
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
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error("Feedback submission failed"));
      } finally {
        onComplete?.();
      }
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
      try {
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
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error("Feedback submission failed"));
        return { success: false, error: err instanceof Error ? err : new Error("Feedback submission failed") };
      }
    },
    [user, onSuccess, onError]
  );

  return { submit };
}
