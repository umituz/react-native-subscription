import type { RevenueCatData } from "../../revenuecat/core/types";

export const NO_SUBSCRIPTION_PRODUCT_ID = 'no_subscription';

export const DEFAULT_FREE_USER_DATA: RevenueCatData = {
  isPremium: false,
  expirationDate: null,
  willRenew: false,
  periodType: null,
  packageType: null,
  originalTransactionId: null,
  unsubscribeDetectedAt: null,
  billingIssueDetectedAt: null,
  store: null,
  ownershipType: null,
};
