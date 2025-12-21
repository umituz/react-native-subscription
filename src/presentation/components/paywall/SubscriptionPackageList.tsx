import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";

interface SubscriptionPackageListProps {
    isLoading: boolean;
    packages: PurchasesPackage[];
    selectedPkg: PurchasesPackage | null;
    loadingText: string;
    emptyText: string;
    onSelect: (pkg: PurchasesPackage) => void;
}

export const SubscriptionPackageList: React.FC<SubscriptionPackageListProps> = React.memo(
    ({
        isLoading,
        packages,
        selectedPkg,
        loadingText,
        emptyText,
        onSelect,
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
                {packages.map((pkg, index) => (
                    <SubscriptionPlanCard
                        key={pkg.product.identifier}
                        package={pkg}
                        isSelected={selectedPkg?.product.identifier === pkg.product.identifier}
                        onSelect={() => onSelect(pkg)}
                        isBestValue={index === 0}
                    />
                ))}
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
