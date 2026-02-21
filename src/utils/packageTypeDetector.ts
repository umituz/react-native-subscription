import { PACKAGE_TYPE, type PackageType } from "../domains/subscription/core/SubscriptionConstants";

export type SubscriptionPackageType = PackageType;

export function isCreditPackage(identifier: string): boolean {
  if (!identifier) return false;
  return /(?:^|[._-])credit(?:$|[._-])/i.test(identifier);
}

export function detectPackageType(productIdentifier: string): SubscriptionPackageType {
  if (!productIdentifier) {
    return PACKAGE_TYPE.UNKNOWN;
  }

  const normalized = productIdentifier.toLowerCase();

  if (isCreditPackage(normalized)) {
    return PACKAGE_TYPE.UNKNOWN;
  }

  if (/\bweekly?\b|_week_|-week-|\.week\./i.test(normalized)) {
    return PACKAGE_TYPE.WEEKLY;
  }

  if (/\bmonthly?\b|_month_|-month-|\.month\./i.test(normalized)) {
    return PACKAGE_TYPE.MONTHLY;
  }

  if (/\byearly?\b|_year_|-year-|\.year\.|annual/i.test(normalized)) {
    return PACKAGE_TYPE.YEARLY;
  }

  return PACKAGE_TYPE.UNKNOWN;
}
