import type { PurchasesPackage } from "react-native-purchases";

export const getPeriodLabel = (period: string | null | undefined): string => {
    if (!period) return "";
    if (period.includes("Y") || period.includes("year")) return "yearly";
    if (period.includes("M") || period.includes("month")) return "monthly";
    if (period.includes("W") || period.includes("week")) return "weekly";
    if (period.includes("D") || period.includes("day")) return "daily";
    return "";
};

export const isYearlyPackage = (pkg: PurchasesPackage): boolean => {
    const period = pkg.product.subscriptionPeriod;
    return period?.includes("Y") || period?.includes("year") || false;
};

export const isMonthlyPackage = (pkg: PurchasesPackage): boolean => {
    const period = pkg.product.subscriptionPeriod;
    return period?.includes("M") || period?.includes("month") || false;
};

export const isWeeklyPackage = (pkg: PurchasesPackage): boolean => {
    const period = pkg.product.subscriptionPeriod;
    return period?.includes("W") || period?.includes("week") || false;
};

export const findYearlyPackage = (
    packages: PurchasesPackage[]
): PurchasesPackage | undefined => {
    return packages.find(isYearlyPackage);
};
