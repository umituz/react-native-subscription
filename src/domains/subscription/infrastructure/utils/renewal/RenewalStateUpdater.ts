import type { RenewalDetectionResult, RenewalState } from "./types";

export function updateRenewalState(
  result: RenewalDetectionResult
): RenewalState {
  return {
    previousExpirationDate: result.newExpirationDate,
    previousProductId: result.productId,
  };
}
