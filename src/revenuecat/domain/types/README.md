# RevenueCat Domain Types

Type definitions and type utilities for RevenueCat integration.

## Overview

This directory contains TypeScript type definitions, type guards, and utility types used throughout the RevenueCat integration.

## Core Types

### PurchasesError

Error type for RevenueCat operations.

```typescript
interface PurchasesError {
  code: string;
  message: string;
  underlyingErrorMessage?: string;
  readableErrorMessage?: string;
}

type PurchasesErrorCode =
  | 'UNKNOWN_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_CREDENTIALS_ERROR'
  | 'OPERATION_ALREADY_IN_PROGRESS'
  | 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE'
  | 'INVALIDreceipt_ERROR'
  | 'MISSING_RECEIPT_ERROR'
  | 'INVALID_APP_USER_ID_ERROR'
  | 'CONFLICTING_SUBS_ERROR'
  | 'CUSTOMER_INFO_ERROR'
  | 'INVALID_CONFIGURATION_ERROR'
  | 'UNSUPPORTED_OPERATION_ERROR'
  | 'PURCHASE_CANCELLED'
  | 'PURCHASE_INVALID'
  | 'PRODUCT_ALREADY_OWNED'
  | 'RECEIPT_ALREADY_IN_USE'
  | 'INVALID_OFFERINGS_ERROR'
  | 'INVALID_ELIGIBILITY_ERROR'
  | 'INELIGIBLE_FOR_INTRO_PRICING'
  | 'EXPIRED_RECEIPT_ERROR';
```

### PackageType

Available package types.

```typescript
type PackageType =
  | 'monthly'
  | 'annual'
  | 'lifetime'
  | 'weekly'
  | 'single_purchase';
```

### ProductType

Types of products.

```typescript
type ProductType =
  | 'subscription'
  | 'non_subscription'
  | 'consumable';
```

### PeriodType

Subscription period types.

```typescript
type PeriodType =
  | 'normal'
  | 'trial'
  | 'intro';
```

### Store

Available app stores.

```typescript
type Store =
  | 'app_store'
  | 'play_store'
  | 'stripe'
  | 'mac_app_store'
  | 'play_store_amazon'
  | 'promotional';
```

### SubscriptionStatus

Subscription status representation.

```typescript
type SubscriptionStatus =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'in_billing_retry'
  | 'paused';

interface SubscriptionInfo {
  status: SubscriptionStatus;
  expiresAt: Date | null;
  willRenew: boolean;
  periodType: PeriodType;
  isTrial: boolean;
  isIntro: boolean;
  isSandbox: boolean;
}
```

## Type Guards

### isPurchasesError

Check if an error is a PurchasesError.

```typescript
function isPurchasesError(error: unknown): error is PurchasesError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}
```

### isActiveEntitlement

Check if entitlement is active.

```typescript
function isActiveEntitlement(
  entitlement: EntitlementInfo | null
): entitlement is EntitlementInfo & { isActive: true } {
  return entitlement?.isActive === true;
}
```

### isSubscriptionProduct

Check if product is a subscription.

```typescript
function isSubscriptionProduct(
  product: Product
): product is Product & { type: 'subscription' } {
  return product.type === 'subscription';
}
```

### isConsumableProduct

Check if product is consumable.

```typescript
function isConsumableProduct(
  product: Product
): product is Product & { type: 'consumable' } {
  return product.type === 'consumable';
}
```

## Utility Types

### PurchaseResult

Result of a purchase operation.

```typescript
type PurchaseResult =
  | { success: true; customerInfo: CustomerInfo; transaction: Transaction }
  | { success: false; error: PurchasesError };
```

### RestoreResult

Result of a restore operation.

```typescript
type RestoreResult =
  | { success: true; customerInfo: CustomerInfo }
  | { success: false; error: PurchasesError };
```

### EntitlementCheckResult

Result of checking an entitlement.

