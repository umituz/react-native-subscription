import { useState, useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";

interface UseSubscriptionModalProps {
    onPurchase: (pkg: PurchasesPackage) => Promise<boolean>;
    onRestore: () => Promise<boolean>;
    onClose: () => void;
}

export const useSubscriptionModal = ({
    onPurchase,
    onRestore,
    onClose,
}: UseSubscriptionModalProps) => {
    const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePurchase = useCallback(async () => {
        if (!selectedPkg || isProcessing) return;
        setIsProcessing(true);
        try {
            if (await onPurchase(selectedPkg)) onClose();
        } finally {
            setIsProcessing(false);
        }
    }, [selectedPkg, onPurchase, onClose, isProcessing]);

    const handleRestore = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            if (await onRestore()) onClose();
        } finally {
            setIsProcessing(false);
        }
    }, [onRestore, onClose, isProcessing]);

    return {
        selectedPkg,
        setSelectedPkg,
        isProcessing,
        handlePurchase,
        handleRestore,
    };
};
