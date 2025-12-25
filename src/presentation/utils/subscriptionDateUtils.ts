/**
 * Subscription Date Utilities
 * Date formatting and calculation utilities for subscription
 */

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
    return (purchasedAt as { toDate: () => Date }).toDate().toISOString();
  }

  if (purchasedAt instanceof Date) {
    return purchasedAt.toISOString();
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
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return null;
  }
};

/**
 * Calculates days remaining until expiration
 */
export const calculateDaysRemaining = (
  expiresAtIso: string | null
): number | null => {
  if (!expiresAtIso) return null;

  const end = new Date(expiresAtIso);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
