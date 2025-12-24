/**
 * Premium Details Card Types
 * Type definitions for premium subscription details display
 */

import type { SubscriptionStatusType } from "./PremiumStatusBadge";

export interface CreditInfo {
  id: string;
  label: string;
  current: number;
  total: number;
}

export interface PremiumDetailsTranslations {
  title: string;
  freeDescription?: string;
  statusLabel: string;
  expiresLabel: string;
  purchasedLabel: string;
  creditsTitle?: string;
  remainingLabel?: string;
  manageButton?: string;
  upgradeButton?: string;
  lifetimeLabel?: string;
  statusActive: string;
  statusExpired: string;
  statusFree: string;
  statusCanceled: string;
}

export interface PremiumDetailsCardProps {
  statusType: SubscriptionStatusType;
  isPremium: boolean;
  expirationDate?: string | null;
  purchaseDate?: string | null;
  isLifetime?: boolean;
  daysRemaining?: number | null;
  credits?: CreditInfo[];
  translations: PremiumDetailsTranslations;
  onManageSubscription?: () => void;
  onUpgrade?: () => void;
}
