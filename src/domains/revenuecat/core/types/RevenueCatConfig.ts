import type {
  PurchaseCompletedEvent,
  RenewalDetectedEvent,
  PremiumStatusChangedEvent,
  PlanChangedEvent,
  RestoreCompletedEvent,
} from "../../../subscription/core/SubscriptionEvents";

export interface RevenueCatConfig {
  apiKey?: string;
  entitlementIdentifier: string;
  consumableProductIdentifiers?: string[];
  onPremiumStatusChanged?: (event: PremiumStatusChangedEvent) => Promise<void> | void;
  onPurchaseCompleted?: (event: PurchaseCompletedEvent) => Promise<void> | void;
  onRestoreCompleted?: (event: RestoreCompletedEvent) => Promise<void> | void;
  onRenewalDetected?: (event: RenewalDetectedEvent) => Promise<void> | void;
  onPlanChanged?: (event: PlanChangedEvent) => Promise<void> | void;
  onCreditsUpdated?: (userId: string) => void;
}
