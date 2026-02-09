/**
 * Result Pattern
 * Type-safe error handling without exceptions.
 * Inspired by Rust's Result<T, E> and functional programming patterns.
 */

/** Success result containing data */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
  readonly error?: never;
}

/** Failure result containing error */
export interface Failure<E = Error> {
  readonly success: false;
  readonly data?: never;
  readonly error: E;
}

/** Union type representing either success or failure */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/** Create a success result */
export function success<T>(data: T): Success<T> {
  return { success: true, data };
}

/** Create a failure result */
export function failure<E = Error>(error: E): Failure<E> {
  return { success: false, error };
}

/** Type guard to check if result is success */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

/** Type guard to check if result is failure */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}

/** Unwrap result or throw if failure */
export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw result.error;
}

/** Unwrap result or return default value */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isSuccess(result)) {
    return result.data;
  }
  return defaultValue;
}

/** Map success value to new value */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (isSuccess(result)) {
    return success(fn(result.data));
  }
  return result;
}

/** Chain results (flatMap) */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (isSuccess(result)) {
    return fn(result.data);
  }
  return result;
}

/** Execute async function and wrap result */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMapper?: (error: unknown) => Error
): Promise<Result<T, Error>> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    const mappedError = errorMapper
      ? errorMapper(error)
      : error instanceof Error
        ? error
        : new Error(String(error));
    return failure(mappedError);
  }
}

/** Execute sync function and wrap result */
export function tryCatchSync<T>(
  fn: () => T,
  errorMapper?: (error: unknown) => Error
): Result<T, Error> {
  try {
    const data = fn();
    return success(data);
  } catch (error) {
    const mappedError = errorMapper
      ? errorMapper(error)
      : error instanceof Error
        ? error
        : new Error(String(error));
    return failure(mappedError);
  }
}
export function tryCatchSync<T>(
  fn: () => T,
  errorMapper?: (error: unknown) => Error
): Result<T, Error> {
  try {
    const data = fn();
    return success(data);
  } catch {
    const mappedError = errorMapper
      ? errorMapper(error)
      : error instanceof Error
        ? error
        : new Error(String(error));
    return failure(mappedError);
  }
}

/** Combine multiple results into one */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const data: T[] = [];
  for (const result of results) {
    if (isFailure(result)) {
      return result;
    }
    data.push(result.data);
  }
  return success(data);
}
