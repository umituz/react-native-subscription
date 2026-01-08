# RevenueCat Application Layer

Application layer for RevenueCat integration, containing use cases and orchestration logic.

## Overview

This directory contains use cases and application-level operations for managing RevenueCat subscriptions and purchases.

## Structure

```
application/
└── ports/    # Interface definitions for RevenueCat services
```

## Ports

### IRevenueCatService

Main service interface for RevenueCat operations.

```typescript
interface IRevenueCatService {
  // Purchasing
  purchasePackage(package: PurchasesPackage): Promise<PurchaseResult>;
  restorePurchases(): Promise<RestoreResult>;

  // Customer Info
  getCustomerInfo(): Promise<CustomerInfo>;
  getOfferings(): Promise<Offerings>;

  // Configuration
  configure(apiKey: string, userId?: string): Promise<void>;

  // Entitlements
  checkEntitlement(entitlementId: string): Promise<boolean>;
}
```

## Use Cases

### Purchase Flow

```typescript
async function purchasePremiumPackage(userId: string) {
  const service = getRevenueCatService();

  // 1. Get offerings
  const offerings = await service.getOfferings();
  const package = offerings.current?.monthly;

  if (!package) {
    throw new Error('No package available');
  }

  // 2. Purchase
  const result = await service.purchasePackage(package);

  // 3. Handle result
  if (result.error) {
    throw new Error(result.error.message);
  }

  // 4. Update local state
  await updateSubscriptionStatus(userId, result.customerInfo);
}
```

### Restore Purchases

```typescript
async function restoreUserPurchases() {
  const service = getRevenueCatService();

  try {
    const result = await service.restorePurchases();

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Update local subscription status
    await updateSubscriptionStatusFromRestored(result.customerInfo);

    return { success: true, customerInfo: result.customerInfo };
  } catch (error) {
    return { success: false, error };
  }
}
```

### Check Entitlement

```typescript
async function checkPremiumAccess(userId: string): Promise<boolean> {
  const service = getRevenueCatService();

  try {
    const hasPremium = await service.checkEntitlement('premium');

    if (hasPremium) {
      await activatePremiumStatus(userId);
    }

    return hasPremium;
  } catch (error) {
    console.error('Failed to check entitlement:', error);
    return false;
  }
}
```

## Best Practices

1. **Error Handling**: Always handle RevenueCat errors gracefully
2. **User ID**: Provide user ID when available for better tracking
3. **Entitlements**: Use entitlements instead of product IDs for flexibility
4. **Offerings**: Check if offerings are available before purchasing
5. **Validation**: Validate customer info after purchases
6. **Sync**: Keep local state synchronized with RevenueCat
7. **Timeouts**: Handle network timeouts appropriately
8. **Logging**: Log all RevenueCat operations for debugging

## Error Handling

```typescript
import { PurchaseError } from '../domain/errors';

async function safePurchase(pkg: PurchasesPackage) {
  try {
    const result = await service.purchasePackage(pkg);

    if (result.error) {
      // Map RevenueCat errors to domain errors
      if (result.error.code === 'PURCHASE_CANCELLED') {
        throw new PurchaseError('User cancelled purchase');
      }

      throw new PurchaseError(result.error.message);
    }

    return result;
  } catch (error) {
    if (error instanceof PurchaseError) {
      throw error;
    }

    throw new PurchaseError('Purchase failed', { cause: error });
  }
}
```

## Related

- [RevenueCat Integration](../README.md)
- [RevenueCat Domain](../domain/README.md)
- [RevenueCat Infrastructure](../infrastructure/README.md)
- [Application Ports](./ports/README.md)
