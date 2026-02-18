export function calculateRemaining(current: number, cost: number): number {
  return Math.max(0, current - cost);
}
