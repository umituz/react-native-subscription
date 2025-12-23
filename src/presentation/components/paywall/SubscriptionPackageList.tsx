import React, { useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";
import { AccordionPlanCard } from "./accordion";
import { isYearlyPackage, isMonthlyPackage, isWeeklyPackage } from "../../../utils/packagePeriodUtils";

interface SubscriptionPackageListProps {
    isLoading: boolean;
    packages: PurchasesPackage[];
    selectedPkg: PurchasesPackage | null;
    loadingText: string;
    emptyText: string;
    onSelect: (pkg: PurchasesPackage) => void;
    /** Optional: Manually specify which package should show "Best Value" badge by identifier */
    bestValueIdentifier?: string;
    /** Optional: Map of product identifier to credit amount (e.g., { "weekly": 6, "monthly": 25, "yearly": 300 }) */
    creditAmounts?: Record<string, number>;
}

export const SubscriptionPackageList: React.FC<SubscriptionPackageListProps> = React.memo(
    ({
        isLoading,
        packages,
        selectedPkg,
        loadingText,
        emptyText,
        onSelect,
        bestValueIdentifier,
        creditAmounts,
    }) => {
        const tokens = useAppDesignTokens();
        const hasPackages = packages.length > 0;
        const showLoading = isLoading && !hasPackages;

        const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);

        const handleToggleExpand = useCallback((packageId: string) => {
            setExpandedPackageId((prev) => (prev === packageId ? null : packageId));
        }, []);

        if (showLoading) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={tokens.colors.primary} />
                    <AtomicText
                        type="bodyMedium"
                        style={[styles.loadingText, { color: tokens.colors.textSecondary }]}
                    >
                        {loadingText}
                    </AtomicText>
                </View>
            );
        }

        if (!hasPackages) {
            return (
                <View style={styles.centerContent}>
                    <AtomicText
                        type="bodyMedium"
                        style={[styles.emptyText, { color: tokens.colors.textSecondary }]}
                    >
                        {emptyText}
                    </AtomicText>
                </View>
            );
        }

        return (
            <View style={styles.packagesContainer}>
                {packages.map((pkg) => {
                    // Determine if this package should show "Best Value" badge
                    let isBestValue = false;

                    if (bestValueIdentifier) {
                        // Use manual override if provided
                        isBestValue = pkg.product.identifier === bestValueIdentifier;
                    } else {
                        // Auto-detect: mark yearly packages as best value
                        isBestValue = isYearlyPackage(pkg);
                    }

                    // Smart matching for credit amounts
                    const findCreditAmount = () => {
                        if (!creditAmounts) return undefined;

                        const productId = pkg.product.identifier;
                        const packageId = pkg.identifier;
                        const productTitle = pkg.product.title || "";

                        // 1. Exact match
                        if (creditAmounts[productId] !== undefined) return creditAmounts[productId];
                        if (creditAmounts[packageId] !== undefined) return creditAmounts[packageId];

                        // 2. Case-insensitive and Title matching
                        const lowerProductId = productId.toLowerCase();
                        const lowerPackageId = packageId.toLowerCase();
                        const lowerTitle = productTitle.toLowerCase();

                        for (const [key, value] of Object.entries(creditAmounts)) {
                            const lowerKey = key.toLowerCase();
                            if (lowerProductId === lowerKey || lowerPackageId === lowerKey || lowerTitle.includes(lowerKey)) {
                                return value;
                            }
                        }

                        // 3. Period-based fallback
                        const isYearly = isYearlyPackage(pkg);
                        const isMonthly = isMonthlyPackage(pkg);
                        const isWeekly = isWeeklyPackage(pkg);

                        for (const [key, value] of Object.entries(creditAmounts)) {
                            const lowerKey = key.toLowerCase();
                            if (isYearly && (lowerKey.includes("year") || lowerKey.includes("annual") || lowerKey === "yearly")) return value;
                            if (isMonthly && (lowerKey.includes("month") || lowerKey === "monthly")) return value;
                            if (isWeekly && (lowerKey.includes("week") || lowerKey === "weekly")) return value;
                        }

                        return undefined;
                    };

                    const creditAmount = findCreditAmount();
                    const packageId = pkg.product.identifier;

                    return (
                        <AccordionPlanCard
                            key={packageId}
                            package={pkg}
                            isSelected={selectedPkg?.product.identifier === packageId}
                            isExpanded={expandedPackageId === packageId}
                            onSelect={() => onSelect(pkg)}
                            onToggleExpand={() => handleToggleExpand(packageId)}
                            isBestValue={isBestValue}
                            creditAmount={creditAmount}
                        />
                    );
                })}
            </View>
        );
    }
);

SubscriptionPackageList.displayName = "SubscriptionPackageList";

const styles = StyleSheet.create({
    centerContent: {
        alignItems: "center",
        paddingVertical: 40
    },
    loadingText: {
        marginTop: 16
    },
    emptyText: {
        textAlign: "center"
    },
    packagesContainer: {
        gap: 12,
        marginBottom: 20
    },
});
