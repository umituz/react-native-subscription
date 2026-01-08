# Presentation Utils

Utility functions and helpers for the presentation layer.

## Overview

This directory contains utility functions used by presentation components and hooks.

## Contents

- **subscriptionDateUtils.ts** - Date formatting and manipulation for subscription display
- **paywallUtils.ts** - Paywall-related utility functions

## Date Utilities

### formatDate

Format ISO date string to localized date string.

```typescript
formatDate('2024-01-15T10:30:00Z'); // "January 15, 2024"
```

### calculateDaysRemaining

Calculate days between now and expiration date.

```typescript
calculateDaysRemaining('2024-02-15T10:30:00Z'); // 31
```

### convertPurchasedAt

Convert purchasedAt date to ISO string.

```typescript
convertPurchasedAt(new Date()); // "2024-01-15T10:30:00Z"
```

## Usage

```typescript
import { formatDate, calculateDaysRemaining } from '../utils/subscriptionDateUtils';

const expirationDisplay = formatDate(subscription.expirationDate);
const daysLeft = calculateDaysRemaining(subscription.expirationDate);
```

## Related

- [Hooks](../hooks/README.md)
- [Types](../types/README.md)
