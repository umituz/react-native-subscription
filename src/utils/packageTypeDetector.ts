/**
 * Package Type Detector
 * Detects subscription package type from RevenueCat package identifier
 */

export type SubscriptionPackageType = "weekly" | "monthly" | "yearly" | "unknown";

/**
 * Detect package type from product identifier
 * Supports common RevenueCat naming patterns:
 * - premium_weekly, weekly_premium, premium-weekly
 * - premium_monthly, monthly_premium, premium-monthly
 * - premium_yearly, yearly_premium, premium-yearly, premium_annual, annual_premium
 * - preview-product-id (Preview API mode in Expo Go)
 */
export function detectPackageType(productIdentifier: string): SubscriptionPackageType {
  if (!productIdentifier) {
    if (__DEV__) {
      console.log("[PackageTypeDetector] No product identifier provided");
    }
    return "unknown";
  }

  const normalized = productIdentifier.toLowerCase();

  if (__DEV__) {
    console.log("[PackageTypeDetector] Detecting package type for:", normalized);
  }

  // Preview API mode (Expo Go testing)
  if (normalized.includes("preview")) {
    if (__DEV__) {
      console.log("[PackageTypeDetector] Detected: PREVIEW (monthly)");
    }
    return "monthly";
  }

  // Weekly detection
  if (normalized.includes("weekly") || normalized.includes("week")) {
    if (__DEV__) {
      console.log("[PackageTypeDetector] Detected: WEEKLY");
    }
    return "weekly";
  }

  // Monthly detection
  if (normalized.includes("monthly") || normalized.includes("month")) {
    if (__DEV__) {
      console.log("[PackageTypeDetector] Detected: MONTHLY");
    }
    return "monthly";
  }

  // Yearly detection (includes annual)
  if (
    normalized.includes("yearly") ||
    normalized.includes("year") ||
    normalized.includes("annual")
  ) {
    if (__DEV__) {
      console.log("[PackageTypeDetector] Detected: YEARLY");
    }
    return "yearly";
  }

  if (__DEV__) {
    console.warn("[PackageTypeDetector] Unknown package type for:", productIdentifier);
  }

  return "unknown";
}
