# RevenueCat Application Ports

Interface definitions for RevenueCat service layer.

## Overview

This directory defines the ports (interfaces) that the RevenueCat infrastructure must implement. Following Dependency Inversion Principle, the application layer depends on these abstractions rather than concrete implementations.

## Ports

### IRevenueCatService

Core service interface for RevenueCat operations.

```typescript
interface IRevenueCatService {
  // Configuration
  configure(params: {
    apiKey: string;
    userId?: string;
    observerMode?: boolean;
  }): Promise<void>;

  // Purchasing Operations
  purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult>;
  purchaseProduct(productId: string): Promise<PurchaseResult>;
  restorePurchases(): Promise<RestoreResult>;

  // Customer Information
  getCustomerInfo(): Promise<CustomerInfo>;
  getCustomerInfoUserId(): string | null;

  // Offerings
  getOfferings(): Promise<Offerings>;
  getCurrentOffering(): Promise<Offering | null>;

  // Entitlements
  checkEntitlement(entitlementId: string): Promise<boolean>;
  checkEntitlementInfo(entitlementId: string): Promise<EntitlementInfo | null>;

  // Subscriber Attributes
  setAttributes(attributes: SubscriberAttributes): Promise<void>;
  setEmail(email: string): Promise<void>;
  setPhoneNumber(phoneNumber: string): Promise<void>;

  // Log Out
  logOut(): Promise<void>;
}
```

### IRevenueCatPurchaseHandler

Handles purchase callbacks and results.

```typescript
interface IRevenueCatPurchaseHandler {
  onPurchaseStarted?(package: PurchasesPackage): void;
  onPurchaseSuccess?(result: PurchaseResult): void;
  onPurchaseError?(error: PurchaseError): void;
  onPurchaseCancelled?(result: PurchaseResult): void;
  onRestoreStarted?(): void;
  onRestoreSuccess?(result: RestoreResult): void;
  onRestoreError?(error: Error): void;
}
```

### IRevenueCatCustomerInfoListener

Listens to customer info changes.

```typescript
interface IRevenueCatCustomerInfoListener {
  onCustomerInfoChanged(customerInfo: CustomerInfo): void;
  onEntitlementsChanged(entitlements: EntitlementInfos): void;
}
```

## Usage

### Injecting Dependencies

```typescript
import type { IRevenueCatService } from './ports/IRevenueCatService';

class PurchaseManager {
  constructor(
    private revenueCatService: IRevenueCatService
  ) {}

  async purchasePremium() {
    const offerings = await this.revenueCatService.getOfferings();
    const package = offerings.current?.monthly;

    if (!package) {
      throw new Error('No package available');
    }

    return await this.revenueCatService.purchasePackage(package);
  }
}
```

### Implementing Ports

```typescript
import type { IRevenueCatService } from './ports/IRevenueCatService';
import { Purchases } from '@revenuecat/purchases-capacitor';

class RevenueCatServiceImpl implements IRevenueCatService {
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

  async purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
    return await Purchases.purchasePackage({
      aPackage: pkg,
    });
  }

  // ... other implementations
}

// Provide implementation
const revenueCatService: IRevenueCatService = new RevenueCatServiceImpl();
```

## Benefits of Ports

1. **Testability**: Easy to mock for testing
2. **Flexibility**: Can swap implementations
3. **Decoupling**: Application layer doesn't depend on concrete implementations
4. **Maintainability**: Clear contracts between layers

## Testing with Mocks

```typescript
import type { IRevenueCatService } from './ports/IRevenueCatService';

const mockRevenueCatService: IRevenueCatService = {
  configure: vi.fn().mockResolvedValue(undefined),
  purchasePackage: vi.fn().mockResolvedValue({
    customerInfo: mockCustomerInfo,
  }),
  restorePurchases: vi.fn().mockResolvedValue({
    customerInfo: mockCustomerInfo,
  }),
  getCustomerInfo: vi.fn().mockResolvedValue(mockCustomerInfo),
  getOfferings: vi.fn().mockResolvedValue(mockOfferings),
  checkEntitlement: vi.fn().mockResolvedValue(true),
  // ... other methods
};

// Use in tests
const manager = new PurchaseManager(mockRevenueCatService);
```

## Related

- [RevenueCat Application Layer](../README.md)
- [RevenueCat Infrastructure](../infrastructure/README.md)
- [RevenueCat Domain](../domain/README.md)