```typescript
type EntitlementCheckResult =
  | { hasAccess: true; entitlement: EntitlementInfo }
  | { hasAccess: false; reason: 'not_entitled' | 'expired' | 'cancelled' };
```

### OfferingConfig

Configuration for an offering.

```typescript
interface OfferingConfig {
  identifier: string;
  metadata?: {
    highlight?: boolean;
    recommended?: boolean;
    discount_percentage?: number;
    features?: string[];
  };
}
```

### PurchaseConfig

Configuration for purchase flow.

```typescript
interface PurchaseConfig {
  onPurchaseStarted?: () => void;
  onPurchaseSuccess?: (result: PurchaseResult) => void;
  onPurchaseError?: (error: PurchasesError) => void;
  onPurchaseCancelled?: () => void;
}
```

## Usage Examples

### Using Type Guards

```typescript
import { isPurchasesError, isActiveEntitlement } from './types';

try {
  const result = await purchasePackage(pkg);
} catch (error) {
  if (isPurchasesError(error)) {
    // Now TypeScript knows error is PurchasesError
    console.error('Error code:', error.code);
    console.error('Message:', error.message);
  }
}

// Checking entitlements
const premium = customerInfo.entitlements.premium;
if (isActiveEntitlement(premium)) {
  // TypeScript knows premium is active
  console.log('Premium expires:', premium.expirationDate);
}
```

### Using Utility Types

```typescript
async function handlePurchase(
  pkg: Package
): Promise<PurchaseResult> {
  try {
    const result = await revenueCatService.purchasePackage(pkg);
    return {
      success: true,
      customerInfo: result.customerInfo,
      transaction: result.transaction,
    };
  } catch (error) {
    if (isPurchasesError(error)) {
      return {
        success: false,
        error,
      };
    }
    throw error;
  }
}

// Usage
const result = await handlePurchase(selectedPackage);

if (result.success) {
  console.log('Purchased:', result.transaction?.transactionIdentifier);
} else {
  console.error('Failed:', result.error.message);
}
```

### Checking Entitlements

```typescript
function checkEntitlement(
  customerInfo: CustomerInfo,
  entitlementId: string
): EntitlementCheckResult {
  const entitlement = customerInfo.entitlements[entitlementId];

  if (!entitlement) {
    return { hasAccess: false, reason: 'not_entitled' };
  }

  if (!entitlement.isActive) {
    if (entitlement.expirationDate && entitlement.expirationDate < new Date()) {
      return { hasAccess: false, reason: 'expired' };
    }
    if (entitlement.unsubscribeDetectedAt) {
      return { hasAccess: false, reason: 'cancelled' };
    }
    return { hasAccess: false, reason: 'not_entitled' };
  }

  return { hasAccess: true, entitlement };
}

// Usage
const check = checkEntitlement(customerInfo, 'premium');

if (check.hasAccess) {
  console.log('Premium active');
} else {
  console.log('Reason:', check.reason);
}
```

## Type Assertions

### Assert Subscription Status

```typescript
function getSubscriptionStatus(
  entitlement: EntitlementInfo | null
): SubscriptionStatus {
  if (!entitlement || !entitlement.isActive) {
    return 'expired';
  }

  if (entitlement.billingIssueDetectedAt) {
    return 'in_billing_retry';
  }

  if (entitlement.unsubscribeDetectedAt && !entitlement.willRenew) {
    return 'cancelled';
  }

  return 'active';
}
```

### Assert Product Type

```typescript
function getProductPrice(
  product: Product
): string | null {
  if (isSubscriptionProduct(product)) {
    return product.price.formattedPrice;
  }

  if (isConsumableProduct(product)) {
    return product.price.formattedPrice;
  }

  return null;
}
```

## Related

- [RevenueCat Domain](../README.md)
- [RevenueCat Entities](../entities/README.md)
- [RevenueCat Value Objects](../value-objects/README.md)
