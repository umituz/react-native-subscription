/**
 * RevenueCat Error Classes
 * Domain-specific error types for RevenueCat operations
 */

import { BaseError } from "../../../shared/utils/BaseError";

export class RevenueCatError extends BaseError {
    constructor(message: string, code: string = 'REVENUE_CAT_ERROR', cause?: Error) {
        super(message, code, cause);
        this.name = "RevenueCatError";
    }
}

export class RevenueCatInitializationError extends RevenueCatError {
    constructor(message = "RevenueCat service is not initialized", cause?: Error) {
        super(message, 'REVENUE_CAT_NOT_INITIALIZED', cause);
        this.name = "RevenueCatInitializationError";
    }
}

export class RevenueCatConfigurationError extends RevenueCatError {
    constructor(message = "RevenueCat configuration is invalid", cause?: Error) {
        super(message, 'REVENUE_CAT_CONFIGURATION_ERROR', cause);
        this.name = "RevenueCatConfigurationError";
    }
}

export class RevenueCatPurchaseError extends RevenueCatError {
    public readonly productId: string | undefined;

    constructor(message: string, productId?: string, cause?: Error) {
        super(message, 'REVENUE_CAT_PURCHASE_ERROR', cause);
        this.name = "RevenueCatPurchaseError";
        this.productId = productId;
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            productId: this.productId,
        };
    }
}

export class RevenueCatRestoreError extends RevenueCatError {
    constructor(message = "Failed to restore purchases", cause?: Error) {
        super(message, 'REVENUE_CAT_RESTORE_ERROR', cause);
        this.name = "RevenueCatRestoreError";
    }
}

export class RevenueCatNetworkError extends RevenueCatError {
    constructor(message = "Network error during RevenueCat operation", cause?: Error) {
        super(message, 'REVENUE_CAT_NETWORK_ERROR', cause);
        this.name = "RevenueCatNetworkError";
    }
}

export class RevenueCatExpoGoError extends RevenueCatError {
    constructor(message = "RevenueCat is not available in Expo Go. Use a development build or test store.", cause?: Error) {
        super(message, 'REVENUE_CAT_EXPO_GO_ERROR', cause);
        this.name = "RevenueCatExpoGoError";
    }
}
