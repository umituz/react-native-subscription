# RevenueCat Domain Errors

Domain-specific errors for RevenueCat operations.

## Overview

This directory contains custom error classes for RevenueCat-specific error conditions.

## Error Types

### PurchaseError
Base error for purchase failures.

```typescript
class PurchaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public underlyingError?: Error
  ) {
    super(message);
    this.name = 'PurchaseError';
  }
}
```

**Common Codes:**
- `PURCHASE_CANCELLED`: User cancelled purchase
- `PURCHASE_INVALID`: Invalid purchase data
- `NETWORK_ERROR`: Network connectivity issue
- `STORE_PROBLEM`: App store issue

### EntitlementNotFoundError
Thrown when expected entitlement is not found.

```typescript
class EntitlementNotFoundError extends Error {
  constructor(public entitlementId: string) {
    super(
      `Entitlement not found: ${entitlementId}`,
      'ENTITLEMENT_NOT_FOUND'
    );
    this.name = 'EntitlementNotFoundError';
  }
}
```

**Usage:**
```typescript
import { EntitlementNotFoundError } from './errors/EntitlementNotFoundError';

function getEntitlement(customerInfo: CustomerInfo, id: string): Entitlement {
  const entitlement = customerInfo.entitlements.active[id];
  if (!entitlement) {
    throw new EntitlementNotFoundError(id);
  }
  return entitlement;
}
```

### ConfigurationError
Thrown when RevenueCat configuration is invalid.

```typescript
class ConfigurationError extends Error {
  constructor(missingConfig: string[]) {
    super(
      `RevenueCat not configured: ${missingConfig.join(', ')}`,
      'CONFIGURATION_ERROR'
    );
    this.name = 'ConfigurationError';
  }
}
```

**Usage:**
```typescript
function validateRevenueCatConfig(config: any) {
  const required = ['apiKey'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    throw new ConfigurationError(missing);
  }
}
```

### OfferingNotFoundError
Thrown when requested offering is not available.

```typescript
class OfferingNotFoundError extends Error {
  constructor(public offeringId: string) {
    super(
      `Offering not found: ${offeringId}`,
      'OFFERING_NOT_FOUND'
    );
    this.name = 'OfferingNotFoundError';
  }
}
```

## Error Handling Pattern

```typescript
import {
  PurchaseError,
  EntitlementNotFoundError,
  ConfigurationError
} from './errors';

async function handlePurchase(package: Package) {
  try {
    const result = await Purchases.purchasePackage(package);
    return { success: true, result };
  } catch (error) {
    if (error instanceof UserCancelledError) {
      // User cancelled - not really an error
      return { success: false, cancelled: true };
    }

    if (error instanceof PurchaseError) {
      switch (error.code) {
        case 'PURCHASE_CANCELLED':
          analytics.track('purchase_cancelled');
          break;
        case 'NETWORK_ERROR':
          showRetryDialog();
          break;
        case 'STORE_PROBLEM':
          showStoreProblemDialog();
          break;
        default:
          showErrorDialog(error.message);
      }
      return { success: false, error };
    }

    // Unexpected error
    console.error('Unexpected purchase error:', error);
    return { success: false, error };
  }
}
```

## Error Recovery

### Retry Logic
```typescript
async function purchaseWithRetry(pkg: Package, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await Purchases.purchasePackage(pkg);
      return result;
    } catch (error) {
      if (error instanceof PurchaseError) {
        if (error.code === 'NETWORK_ERROR' && i < maxRetries - 1) {
          await delay(1000 * (i + 1)); // Exponential backoff
          continue;
        }
      }
      throw error;
    }
  }
}
```

### User-Friendly Messages
```typescript
function getUserFriendlyMessage(error: Error): string {
  if (error instanceof PurchaseError) {
    const messages: Record<string, string> = {
      PURCHASE_CANCELLED: 'Purchase was cancelled',
      NETWORK_ERROR: 'Network error. Please check your connection.',
      STORE_PROBLEM: 'There was an issue with the app store.',
      PURCHASE_INVALID: 'Purchase data is invalid.',
    };
    return messages[error.code] || 'An error occurred';
  }
  return error.message;
}
```

## Best Practices

1. **Specific Errors**: Use specific error types
2. **Error Codes**: Include machine-readable codes
3. **Context**: Include relevant data in error
4. **Recovery**: Implement recovery strategies
5. **User Feedback**: Convert errors to user-friendly messages
6. **Logging**: Log errors for debugging
7. **Analytics**: Track errors for monitoring

## Related

- [RevenueCat Domain](../README.md)
- [RevenueCat Services](../infrastructure/services/README.md)
