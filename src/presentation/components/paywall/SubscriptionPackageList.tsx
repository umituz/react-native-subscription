import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
import { isYearlyPackage } from "../../../utils/packagePeriodUtils";

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

        // Debug logging in development
        if (__DEV__) {
            console.log("[SubscriptionPackageList] State:", {
                isLoading,
                hasPackages,
                showLoading,
                packagesCount: packages?.length ?? 0,
                loadingText,
                emptyText,
                selectedPkgId: selectedPkg?.identifier ?? null,
            });
        }

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

                    // Get credit amount for this package if provided
                    // check both product identifier (e.g., com.app.weekly) and package identifier (e.g., $rc_weekly)
                    const creditAmount =
                        creditAmounts?.[pkg.product.identifier] ??
                        creditAmounts?.[pkg.identifier];

                    return (
                        <SubscriptionPlanCard
                            key={pkg.product.identifier}
                            package={pkg}
                            isSelected={selectedPkg?.product.identifier === pkg.product.identifier}
                            onSelect={() => onSelect(pkg)}
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
