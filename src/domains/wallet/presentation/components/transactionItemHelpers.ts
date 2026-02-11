import { timezoneService } from "@umituz/react-native-design-system";
import type { TransactionItemTranslations } from "./TransactionItem.types";

export const defaultDateFormatter = (timestamp: number): string => {
  return timezoneService.formatToDisplayDateTime(new Date(timestamp));
};

export const getReasonLabel = (reason: string, translations: TransactionItemTranslations): string => {
  return translations[reason as keyof TransactionItemTranslations] || reason;
};

export const getChangePrefix = (change: number): string => {
  return change > 0 ? "+" : "";
};
