/**
 * Subscription Error
 * Custom error class for subscription-related errors
 */

export class SubscriptionError extends Error {
    public readonly code: string;

    constructor(message: string, code: string = 'SUBSCRIPTION_ERROR') {
        super(message);
        this.name = 'SubscriptionError';
        this.code = code;
    }

    static notFound(message: string = 'Subscription not found'): SubscriptionError {
        return new SubscriptionError(message, 'SUBSCRIPTION_NOT_FOUND');
    }

    static expired(message: string = 'Subscription has expired'): SubscriptionError {
        return new SubscriptionError(message, 'SUBSCRIPTION_EXPIRED');
    }

    static purchaseFailed(message: string = 'Purchase failed'): SubscriptionError {
        return new SubscriptionError(message, 'PURCHASE_FAILED');
    }

    static restoreFailed(message: string = 'Restore failed'): SubscriptionError {
        return new SubscriptionError(message, 'RESTORE_FAILED');
    }

    static networkError(message: string = 'Network error'): SubscriptionError {
        return new SubscriptionError(message, 'NETWORK_ERROR');
    }
}

export class SubscriptionRepositoryError extends Error {
    public readonly code: string;

    constructor(message: string, code: string = 'REPOSITORY_ERROR') {
        super(message);
        this.name = 'SubscriptionRepositoryError';
        this.code = code;
    }
}

export class SubscriptionValidationError extends Error {
    public readonly code: string;

    constructor(message: string, code: string = 'VALIDATION_ERROR') {
        super(message);
        this.name = 'SubscriptionValidationError';
        this.code = code;
    }
}
