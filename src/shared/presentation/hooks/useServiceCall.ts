/**
 * useServiceCall Hook
 * Shared hook for handling service calls with loading, error, and success states
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { normalizeError } from "../../utils/errorUtils";

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

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onCompleteRef.current = onComplete;
  });

  const execute = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const data = await serviceFn();
      setState({ data, isLoading: false, error: null });
      onSuccessRef.current?.(data);
    } catch (error) {
      const errorObj = normalizeError(error, "Service call failed");
      setState({ data: null, isLoading: false, error: errorObj });
      onErrorRef.current?.(errorObj);
    } finally {
      onCompleteRef.current?.();
    }
  }, [serviceFn]);

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
