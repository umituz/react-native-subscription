/**
 * Subscription Errors
 * Domain-specific errors for subscription operations
 */

export class SubscriptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

export class SubscriptionRepositoryError extends SubscriptionError {
  constructor(message: string) {
    super(message, 'REPOSITORY_ERROR');
    this.name = 'SubscriptionRepositoryError';
  }
}

export class SubscriptionValidationError extends SubscriptionError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'SubscriptionValidationError';
  }
}

export class SubscriptionConfigurationError extends SubscriptionError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'SubscriptionConfigurationError';
  }
}





