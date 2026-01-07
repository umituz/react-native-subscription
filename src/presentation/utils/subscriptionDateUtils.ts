/**
 * Converts Firestore timestamp or Date to ISO string
 */
export const convertPurchasedAt = (purchasedAt: unknown): string | null => {
  if (!purchasedAt) return null;

  let date: Date;
  if (
    typeof purchasedAt === "object" &&
    purchasedAt !== null &&
    "toDate" in purchasedAt
  ) {
    date = (purchasedAt as { toDate: () => Date }).toDate();
  } else if (purchasedAt instanceof Date) {
    date = purchasedAt;
  } else {
    return null;
  }

  return date.toISOString();
};

/**
 * Formats a date string to a simple DD.MM.YYYY format
 */
export const formatDate = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  
  return `${d}.${m}.${y}`;
};


