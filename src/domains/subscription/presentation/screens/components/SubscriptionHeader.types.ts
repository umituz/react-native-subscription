export interface SubscriptionHeaderProps {
  statusType: "active" | "expired" | "none" | "canceled";
  showExpirationDate: boolean;
  isLifetime: boolean;
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
    lifetimeLabel: string;
    expiresLabel: string;
    purchasedLabel: string;
  };
}
