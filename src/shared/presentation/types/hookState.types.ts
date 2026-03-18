/**
 * Standardized hook state types for consistent return values across all hooks.
 *
 * Benefits:
 * - Type consistency across 25+ hooks
 * - Easier to understand and maintain
 * - Better IDE autocomplete
 * - Predictable API surface
 */

/**
 * Standard hook state returned by data-fetching hooks.
 * Provides consistent interface for loading, error, and data states.
 *
 * @template T - The type of data returned by the hook
 */
export interface HookState<T> {
  /** The fetched data, or null if not yet loaded or on error */
  data: T | null;

  /** Whether the hook is currently fetching data */
  isLoading: boolean;

  /** Any error that occurred during fetching, or null if no error */
  error: Error | null;

  /** Function to manually refetch data (no-op for real-time sync hooks) */
  refetch: () => void;
}

/**
 * Extended hook state that includes isEmpty for collection queries.
 * Useful when you need to distinguish between "no data" and "loading".
 *
 * @template T - The type of data in the array (typically a document type)
 */
export interface HookStateWithEmpty<T> extends HookState<T[]> {
  /** Whether the data array is empty (only meaningful when isLoading is false) */
  isEmpty: boolean;
}

/**
 * Extended hook state that includes metadata.
 * Useful for hooks that need to return additional computed values.
 *
 * @template T - The type of data returned by the hook
 * @template M - The type of metadata
 */
export interface HookStateWithMeta<T, M> extends HookState<T> {
  /** Additional computed or derived metadata */
  meta: M;
}

/**
 * Factory function to create a standard HookState.
 * Useful for testing or when you need to construct state objects.
 */
export function createHookState<T>(
  data: T | null,
  isLoading: boolean,
  error: Error | null,
  refetch: () => void = () => {}
): HookState<T> {
  return { data, isLoading, error, refetch };
}

/**
 * Factory function to create a HookStateWithEmpty.
 * Automatically computes isEmpty from the data array.
 */
export function createHookStateWithEmpty<T>(
  data: T[] | null,
  isLoading: boolean,
  error: Error | null,
  refetch: () => void = () => {}
): HookStateWithEmpty<T> {
  return {
    data,
    isLoading,
    error,
    refetch,
    isEmpty: data === null ? false : data.length === 0,
  };
}

/**
 * Factory function to create a HookStateWithMeta.
 */
export function createHookStateWithMeta<T, M>(
  data: T | null,
  isLoading: boolean,
  error: Error | null,
  meta: M,
  refetch: () => void = () => {}
): HookStateWithMeta<T, M> {
  return { data, isLoading, error, refetch, meta };
}
