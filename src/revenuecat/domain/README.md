# RevenueCat Domain

Domain entities and types for RevenueCat integration.

## Overview

This directory contains domain-specific entities representing RevenueCat concepts like entitlements, offerings, and packages.

## Entities

### EntitlementInfo
Represents a RevenueCat entitlement.

```typescript
interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  expirationDate?: Date;
  productIdentifier?: string;
  period?: PackagePeriod;
}
```

**Usage:**
```typescript
const entitlement: EntitlementInfo = {
  identifier: 'premium',
  isActive: true,
  willRenew: true,
  expirationDate: new Date('2024-12-31'),
  productIdentifier: 'com.app.premium.annual',
  period: 'annual',
};
```

### OfferingInfo
Represents a RevenueCat offering containing packages.

```typescript
interface OfferingInfo {
  identifier: string;
  packages: PackageInfo[];
  lifetime?: PackageInfo;
  monthly?: PackageInfo;
  annual?: PackageInfo;
}
```

### PackageInfo
Represents a purchasable package.

```typescript
interface PackageInfo {
  identifier: string;
  packageType: PackageType;
  product: ProductInfo;
  offeringIdentifier: string;
}

interface ProductInfo {
  identifier: string;
  title: string;
  description: string;
  price: number;
  pricePerMonth?: number;
  currencyCode: string;
}

type PackageType = 'WEEKLY' | 'MONTHLY' | 'THREE_MONTHLY' | 'SIX_MONTHLY' | 'ANNUAL' | 'LIFETIME';
```

## Constants

### Entitlement Identifiers

```typescript
export const ENTITLEMENT_IDS = {
  PREMIUM: 'premium',
  PRO: 'pro',
  BASIC: 'basic',
} as const;
```

### Package Periods

```typescript
export const PACKAGE_PERIODS = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
  LIFETIME: 'lifetime',
} as const;
```

## Helper Functions

### Get Package Period

```typescript
function getPackagePeriod(packageType: PackageType): PackagePeriod {
  const periodMap: Record<PackageType, PackagePeriod> = {
    WEEKLY: 'monthly',
    MONTHLY: 'monthly',
    THREE_MONTHLY: 'monthly',
    SIX_MONTHLY: 'monthly',
    ANNUAL: 'annual',
    LIFETIME: 'lifetime',
  };
  return periodMap[packageType];
}
```

### Calculate Price Per Month

```typescript
function calculatePricePerMonth(packageInfo: PackageInfo): number | null {
  if (!packageInfo.product.pricePerMonth) {
    return packageInfo.product.price;
  }
  return packageInfo.product.pricePerMonth;
}
```

### Format Price

```typescript
function formatPrice(price: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(price);
}
```

## Best Practices

1. **Type Mapping**: Map RevenueCat types to domain types
2. **Null Safety**: Handle optional properties safely
3. **Validation**: Validate RevenueCat data
4. **Formatting**: Format prices and dates consistently
5. **Constants**: Use constants for identifiers

## Related

- [RevenueCat README](../README.md)
- [Subscription Manager](../infrastructure/managers/README.md)
