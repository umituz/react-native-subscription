# RevenueCat Infrastructure Config

RevenueCat SDK configuration and initialization.

## Overview

This directory contains configuration utilities and setup for the RevenueCat SDK.

## Contents

- **revenueCatConfig.ts** - RevenueCat configuration object and setup

## Configuration

```typescript
interface RevenueCatConfig {
  apiKey: string;
  entitlementId: string;
  [key: string]: any;
}
```

## Usage

Configure RevenueCat at app startup:

```typescript
import { revenueCatConfig } from './config/revenueCatConfig';

// In your app initializer
await Purchases.configure({
  apiKey: revenueCatConfig.apiKey,
  appUserID: userId,
});
```

## Related

- [Managers](../managers/README.md)
- [Services](../services/README.md)
