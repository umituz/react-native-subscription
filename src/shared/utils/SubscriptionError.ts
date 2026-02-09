/**
 * Subscription Error
 * Custom error class for subscription-related errors
 */

import { BaseError } from "./BaseError";

export class SubscriptionError extends BaseError {
    constructor(message: string, code: string = 'SUBSCRIPTION_ERROR', cause?: Error) {
        super(message, code, cause);
        this.name = 'SubscriptionError';
    }

    static notFound(message: string = 'Subscription not found', cause?: Error): SubscriptionError {
        return new SubscriptionError(message, 'SUBSCRIPTION_NOT_FOUND', cause);
    }

    static expired(message: string = 'Subscription has expired', cause?: Error): SubscriptionError {
        return new SubscriptionError(message, 'SUBSCRIPTION_EXPIRED', cause);
    }

    static purchaseFailed(message: string = 'Purchase failed', cause?: Error): SubscriptionError {
        return new SubscriptionError(message, 'PURCHASE_FAILED', cause);
    }

    static restoreFailed(message: string = 'Restore failed', cause?: Error): SubscriptionError {
        return new SubscriptionError(message, 'RESTORE_FAILED', cause);
    }

    static networkError(message: string = 'Network error', cause?: Error): SubscriptionError {
        return new SubscriptionError(message, 'NETWORK_ERROR', cause);
    }
}

export class SubscriptionRepositoryError extends BaseError {
    constructor(message: string, code: string = 'REPOSITORY_ERROR', cause?: Error) {
        super(message, code, cause);
        this.name = 'SubscriptionRepositoryError';
    }
}

export class SubscriptionValidationError extends BaseError {
    constructor(message: string, code: string = 'VALIDATION_ERROR', cause?: Error) {
        super(message, code, cause);
        this.name = 'SubscriptionValidationError';
    }
}
