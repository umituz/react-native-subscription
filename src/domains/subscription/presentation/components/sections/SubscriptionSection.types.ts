import type { StyleProp, ViewStyle } from "react-native";
import type { SubscriptionStatusType } from "../../../../core/SubscriptionConstants";
import type { CreditInfo } from "../../../../core/types";
import type { PremiumDetailsTranslations } from "../details/PremiumDetailsCardTypes";

export interface SubscriptionSectionConfig {
  statusType: SubscriptionStatusType;
  isPremium: boolean;
  expirationDate?: string | null;
  purchaseDate?: string | null;
  daysRemaining?: number | null;
  credits?: CreditInfo[];
  translations: PremiumDetailsTranslations;
  onManageSubscription?: () => void;
  onUpgrade?: () => void;
  onPress?: () => void;
}

export interface SubscriptionSectionProps {
  config: SubscriptionSectionConfig;
  containerStyle?: StyleProp<ViewStyle>;
}
