# RevenueCat Infrastructure Managers

Manager classes for coordinating RevenueCat operations.

## Overview

This directory contains high-level manager classes that coordinate between different RevenueCat services and handle complex operations.

## Contents

- **SubscriptionManager.ts** - Manages RevenueCat configuration and entitlement access

## SubscriptionManager

Manages RevenueCat SDK configuration and provides access to entitlement IDs.

### Key Methods

```typescript
class SubscriptionManager {
  static configure(config: RevenueCatConfig): void;
  static getEntitlementId(): string | null;
  static getOfferings(): Promise<Offerings>;
}
```

### Usage

```typescript
import { SubscriptionManager } from './managers/SubscriptionManager';

// Configure at app startup
SubscriptionManager.configure({
  apiKey: 'your_api_key',
  entitlementId: 'premium',
});

// Get entitlement ID
const entitlementId = SubscriptionManager.getEntitlementId();

// Get offerings
const offerings = await SubscriptionManager.getOfferings();
```

## Related

- [Services](../services/README.md)
- [Config](../config/README.md)
- [Domain](../../domain/README.md)
