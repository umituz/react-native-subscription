import type { SubscriptionStatusType } from "../../../core/SubscriptionConstants";

export interface SubscriptionHeaderProps {
  statusType: SubscriptionStatusType;
  showExpirationDate: boolean;
  expirationDate?: string;
  purchaseDate?: string;
  daysRemaining?: number | null;
  hideTitle?: boolean;
  translations: {
    title: string;
    statusActive: string;
    statusExpired: string;
    statusFree: string;
    statusCanceled: string;
    statusLabel: string;
    expiresLabel: string;
    purchasedLabel: string;
    willRenewLabel?: string;
    productLabel?: string;
    planTypeLabel?: string;
    periodTypeLabel?: string;
    storeLabel?: string;
    originalPurchaseDateLabel?: string;
    latestPurchaseDateLabel?: string;
    billingIssuesLabel?: string;
    sandboxLabel?: string;
  };
  // Additional RevenueCat subscription details
  willRenew?: boolean | null;
  productIdentifier?: string | null;
  productName?: string | null;
  periodType?: string | null;
  packageType?: string | null;
  store?: string | null;
  originalPurchaseDate?: string | null;
  latestPurchaseDate?: string | null;
  billingIssuesDetected?: boolean;
  isSandbox?: boolean;
}
