import { useState, useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import type { PaywallTabType } from "../entities";

interface UsePaywallProps {
    initialTab?: PaywallTabType;
    onCreditsPurchase: (packageId: string) => Promise<void>;
    onSubscriptionPurchase: (pkg: PurchasesPackage) => Promise<void>;
}

export const usePaywall = ({
    initialTab = "credits",
    onCreditsPurchase,
    onSubscriptionPurchase,
}: UsePaywallProps) => {
    const [activeTab, setActiveTab] = useState<PaywallTabType>(initialTab);
    const [selectedCreditsPackageId, setSelectedCreditsPackageId] = useState<string | null>(null);
    const [selectedSubscriptionPkg, setSelectedSubscriptionPkg] = useState<PurchasesPackage | null>(null);

    const handleTabChange = useCallback((tab: PaywallTabType) => {
        setActiveTab(tab);
    }, []);

    const handleCreditsPackageSelect = useCallback((packageId: string) => {
        setSelectedCreditsPackageId(packageId);
    }, []);

    const handleSubscriptionPackageSelect = useCallback((pkg: PurchasesPackage) => {
        setSelectedSubscriptionPkg(pkg);
    }, []);

    const handleCreditsPurchase = useCallback(async () => {
        if (selectedCreditsPackageId) {
            await onCreditsPurchase(selectedCreditsPackageId);
        }
    }, [selectedCreditsPackageId, onCreditsPurchase]);

    const handleSubscriptionPurchase = useCallback(async () => {
        if (selectedSubscriptionPkg) {
            await onSubscriptionPurchase(selectedSubscriptionPkg);
        }
    }, [selectedSubscriptionPkg, onSubscriptionPurchase]);

    return {
        activeTab,
        selectedCreditsPackageId,
        selectedSubscriptionPkg,
        handleTabChange,
        handleCreditsPackageSelect,
        handleSubscriptionPackageSelect,
        handleCreditsPurchase,
        handleSubscriptionPurchase,
    };
};
