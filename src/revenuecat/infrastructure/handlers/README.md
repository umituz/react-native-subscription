# RevenueCat Infrastructure Handlers

Event handlers for RevenueCat lifecycle events.

## Overview

This directory contains handler implementations for managing RevenueCat events including purchase callbacks, customer info changes, and error handling.

## Handlers

### PurchaseCompletedHandler

Handles successful purchase completion.

```typescript
class PurchaseCompletedHandler {
  async handle(result: PurchaseResult): Promise<void> {
    // 1. Extract transaction info
    const { customerInfo, transaction } = result;

    // 2. Update local subscription status
    await updateSubscriptionStatus(customerInfo);

    // 3. Handle credits allocation
    if (isPremiumPurchase(transaction)) {
      await allocatePremiumCredits(customerInfo.originalAppUserId);
    }

    // 4. Trigger success callbacks
    triggerSuccessCallbacks(result);

    // 5. Log purchase
    logPurchaseEvent(transaction);
  }
}
```

### PurchaseErrorHandler

Handles purchase errors.

```typescript
class PurchaseErrorHandler {
  async handle(error: PurchasesError): Promise<void> {
    // 1. Categorize error
    const category = categorizeError(error);

    // 2. Show appropriate message
    showErrorMessage(category);

    // 3. Log error
    logPurchaseError(error);

    // 4. Trigger error callbacks
    triggerErrorCallbacks(error);

    // 5. Offer recovery options
    if (category === 'network') {
      offerRetry();
    }
  }
}
```

### CustomerInfoChangedHandler

Handles customer info changes.

```typescript
class CustomerInfoChangedHandler {
  async handle(customerInfo: CustomerInfo): Promise<void> {
    // 1. Check for subscription changes
    const changes = detectSubscriptionChanges(customerInfo);

    // 2. Update local state
    await updateLocalState(customerInfo);

    // 3. Handle status changes
    if (changes.subscriptionChanged) {
      await handleSubscriptionChange(changes);
    }

    // 4. Trigger UI refresh
    triggerUIRefresh();
  }
}
```

### EntitlementsChangedHandler

Handles entitlement changes.

```typescript
class EntitlementsChangedHandler {
  async handle(entitlements: EntitlementInfos): Promise<void> {
    // 1. Check premium status
    const premium = entitlements.premium;

    // 2. Update access controls
    if (premium?.isActive) {
      grantPremiumAccess();
    } else {
      revokePremiumAccess();
    }

    // 3. Handle new entitlements
    for (const [key, entitlement] of Object.entries(entitlements)) {
      if (entitlement.isActive) {
        await handleNewEntitlement(key, entitlement);
      }
    }
  }
}
```

## Usage

### Setting Up Handlers

```typescript
import { Purchases } from '@revenuecat/purchases-capacitor';
import {
  PurchaseCompletedHandler,
  PurchaseErrorHandler,
  CustomerInfoChangedHandler,
} from './handlers';

// Set up customer info listener
Purchases.addCustomerInfoUpdateListener((customerInfo) => {
  const handler = new CustomerInfoChangedHandler();
  handler.handle(customerInfo);
});

// Use in purchase flow
async function purchasePackage(pkg: Package) {
  const completedHandler = new PurchaseCompletedHandler();
  const errorHandler = new PurchaseErrorHandler();

  try {
    const result = await Purchases.purchasePackage({ aPackage: pkg });
    await completedHandler.handle(result);
  } catch (error) {
    await errorHandler.handle(error);
  }
}
```

### Custom Handlers

```typescript
class CustomPurchaseHandler {
  constructor(
    private onSuccess: (result: PurchaseResult) => void,
    private onError: (error: PurchasesError) => void
  ) {}

  async handle(result: PurchaseResult | PurchasesError): Promise<void> {
    if (isPurchasesError(result)) {
      await this.onError(result);
    } else {
      await this.onSuccess(result);
    }
  }
}

// Usage
const handler = new CustomPurchaseHandler(
  (result) => {
    Alert.alert('Success', 'Purchase completed!');
    navigation.navigate('Home');
  },
  (error) => {
    Alert.alert('Error', error.message);
  }
);
```

## Error Categorization

```typescript
function categorizeError(error: PurchasesError): ErrorCategory {
  switch (error.code) {
    case 'PURCHASE_CANCELLED':
      return 'cancelled';
    case 'NETWORK_ERROR':
      return 'network';
    case 'INVALID_CREDENTIALS_ERROR':
      return 'config';
    case 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE':
      return 'availability';
    default:
      return 'unknown';
  }
}

type ErrorCategory =
  | 'cancelled'
  | 'network'
  | 'config'
  | 'availability'
  | 'unknown';
```

## Best Practices

1. **Immutability**: Don't mutate incoming data
2. **Error Boundaries**: Handle errors gracefully
3. **Logging**: Log all events for debugging
4. **Callbacks**: Invoke registered callbacks appropriately
5. **Async Handling**: Use async/await for asynchronous operations
6. **Validation**: Validate incoming data before processing
7. **Recovery**: Provide recovery options when possible

## Related

- [RevenueCat Infrastructure](../README.md)
- [RevenueCat Services](../services/README.md)
- [RevenueCat Errors](../../domain/errors/README.md)
