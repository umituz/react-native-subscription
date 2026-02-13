export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function calculatePercentageClamped(value: number, total: number): number {
  return clamp(calculatePercentage(value, total), 0, 100);
}

export function isApproximatelyEqual(a: number, b: number, epsilon: number = 0.0001): boolean {
  return Math.abs(a - b) < epsilon;
}

export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

export function calculateRemaining(current: number, cost: number): number {
  return Math.max(0, current - cost);
}
