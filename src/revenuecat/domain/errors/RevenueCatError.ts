/**
 * RevenueCat Error Classes
 * Domain-specific error types for RevenueCat operations
 */

export class RevenueCatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RevenueCatError";
  }
}

export class RevenueCatInitializationError extends RevenueCatError {
  constructor(message = "RevenueCat service is not initialized") {
    super(message);
    this.name = "RevenueCatInitializationError";
  }
}

export class RevenueCatConfigurationError extends RevenueCatError {
  constructor(message = "RevenueCat configuration is invalid") {
    super(message);
    this.name = "RevenueCatConfigurationError";
  }
}

export class RevenueCatPurchaseError extends RevenueCatError {
  public productId: string | undefined;

  constructor(message: string, productId?: string) {
    super(message);
    this.name = "RevenueCatPurchaseError";
    this.productId = productId;
  }
}

export class RevenueCatRestoreError extends RevenueCatError {
  constructor(message = "Failed to restore purchases") {
    super(message);
    this.name = "RevenueCatRestoreError";
  }
}

export class RevenueCatNetworkError extends RevenueCatError {
  constructor(message = "Network error during RevenueCat operation") {
    super(message);
    this.name = "RevenueCatNetworkError";
  }
}

export class RevenueCatExpoGoError extends RevenueCatError {
  constructor(message = "RevenueCat is not available in Expo Go. Use a development build or test store.") {
    super(message);
    this.name = "RevenueCatExpoGoError";
  }
}
