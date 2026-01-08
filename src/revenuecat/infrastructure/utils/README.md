# RevenueCat Infrastructure Utils

Utility functions for RevenueCat operations.

## Overview

This directory contains utility functions for common RevenueCat operations including error mapping, data transformation, and validation.

## Utilities

### Error Mapping

Convert RevenueCat SDK errors to domain errors.

```typescript
function mapRevenueCatError(error: PurchasesError): DomainError {
  switch (error.code) {
    case 'PURCHASE_CANCELLED':
      return {
        code: 'PURCHASE_CANCELLED',
        message: 'Purchase was cancelled',
        userMessage: 'You cancelled the purchase',
      };

    case 'NETWORK_ERROR':
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
        userMessage: 'Please check your internet connection',
      };

    case 'INVALID_CREDENTIALS_ERROR':
      return {
        code: 'CONFIGURATION_ERROR',
        message: 'Invalid RevenueCat credentials',
        userMessage: 'Configuration error. Please contact support.',
      };

    case 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE':
      return {
        code: 'PRODUCT_NOT_AVAILABLE',
        message: 'Product not available',
        userMessage: 'This product is currently unavailable',
      };

    default:
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'Unknown error',
        userMessage: 'An error occurred. Please try again.',
      };
  }
}
```

### Entitlement Extraction

Extract entitlement information from customer info.

```typescript
function extractEntitlementInfo(
  customerInfo: CustomerInfo,
  entitlementId: string
): EntitlementInfo | null {
  const entitlement = customerInfo.entitlements[entitlementId];

  if (!entitlement) {
    return null;
  }

  return {
    identifier: entitlementId,
    isActive: entitlement.isActive,
    willRenew: entitlement.willRenew,
    periodType: entitlement.periodType,
    productId: entitlement.productId,
    latestPurchaseDate: entitlement.latestPurchaseDate,
    originalPurchaseDate: entitlement.originalPurchaseDate,
    expirationDate: entitlement.expirationDate,
    renewAt: entitlement.renewAt,
    isSandbox: entitlement.isSandbox,
    billingIssueDetectedAt: entitlement.billingIssueDetectedAt,
    unsubscribeDetectedAt: entitlement.unsubscribeDetectedAt,
    store: entitlement.store,
  };
}
```

### Package Filtering

Filter packages by type or criteria.

```typescript
function filterPackagesByType(
  offering: Offering,
  packageType: PackageType
): Package[] {
  return offering.availablePackages.filter(
    pkg => pkg.packageType === packageType
  );
}

function getSubscriptionPackages(offering: Offering): Package[] {
  return offering.availablePackages.filter(pkg =>
    ['monthly', 'annual', 'weekly'].includes(pkg.packageType)
  );
}

function getLifetimePackages(offering: Offering): Package[] {
  return offering.availablePackages.filter(pkg =>
    pkg.packageType === 'lifetime'
  );
}

function getSinglePurchasePackages(offering: Offering): Package[] {
  return offering.availablePackages.filter(pkg =>
    pkg.packageType === 'single_purchase'
  );
}
```

### Price Formatting

Format prices for display.

```typescript
function formatPrice(
  price: Price,
  locale?: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: price.currencyCode,
  }).format(price.amount);
}

function formatPricePerMonth(
  package: Package,
  locale?: string
): string {
  const { price, product } = package;

  if (product.subscriptionPeriod) {
    const { value, unit } = product.subscriptionPeriod;

    // Calculate monthly equivalent
    let months = 1;
    if (unit === 'week') months = value / 4;
    if (unit === 'month') months = value;
    if (unit === 'year') months = value * 12;

    const monthlyPrice = price.amount / months;
    return formatPrice(
      { amount: monthlyPrice, currencyCode: price.currencyCode },
      locale
    );
  }

  return formatPrice(price, locale);
}
```

### Period Formatting

Format subscription periods.

```typescript
function formatPeriod(
  period: SubscriptionPeriod,
  locale = 'en-US'
): string {
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'always',
  });
  return formatter.format(period.value, period.unit);
}

function getPeriodInMonths(period: SubscriptionPeriod): number {
  switch (period.unit) {
    case 'day': return period.value / 30;
    case 'week': return period.value / 4;
    case 'month': return period.value;
    case 'year': return period.value * 12;
  }
}

function getPeriodInDays(period: SubscriptionPeriod): number {
  switch (period.unit) {
    case 'day': return period.value;
    case 'week': return period.value * 7;
    case 'month': return period.value * 30;
    case 'year': return period.value * 365;
  }
}
```

