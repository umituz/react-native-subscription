import type { SubscriptionStatusType } from "../../../../core/SubscriptionConstants";

export type { SubscriptionStatusType };

export interface PremiumStatusBadgeProps {
  status: SubscriptionStatusType;
  activeLabel: string;
  expiredLabel: string;
  noneLabel: string;
  canceledLabel: string;
}
