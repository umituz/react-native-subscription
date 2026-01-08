# Domain Constants

Constants used throughout the domain layer.

## Overview

This directory contains constant definitions for subscription tiers, package periods, error codes, and other domain values.

## Constants

### Subscription Tiers

```typescript
export const SUBSCRIPTION_TIERS = {
  GUEST: 'guest',
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];
```

### Package Periods

```typescript
export const PACKAGE_PERIODS = {
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
  LIFETIME: 'lifetime',
} as const;

export type PackagePeriod = typeof PACKAGE_PERIODS[keyof typeof PACKAGE_PERIODS];
```

### Error Codes

```typescript
export const ERROR_CODES = {
  CREDITS_EXHAUSTED: 'CREDITS_EXHAUSTED',
  USER_NOT_AUTHENTICATED: 'USER_NOT_AUTHENTICATED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  INVALID_PACKAGE: 'INVALID_PACKAGE',
  PURCHASE_FAILED: 'PURCHASE_FAILED',
  DUPLICATE_PURCHASE: 'DUPLICATE_PURCHASE',
} as const;
```

### Credit Limits

```typescript
export const CREDIT_LIMITS = {
  MAX_MONTHLY_CREDITS: 100,
  MAX_BONUS_CREDITS: 1000,
  MIN_CREDITS: 0,
} as const;
```

### Time Periods

```typescript
export const TIME_PERIODS = {
  CREDIT_RESET_DAYS: 30,
  EXPIRATION_WARNING_DAYS: 7,
  EXPIRATION_CRITICAL_DAYS: 3,
} as const;
```

## Usage

```typescript
import { SUBSCRIPTION_TIERS, PACKAGE_PERIODS } from './constants';

const tier: SubscriptionTier = SUBSCRIPTION_TIERS.PREMIUM;
const period: PackagePeriod = PACKAGE_PERIODS.ANNUAL;
```

## Related

- [Domain README](../README.md)
- [Entities](../entities/README.md)
