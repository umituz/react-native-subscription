import type { UserCreditsDocumentRead, PurchaseMetadata } from "../core/UserCreditsDocument";
import type { InitializeCreditsMetadata } from "../../subscription/application/SubscriptionInitializerTypes";
import type { Platform } from "../../subscription/core/SubscriptionConstants";

export interface CalculateCreditsParams {
  metadata: InitializeCreditsMetadata;
  existingData: UserCreditsDocumentRead;
  creditLimit: number;
  purchaseId: string;
}

export interface BuildCreditsDataParams {
  existingData: UserCreditsDocumentRead;
  newCredits: number;
  creditLimit: number;
  purchaseId: string;
  metadata: InitializeCreditsMetadata;
  purchaseHistory: PurchaseMetadata[];
  platform: Platform;
}
