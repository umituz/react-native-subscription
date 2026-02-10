/**
 * useServiceCall Hook
 * Shared hook for handling service calls with loading, error, and success states
 */

import { useState, useCallback } from "react";

export interface ServiceCallState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseServiceCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface ServiceCallResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  reset: () => void;
}

export function useServiceCall<T>(
  serviceFn: () => Promise<T>,
  options: UseServiceCallOptions<T> = {}
): ServiceCallResult<T> {
  const { onSuccess, onError, onComplete } = options;
  const [state, setState] = useState<ServiceCallState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const data = await serviceFn();
      setState({ data, isLoading: false, error: null });
      onSuccess?.(data);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("Service call failed");
      setState({ data: null, isLoading: false, error: errorObj });
      onError?.(errorObj);
    } finally {
      onComplete?.();
    }
  }, [serviceFn, onSuccess, onError, onComplete]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    execute,
    reset,
  };
}
