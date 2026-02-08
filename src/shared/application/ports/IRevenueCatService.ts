import type {
    PurchasesOffering,
    PurchasesPackage,
    CustomerInfo,
} from "react-native-purchases";

export interface InitializeResult {
    success: boolean;
    offering: PurchasesOffering | null;
    isPremium: boolean;
}

export interface PurchaseResult {
    success: boolean;
    productId: string | null;
    isPremium: boolean;
    customerInfo?: CustomerInfo;
    isConsumable?: boolean;
}

export interface RestoreResult {
    success: boolean;
    productId: string | null;
}

export interface IRevenueCatService {
    initialize(userId: string, apiKey?: string): Promise<InitializeResult>;
    fetchOfferings(): Promise<PurchasesOffering | null>;
    purchasePackage(pkg: PurchasesPackage, userId: string): Promise<PurchaseResult>;
    restorePurchases(userId: string): Promise<RestoreResult>;
    isInitialized(): boolean;
    getCurrentUserId(): string | null;
    getCustomerInfo(): Promise<CustomerInfo | null>;
    reset(): Promise<void>;
}