### Subscription Status

Determine subscription status from entitlement.

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

function getSubscriptionStatusType(
  entitlement: EntitlementInfo | null
): 'active' | 'expired' | 'canceled' | 'none' {
  if (!entitlement) {
    return 'none';
  }

  if (!entitlement.isActive) {
    return 'expired';
  }

  if (entitlement.unsubscribeDetectedAt && !entitlement.willRenew) {
    return 'canceled';
  }

  return 'active';
}
```

### Validation

Validate RevenueCat data.

```typescript
function isValidEntitlementId(id: string): boolean {
  const validIds = ['premium', 'pro', 'lifetime'];
  return validIds.includes(id);
}

function isValidOffering(offering: Offering | null): boolean {
  return (
    offering !== null &&
    offering.availablePackages.length > 0
  );
}

function isValidPackage(pkg: Package | null): boolean {
  return (
    pkg !== null &&
    !!pkg.identifier &&
    !!pkg.product &&
    !!pkg.price
  );
}
```

### Debug Helpers

Helper functions for debugging.

```typescript
function logCustomerInfo(info: CustomerInfo): void {
  if (__DEV__) {
    console.log('[RevenueCat] Customer Info:', {
      userId: info.originalAppUserId,
      activeSubscriptions: info.activeSubscriptions,
      allPurchasedProductIds: info.allPurchasedProductIds,
      entitlements: Object.keys(info.entitlements),
    });
  }
}

function logPurchaseResult(result: PurchaseResult): void {
  if (__DEV__) {
    console.log('[RevenueCat] Purchase Result:', {
      transactionId: result.transaction?.transactionIdentifier,
      productId: result.transaction?.productIdentifier,
      hasPremium: !!result.customerInfo.entitlements.premium?.isActive,
    });
  }
}

function logError(error: PurchasesError): void {
  if (__DEV__) {
    console.error('[RevenueCat] Error:', {
      code: error.code,
      message: error.message,
      readableMessage: error.readableErrorMessage,
    });
  }
}
```

## Usage Examples

### Using Error Mapping

```typescript
import { mapRevenueCatError } from './utils';

try {
  const result = await purchasePackage(pkg);
} catch (error) {
  const domainError = mapRevenueCatError(error);

  // Show user-friendly message
  Alert.alert('Error', domainError.userMessage);

  // Log technical details
  console.error(domainError.message);
}
```

### Extracting Entitlement Info

```typescript
import { extractEntitlementInfo } from './utils';

const customerInfo = await getCustomerInfo();
const premium = extractEntitlementInfo(customerInfo, 'premium');

if (premium?.isActive) {
  console.log('Premium active until', premium.expirationDate);
}
```

### Filtering Packages

```typescript
import { filterPackagesByType, getSubscriptionPackages } from './utils';

const offering = await getOfferings();
const monthlyPackages = filterPackagesByType(offering.current, 'monthly');
const allSubscriptions = getSubscriptionPackages(offering.current);
```

### Formatting Prices

```typescript
import { formatPrice, formatPricePerMonth } from './utils';

// Standard price
const priceString = formatPrice(pkg.price, 'en-US'); // '$9.99'
const priceStringTR = formatPrice(pkg.price, 'tr-TR'); // '9,99 $'

// Per month (for annual)
const perMonth = formatPricePerMonth(annualPackage, 'en-US'); // '$8.33/mo'
```

### Getting Subscription Status

```typescript
import { getSubscriptionStatus, getSubscriptionStatusType } from './utils';

const entitlement = customerInfo.entitlements.premium;
const status = getSubscriptionStatus(entitlement); // 'active'
const statusType = getSubscriptionStatusType(entitlement); // 'active'
```

## Best Practices

1. **Error Handling**: Always use error mapping for user-facing messages
2. **Type Safety**: Ensure types are validated before use
3. **Locale**: Respect user locale for formatting
4. **Null Checks**: Always check for null/undefined values
5. **Logging**: Use debug helpers in development
6. **Validation**: Validate data before processing

## Related

- [RevenueCat Infrastructure](../README.md)
- [RevenueCat Domain Types](../../domain/types/README.md)
- [RevenueCat Errors](../../domain/errors/README.md)
