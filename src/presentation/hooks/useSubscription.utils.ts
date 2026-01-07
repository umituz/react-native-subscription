/**
 * useSubscription Utilities
 * Shared utilities for subscription hook operations
 */

export type AsyncSubscriptionOperation<T> = () => Promise<T>;

/**
 * Result of a subscription service initialization check
 */
export interface ServiceCheckResult {
  success: boolean;
  service: ReturnType<typeof import("../../infrastructure/services/SubscriptionService").getSubscriptionService> | null;
  error?: string;
}

/**
 * Checks if subscription service is initialized
 * Returns service instance or error
 */
export function checkSubscriptionService(): ServiceCheckResult {
  const { getSubscriptionService } = require("../../infrastructure/services/SubscriptionService");
  const service = getSubscriptionService();

  if (!service) {
    return {
      success: false,
      service: null,
      error: "Subscription service is not initialized",
    };
  }

  return { success: true, service, error: undefined };
}

/**
 * Validates user ID
 */
export function validateUserId(userId: string): string | null {
  if (!userId) {
    return "User ID is required";
  }
  return null;
}

/**
 * Wraps async subscription operations with loading state, error handling, and state updates
 */
export async function executeSubscriptionOperation<T>(
  operation: AsyncSubscriptionOperation<T>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  onSuccess?: (result: T) => void
): Promise<void> {
  setLoading(true);
  setError(null);

  try {
    const result = await operation();
    if (onSuccess) {
      onSuccess(result);
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Operation failed";
    setError(errorMessage);
    throw err;
  } finally {
    setLoading(false);
  }
}

/**
 * Formats error message from unknown error
 */
export function formatErrorMessage(err: unknown, fallbackMessage: string): string {
  return err instanceof Error ? err.message : fallbackMessage;
}
