/**
 * useAsyncState Hook
 * Shared hook for managing async operation states
 */

import { useState, useCallback } from "react";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: Error | null;
}

export interface UseAsyncStateOptions<T> {
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseAsyncStateReturn<T> {
  data: T | null;
  status: AsyncStatus;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  setData: (data: T | null) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export function useAsyncState<T>(
  options: UseAsyncStateOptions<T> = {}
): UseAsyncStateReturn<T> {
  const { initialData = null, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    status: initialData ? "success" : "idle",
    error: null,
  });

  const setData = useCallback((data: T | null) => {
    setState({ data, status: data ? "success" : "idle", error: null });
    if (data) onSuccess?.(data);
  }, [onSuccess]);

  const setError = useCallback((error: Error | null) => {
    setState((prev) => ({ ...prev, status: "error", error }));
    if (error) onError?.(error);
  }, [onError]);

  const reset = useCallback(() => {
    setState({ data: initialData, status: initialData ? "success" : "idle", error: null });
  }, [initialData]);

  return {
    data: state.data,
    status: state.status,
    error: state.error,
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    isIdle: state.status === "idle",
    setData,
    setError,
    reset,
  };
}
