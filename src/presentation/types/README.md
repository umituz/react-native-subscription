# Presentation Types

TypeScript type definitions and interfaces for the presentation layer.

## Overview

This directory contains all type definitions used by presentation components and hooks.

## Contents

### Subscription Types

- **SubscriptionSettingsTypes.ts** - Configuration types for subscription settings UI
- **PaywallTypes.ts** - Paywall component types
- **SubscriptionTypes.ts** - General subscription UI types

## Key Exports

```typescript
// Subscription Settings
export type {
  SubscriptionSettingsConfig,
  SubscriptionSettingsItemConfig,
  SubscriptionSettingsTranslations,
} from './SubscriptionSettingsTypes';

// Paywall
export type {
  PaywallConfig,
  PaywallTrigger,
  PaywallPackage,
} from './PaywallTypes';
```

## Related

- [Hooks](../hooks/README.md)
- [Components](../components/README.md)
