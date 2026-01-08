# RevenueCat Infrastructure Services

Service implementations for RevenueCat operations.

## Overview

This directory contains concrete implementations of RevenueCat interfaces, providing the actual integration with the RevenueCat SDK.

## Services

### RevenueCatServiceImpl

Main service implementation for RevenueCat operations.

```typescript
import { Purchases } from '@revenuecat/purchases-capacitor';
import type { IRevenueCatService } from '../../application/ports/IRevenueCatService';

class RevenueCatServiceImpl implements IRevenueCatService {
  // Configuration
  async configure(params: {
    apiKey: string;
    userId?: string;
    observerMode?: boolean;
  }): Promise<void> {
    await Purchases.configure({
      apiKey: params.apiKey,
      appUserID: params.userId,
      observerMode: params.observerMode ?? false,
    });
  }

  // Purchasing
  async purchasePackage(pkg: Package): Promise<PurchaseResult> {
    return await Purchases.purchasePackage({ aPackage: pkg });
  }

  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    return await Purchases.purchaseProduct({ productIdentifier: productId });
  }

  async restorePurchases(): Promise<RestoreResult> {
    return await Purchases.restorePurchases();
  }

  // Customer Information
  async getCustomerInfo(): Promise<CustomerInfo> {
    return await Purchases.getCustomerInfo();
  }

  async getCustomerInfoUserId(): Promise<string | null> {
    const info = await this.getCustomerInfo();
    return info.originalAppUserId;
  }

  // Offerings
  async getOfferings(): Promise<Offerings> {
    return await Purchases.getOfferings();
  }

  async getCurrentOffering(): Promise<Offering | null> {
    const offerings = await this.getOfferings();
    return offerings.current;
  }

  // Entitlements
  async checkEntitlement(entitlementId: string): Promise<boolean> {
    const info = await this.getCustomerInfo();
    return info.entitlements[entitlementId]?.isActive ?? false;
  }

  async checkEntitlementInfo(
    entitlementId: string
  ): Promise<EntitlementInfo | null> {
    const info = await this.getCustomerInfo();
    return info.entitlements[entitlementId] ?? null;
  }

  // Subscriber Attributes
  async setAttributes(attributes: SubscriberAttributes): Promise<void> {
    await Purchases.setAttributes(attributes);
  }

  async setEmail(email: string): Promise<void> {
    await Purchases.setEmail(email);
  }

  async setPhoneNumber(phoneNumber: string): Promise<void> {
    await Purchases.setPhoneNumber(phoneNumber);
  }

  // Log Out
  async logOut(): Promise<void> {
    await Purchases.logOut();
  }
}
```

### RevenueCatServiceProvider

Provides the RevenueCat service instance.

```typescript
class RevenueCatServiceProvider {
  private static instance: IRevenueCatService | null = null;

  static getInstance(): IRevenueCatService {
    if (!this.instance) {
      this.instance = new RevenueCatServiceImpl();
    }
    return this.instance;
  }

  static configure(config: {
    apiKey: string;
    userId?: string;
    observerMode?: boolean;
  }): IRevenueCatService {
    const service = this.getInstance();
    service.configure(config);
    return service;
  }
}
```

## Usage

### Initializing the Service

```typescript
import { RevenueCatServiceProvider } from './services/RevenueCatServiceProvider';

// Configure RevenueCat
const service = RevenueCatServiceProvider.configure({
  apiKey: 'your_api_key',
  userId: user?.uid,
  observerMode: false,
});
```

### Making Purchases

```typescript
import { RevenueCatServiceProvider } from './services/RevenueCatServiceProvider';

async function purchasePremium(userId: string) {
  const service = RevenueCatServiceProvider.getInstance();

  // Get offerings
  const offerings = await service.getOfferings();
  const monthlyPackage = offerings.current?.monthly;

  if (!monthlyPackage) {
    throw new Error('No package available');
  }

  // Purchase
  const result = await service.purchasePackage(monthlyPackage);

  if (result.error) {
    throw new Error(result.error.message);
  }

  // Check entitlement
  const hasPremium = await service.checkEntitlement('premium');
  if (hasPremium) {
    console.log('Premium activated!');
  }

  return result;
}
```

### Restoring Purchases

```typescript
async function restorePurchases() {
  const service = RevenueCatServiceProvider.getInstance();

  try {
    const result = await service.restorePurchases();

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Update local state
    await updateSubscriptionStatus(result.customerInfo);

    return result.customerInfo;
  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
}
```

### Checking Entitlements

```typescript
async function checkPremiumAccess(): Promise<boolean> {
  const service = RevenueCatServiceProvider.getInstance();

  try {
    const isActive = await service.checkEntitlement('premium');

    if (isActive) {
      const entitlement = await service.checkEntitlementInfo('premium');
      console.log('Premium details:', entitlement);
    }

    return isActive;
  } catch (error) {
    console.error('Failed to check entitlement:', error);
    return false;
  }
}
```

### Setting Subscriber Attributes

```typescript
async function updateUserAttributes(user: User) {
  const service = RevenueCatServiceProvider.getInstance();

  // Set email
  if (user.email) {
    await service.setEmail(user.email);
  }

  // Set phone number
  if (user.phoneNumber) {
    await service.setPhoneNumber(user.phoneNumber);
  }

  // Set custom attributes
  await service.setAttributes({
    $displayName: user.displayName,
    account_created_at: user.createdAt.toISOString(),
    subscription_tier: user.tier,
  });
}
```

## Error Handling

### Wrapping Service Calls

```typescript
class RevenueCatServiceWrapper {
  private service: IRevenueCatService;

  constructor() {
    this.service = RevenueCatServiceProvider.getInstance();
  }

  async safePurchase(
    pkg: Package
  ): Promise<PurchaseResult> {
    try {
      return await this.service.purchasePackage(pkg);
    } catch (error) {
      // Convert to domain error
      if (isPurchasesError(error)) {
        return {
          customerInfo: {} as CustomerInfo,
          error,
        };
      }
      throw error;
    }
  }

  async safeGetOfferings(): Promise<Offerings | null> {
    try {
      return await this.getOfferings();
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return null;
    }
  }
}
```

## Testing

### Mock Implementation

```typescript
class MockRevenueCatService implements IRevenueCatService {
  async configure(): Promise<void> {
    console.log('Mock: Configure called');
  }

  async purchasePackage(pkg: Package): Promise<PurchaseResult> {
    console.log('Mock: Purchase package', pkg.identifier);
    return {
      customerInfo: mockCustomerInfo,
      transaction: mockTransaction,
    };
  }

  // ... other mock implementations
}

// Use in tests
const mockService = new MockRevenueCatService();
```

## Best Practices

1. **Singleton**: Use singleton pattern for service instance
2. **Error Handling**: Wrap all service calls in try-catch
3. **Type Safety**: Use TypeScript types for all operations
4. **Logging**: Log all RevenueCat operations
5. **Caching**: Cache customer info and offerings appropriately
6. **Validation**: Validate parameters before calling SDK
7. **Configuration**: Configure service only once
8. **Testing**: Use mock implementations for testing

## Related

- [RevenueCat Infrastructure](../README.md)
- [RevenueCat Handlers](../handlers/README.md)
- [RevenueCat Application Ports](../../application/ports/README.md)
