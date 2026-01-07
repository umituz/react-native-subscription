import { timezoneService } from "@umituz/react-native-timezone";

/**
 * Converts Firestore timestamp or Date to ISO string
 */
export const convertPurchasedAt = (purchasedAt: unknown): string | null => {
  if (!purchasedAt) return null;

  if (
    typeof purchasedAt === "object" &&
    purchasedAt !== null &&
    "toDate" in purchasedAt
  ) {
    return timezoneService.formatToISOString(
      (purchasedAt as { toDate: () => Date }).toDate()
    );
  }

  if (purchasedAt instanceof Date) {
    return timezoneService.formatToISOString(purchasedAt);
  }

  return null;
};

/**
 * Formats a date string for display
 */
export const formatDateForLocale = (
  dateStr: string | null,
  locale: string
): string | null => {
  if (!dateStr) return null;

  try {
    return timezoneService.formatDate(new Date(dateStr), locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
};


