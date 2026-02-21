export interface Success<T> {
  readonly success: true;
  readonly data: T;
  readonly error?: never;
}

export interface Failure<E = Error> {
  readonly success: false;
  readonly data?: never;
  readonly error: E;
}

export type Result<T, E = Error> = Success<T> | Failure<E>;

export function success<T>(data: T): Success<T> {
  return { success: true, data };
}

export function failure<E = Error>(error: E): Failure<E> {
  return { success: false, error };
}

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}

export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw result.error;
}

export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isSuccess(result)) {
    return result.data;
  }
  return defaultValue;
}

export function map<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (isSuccess(result)) {
    return success(fn(result.data));
  }
  return result;
}

export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (isSuccess(result)) {
    return fn(result.data);
  }
  return result;
}

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
