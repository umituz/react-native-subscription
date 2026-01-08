# RevenueCat Domain Entities

Core domain entities for RevenueCat integration.

## Overview

This directory contains TypeScript type definitions and entities representing RevenueCat concepts like customer info, entitlements, offerings, and packages.

## Entities

### CustomerInfo

Represents the subscriber's current information and entitlements.

```typescript
interface CustomerInfo {
  // Subscriber Information
  originalAppUserId: string;
  originalApplicationVersion: string | null;
  requestDate: Date;
  allExpirationDates: Record<string, Date | null>;
  allPurchaseDates: Record<string, Date | null>;
  originalPurchaseDates: Record<string, Date | null>;

  // Entitlements
  entitlements: EntitlementInfos;

  // Active Subscriptions
  activeSubscriptions: string[];

  // All Purchases
  allPurchasedProductIds: string[];

  // Latest Purchase
  latestExpirationDate: Date | null;
  firstSeen: Date;
  managementURL: string | null;
}
```

### EntitlementInfos

Collection of entitlement information.

```typescript
interface EntitlementInfos {
  [key: string]: EntitlementInfo;
}
```

### EntitlementInfo

Information about a specific entitlement.

```typescript
interface EntitlementInfo {
  // Identifier
  identifier: string;

  // Active Status
  isActive: boolean;
  willRenew: boolean;

  // Period Type
  periodType: 'normal' | 'trial' | 'intro';

  // Product Information
  productId: string;
  productIdentifier: string;

  // Dates
  latestPurchaseDate: Date;
  originalPurchaseDate: Date;
  expirationDate: Date | null;

  // Renewal Information
  renewAt: Date | null;
  isSandbox: boolean;

  // Billing
  billingIssueDetectedAt: Date | null;

  // Cancellation
  unsubscribeDetectedAt: Date | null;

  // Store
  store: 'app_store' | 'play_store' | 'stripe' | 'mac_app_store' | 'play_store_amazon' | 'promotional';
}
```

### Offerings

Collection of available offerings.

```typescript
interface Offerings {
  // All Offerings
  all: Record<string, Offering>;

  // Current Offering
  current: Offering | null;

  // Specific Offerings
  [key: string]: Offering | null;
}
```

### Offering

A collection of packages available for purchase.

```typescript
interface Offering {
  // Identifier
  identifier: string;

  // Server Description
  serverDescription: string;

  // Available Packages
  availablePackages: Package[];

  // Lifetime Packages
  lifetime: Package | null;

  // Annual Packages
  annual: Package | null;

  // Monthly Packages
  monthly: Package | null;

  // Weekly Packages
  weekly: Package | null;

  // Single Purchase
  singlePurchase: Package | null;
}
```

### Package

A purchasable product within an offering.

```typescript
interface Package {
  // Identifier
  identifier: string;

  // Package Type
  packageType: PackageType;

  // Product Information
  product: Product;

  // Offering
  offeringIdentifier: string;

  // Pricing
  price: Price;
  localizedPriceString: string;

  // Metadata
  metadata: PackageMetadata;
}

type PackageType =
  | 'monthly'
  | 'annual'
  | 'lifetime'
  | 'weekly'
  | 'single_purchase';
```

### Product

Details about a purchasable product.

```typescript
interface Product {
  // Identifier
  identifier: string;

  // Description
  description: string;

  // Title
  title: string;

  // Price
  price: Price;

  // Subscription Period
  subscriptionPeriod: SubscriptionPeriod | null;

  // Introductory Offer
  introductoryPrice: IntroductoryOffer | null;

  // Product Type
  type: ProductType;

  // Store
  defaultOption: ProductOption;

  // Options (for iOS)
  options: ProductOption[];
}

type ProductType = 'subscription' | 'non_subscription' | 'consumable';
```

### Price

Price information.

```typescript
interface Price {
  amount: number;
  currencyCode: string;
  formattedPrice: string;
}
```

### SubscriptionPeriod

Duration of a subscription period.

```typescript
interface SubscriptionPeriod {
  value: number;
  unit: 'day' | 'week' | 'month' | 'year';
}
```

### IntroductoryOffer

Special pricing for new subscribers.

```typescript
interface IntroductoryOffer {
  price: Price;
  period: SubscriptionPeriod;
  periodNumberOfUnits: number;
  cycles: number;
}
```

### PurchaseResult

Result of a purchase operation.

```typescript
interface PurchaseResult {
  // Customer Information
  customerInfo: CustomerInfo;

  // Transaction
  transaction: Transaction | null;

  // Error (if failed)
  error?: PurchasesError;

  // Whether it was a renewal
  isRenewal: boolean;
}
```

### RestoreResult

Result of a restore purchases operation.

```typescript
interface RestoreResult {
  // Customer Information
  customerInfo: CustomerInfo;

  // Error (if failed)
  error?: PurchasesError;
}
```

### Transaction

Information about a purchase transaction.

```typescript
interface Transaction {
  transactionIdentifier: string;
  productIdentifier: string;
  purchaseDate: Date;
  transactionDate: Date;
  revenueCatId: string;
}
```

## Usage Examples

### Accessing Customer Info

```typescript
const customerInfo: CustomerInfo = await getCustomerInfo();

// Check if user has premium
const premiumEntitlement = customerInfo.entitlements.premium;
if (premiumEntitlement?.isActive) {
  console.log('User has premium');
}

// Get expiration date
const expirationDate = premiumEntitlement?.expirationDate;
console.log('Expires on:', expirationDate);

// Check active subscriptions
console.log('Active subscriptions:', customerInfo.activeSubscriptions);
```

### Working with Offerings

```typescript
const offerings: Offerings = await getOfferings();

// Get current offering
const current = offerings.current;
if (current) {
  // Get monthly package
  const monthly = current.monthly;
  console.log('Monthly price:', monthly?.localizedPriceString);

  // Get all packages
  current.availablePackages.forEach(pkg => {
    console.log(pkg.identifier, pkg.localizedPriceString);
  });
}
```

### Handling Purchase Results

```typescript
const result: PurchaseResult = await purchasePackage(selectedPackage);

if (result.error) {
  console.error('Purchase failed:', result.error.message);
  return;
}

console.log('Purchase successful!');
console.log('Transaction ID:', result.transaction?.transactionIdentifier);

// Check entitlement
if (result.customerInfo.entitlements.premium?.isActive) {
  console.log('Premium is now active');
}
```

### Checking Entitlement Details

```typescript
const entitlement: EntitlementInfo = customerInfo.entitlements.premium;

if (entitlement) {
  console.log('Active:', entitlement.isActive);
  console.log('Will Renew:', entitlement.willRenew);
  console.log('Period Type:', entitlement.periodType);
  console.log('Expiration:', entitlement.expirationDate);
  console.log('Store:', entitlement.store);
  console.log('Is Sandbox:', entitlement.isSandbox);

  if (entitlement.billingIssueDetectedAt) {
    console.warn('Billing issue detected');
  }

  if (entitlement.unsubscribeDetectedAt) {
    console.warn('User cancelled subscription');
  }
}
```

## Related

- [RevenueCat Domain](../README.md)
- [RevenueCat Value Objects](../value-objects/README.md)
- [RevenueCat Errors](../errors/README.md)
- [RevenueCat Types](../types/README.md)
