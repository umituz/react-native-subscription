import type { PurchasesPackage } from "react-native-purchases";

export interface PlanCardProps {
    pkg: PurchasesPackage;
    isSelected: boolean;
    onSelect: () => void;
    badge?: string;
    creditAmount?: number;
    creditsLabel?: string;
}
