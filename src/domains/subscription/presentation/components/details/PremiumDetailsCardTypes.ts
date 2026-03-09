import type { SubscriptionStatusType } from "./PremiumStatusBadge";
import type { CreditInfo } from "../../../core/types";

export type { CreditInfo };

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
