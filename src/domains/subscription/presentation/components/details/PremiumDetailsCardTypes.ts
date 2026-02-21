import type { SubscriptionStatusType } from "./PremiumStatusBadge";

export interface CreditInfo {
  id: string;
  label: string;
  current: number;
  total: number;
}

export interface PremiumDetailsTranslations {
  title: string;
  statusLabel: string;
  expiresLabel: string;
  purchasedLabel: string;
  creditsTitle?: string;
  remainingLabel?: string;
  manageButton?: string;
  upgradeButton?: string;
  statusActive: string;
  statusExpired: string;
  statusInactive: string;
  statusCanceled: string;
}

export interface PremiumDetailsCardProps {
  statusType: SubscriptionStatusType;
  isPremium: boolean;
  expirationDate?: string | null;
  purchaseDate?: string | null;
  daysRemaining?: number | null;
  credits?: CreditInfo[];
  translations: PremiumDetailsTranslations;
  onManageSubscription?: () => void;
  onUpgrade?: () => void;
}
