/**
 * Package Period Utilities
 * Helper functions for working with subscription periods
 */

import type { PurchasesPackage } from "react-native-purchases";

/**
 * Get period label from subscription period string
 */
export const getPeriodLabel = (period: string | null | undefined): string => {
    if (!period) return "";
    if (period.includes("Y") || period.includes("year")) return "yearly";
    if (period.includes("M") || period.includes("month")) return "monthly";
    if (period.includes("W") || period.includes("week")) return "weekly";
    if (period.includes("D") || period.includes("day")) return "daily";
    return "";
};

/**
 * Check if a package has a yearly subscription period
 */
export const isYearlyPackage = (pkg: PurchasesPackage): boolean => {
    const period = pkg.product.subscriptionPeriod;
    return period?.includes("Y") || period?.includes("year") || false;
};

/**
 * Check if a package has a monthly subscription period
 */
export const isMonthlyPackage = (pkg: PurchasesPackage): boolean => {
    const period = pkg.product.subscriptionPeriod;
    return period?.includes("M") || period?.includes("month") || false;
};

/**
 * Check if a package has a weekly subscription period
 */
export const isWeeklyPackage = (pkg: PurchasesPackage): boolean => {
    const period = pkg.product.subscriptionPeriod;
    return period?.includes("W") || period?.includes("week") || false;
};

/**
 * Find the first yearly package in an array of packages
 */
export const findYearlyPackage = (
    packages: PurchasesPackage[]
): PurchasesPackage | undefined => {
    return packages.find(isYearlyPackage);
};
