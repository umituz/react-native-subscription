import { timezoneService } from "@umituz/react-native-design-system";

export function convertFirestoreTimestampToISO(timestamp: unknown): string | null {
  if (!timestamp) return null;

  let date: Date;
  if (
    typeof timestamp === "object" &&
    timestamp !== null &&
    "toDate" in timestamp
  ) {
    date = (timestamp as { toDate: () => Date }).toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return null;
  }

  return timezoneService.formatToISOString(date);
}

export function formatDateForDisplay(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  return timezoneService.formatToDisplayDate(date);
}
