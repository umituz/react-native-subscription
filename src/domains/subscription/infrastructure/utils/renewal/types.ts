export interface RenewalState {
  previousExpirationDate: string | null;
  previousProductId: string | null;
}

export interface RenewalDetectionResult {
  isRenewal: boolean;
  isPlanChange: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
  productId: string | null;
  previousProductId: string | null;
  newExpirationDate: string | null;
}
