export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

export const isPositive = (value: number): boolean => {
  return value > 0;
};

export const isNonNegative = (value: number): boolean => {
  return value >= 0;
};

export const isValidNumber = (value: number | null | undefined): value is number => {
  return isDefined(value) && !isNaN(value) && isFinite(value);
};
