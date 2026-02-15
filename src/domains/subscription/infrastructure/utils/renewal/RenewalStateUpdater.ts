import type { RenewalState, RenewalDetectionResult } from "./types";

export function updateRenewalState(
  _state: RenewalState,
  result: RenewalDetectionResult
): RenewalState {
  return {
    previousExpirationDate: result.newExpirationDate,
    previousProductId: result.productId,
  };
}
