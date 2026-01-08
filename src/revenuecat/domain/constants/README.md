# RevenueCat Domain Constants

Constants used throughout the RevenueCat integration.

## Overview

This directory contains constant definitions for RevenueCat-specific values including entitlement IDs, error codes, and configuration defaults.

## Constants

### Entitlement IDs

```typescript
export const ENTITLEMENT_IDS = {
  PREMIUM: 'premium',
  PRO: 'pro',
  LIFETIME: 'lifetime',
} as const;

export type EntitlementId = typeof ENTITLEMENT_IDS[keyof typeof ENTITLEMENT_IDS];
```

### Offering Identifiers

```typescript
export const OFFERING_IDS = {
  DEFAULT: 'default',
  ANNUAL_OFFER: 'annual_offer',
  LIFETIME_OFFER: 'lifetime_offer',
} as const;

export type OfferingId = typeof OFFERING_IDS[keyof typeof OFFERING_IDS];
```

### Package Periods

```typescript
export const PACKAGE_PERIODS = {
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
  LIFETIME: 'lifetime',
  WEEKLY: 'weekly',
} as const;

export type PackagePeriod = typeof PACKAGE_PERIODS[keyof typeof PACKAGE_PERIODS];
```

### Product Categories

```typescript
export const PRODUCT_CATEGORIES = {
  SUBSCRIPTION: 'subscription',
  ONE_TIME_PURCHASE: 'non_subscription',
  CONSUMABLE: 'consumable',
} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];
```

### Error Codes

```typescript
export const ERROR_CODES = {
  // Configuration Errors
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  API_KEY_NOT_SET: 'API_KEY_NOT_SET',
  INVALID_API_KEY: 'INVALID_API_KEY',

  // Purchase Errors
  PURCHASE_ERROR: 'PURCHASE_ERROR',
  PURCHASE_CANCELLED: 'PURCHASE_CANCELLED',
  PURCHASE_INVALID: 'PURCHASE_INVALID',
  PRODUCT_NOT_AVAILABLE: 'PRODUCT_NOT_AVAILABLE',

  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',

  // Customer Info Errors
  CUSTOMER_INFO_ERROR: 'CUSTOMER_INFO_ERROR',
  ENTITLEMENT_NOT_FOUND: 'ENTITLEMENT_NOT_FOUND',
  OFFERING_NOT_FOUND: 'OFFERING_NOT_FOUND',

  // Receipt Errors
  RECEIPT_ERROR: 'RECEIPT_ERROR',
  RECEIPT_INVALID: 'RECEIPT_INVALID',
  RECEIPT_ALREADY_USED: 'RECEIPT_ALREADY_USES',

  // User Errors
  USER_NOT_AUTHENTICATED: 'USER_NOT_AUTHENTICATED',
  USER_ID_NOT_SET: 'USER_ID_NOT_SET',
} as const;
```

### Configuration Defaults

```typescript
export const CONFIG_DEFAULTS = {
  // Timeout Settings
  NETWORK_TIMEOUT_MS: 10000,
  PURCHASE_TIMEOUT_MS: 30000,

  // Retry Settings
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,

  // Cache Settings
  CUSTOMER_INFO_CACHE_TTL_MS: 60000, // 1 minute
  OFFERINGS_CACHE_TTL_MS: 300000, // 5 minutes

  // Debug Settings
  ENABLE_DEBUG_LOGS: __DEV__,
  LOG_LEVEL: 'info' as const,
} as const;
```

### Entitlement Verification

```typescript
export const ENTITLEMENT_VERIFICATION = {
  // Verification Modes
  MODE_STRICT: 'strict',
  MODE_LOOSE: 'loose',

  // Grace Periods (milliseconds)
  GRACE_PERIOD_MS: 3 * 24 * 60 * 60 * 1000, // 3 days
  REFUND_GRACE_PERIOD_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;
```

## Usage Examples

### Checking Entitlements

```typescript
import { ENTITLEMENT_IDS } from './constants';

const hasPremium = await checkEntitlement(ENTITLEMENT_IDS.PREMIUM);
```

### Filtering Offerings

```typescript
import { OFFERING_IDS } from './constants';

const defaultOffering = offerings[OFFERING_IDS.DEFAULT];
const annualOffering = offerings[OFFERING_IDS.ANNUAL_OFFER];
```

### Handling Errors

```typescript
import { ERROR_CODES } from './constants';

try {
  await purchasePackage(pkg);
} catch (error) {
  if (error.code === ERROR_CODES.PURCHASE_CANCELLED) {
    // Handle cancellation
  } else if (error.code === ERROR_CODES.NETWORK_ERROR) {
    // Handle network error
  }
}
```

### Configuration

```typescript
import { CONFIG_DEFAULTS } from './constants';

const config = {
  apiKey: 'your_api_key',
  timeout: CONFIG_DEFAULTS.NETWORK_TIMEOUT_MS,
  enableDebugLogs: CONFIG_DEFAULTS.ENABLE_DEBUG_LOGS,
};
```

## Related

- [RevenueCat Domain](../README.md)
- [RevenueCat Errors](../errors/README.md)
- [RevenueCat Entities](../entities/README.md)
