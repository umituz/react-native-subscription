# Paywall Entities

Domain entities for paywall configuration and state management.

## Overview

This directory contains entities representing paywall configuration, triggers, and display logic.

## Entities

### PaywallTrigger
Represents an event that triggers paywall display.

```typescript
interface PaywallTrigger {
  type: PaywallTriggerType;
  feature?: string;
  packageName?: string;
  context?: Record<string, any>;
  timestamp: number;
}

type PaywallTriggerType =
  | 'premium_feature'     // Premium feature access attempt
  | 'credit_gate'         // Credit gate failure
  | 'manual'              // User manually opened
  | 'onboarding_complete' // Post-onboarding
  | 'usage_limit'         // Free tier limit reached
  | 'subscription_expired'; // Subscription expired
```

**Usage:**
```typescript
const trigger: PaywallTrigger = {
  type: 'premium_feature',
  feature: 'ai_generation',
  context: { cost: 5 },
  timestamp: Date.now(),
};
```

### PaywallConfig
Configuration for paywall display.

```typescript
interface PaywallConfig {
  title: string;
  subtitle: string;
  description?: string;
  features: string[];
  highlightBenefit?: string;  // Main value proposition
  packages: PaywallPackage[];
  defaultPackage?: string;    // Pre-selected package
  dismissible: boolean;
  showCloseButton: boolean;
  onUpgrade: (pkg: PaywallPackage) => void;
  onDismiss: () => void;
}
```

**Usage:**
```typescript
const config: PaywallConfig = {
  title: 'Upgrade to Premium',
  subtitle: 'Unlock all features',
  features: [
    'Unlimited access',
    'Priority support',
    'Ad-free experience',
  ],
  packages: availablePackages,
  dismissible: true,
  showCloseButton: true,
  onUpgrade: (pkg) => purchasePackage(pkg),
  onDismiss: () => navigation.goBack(),
};
```

### PaywallPackage
Represents a subscription package displayed in paywall.

```typescript
interface PaywallPackage {
  identifier: string;         // Unique package ID
  productIdentifier: string;  // RevenueCat product ID
  title: string;              // Display title
  description: string;        // Package description
  price: number;              // Price in local currency
  pricePerMonth?: number;     // Monthly equivalent (for annual)
  currencyCode: string;       // Currency code
  period: PackagePeriod;      // Billing period
  features: string[];         // Package features
  popular?: boolean;          // Highlight as popular
  savings?: number;           // Savings amount (for annual)
  badge?: string;             // Custom badge text
}

type PackagePeriod = 'monthly' | 'annual' | 'lifetime';
```

**Usage:**
```typescript
const premiumPackage: PaywallPackage = {
  identifier: 'premium_annual',
  productIdentifier: 'com.app.premium.annual',
  title: 'Premium Annual',
  description: 'Best value - Save 50%',
  price: 99.99,
  pricePerMonth: 8.33,
  currencyCode: 'USD',
  period: 'annual',
  features: [
    'Unlimited access',
    'Priority support',
    'Ad-free',
    'Advanced features',
  ],
  popular: true,
  savings: 20.00,
  badge: 'BEST VALUE',
};
```

### PaywallState
Manages current paywall state and context.

```typescript
interface PaywallState {
  visible: boolean;
  trigger?: PaywallTrigger;
  selectedPackage?: string;
  pendingAction?: () => void;  // Execute after upgrade
  metadata?: {
    userId?: string;
    screen?: string;          // Screen where paywall shown
    previousScreen?: string;  // Screen before paywall
  };
}
```

**Usage:**
```typescript
const state: PaywallState = {
  visible: true,
  trigger: {
    type: 'premium_feature',
    feature: 'ai_generation',
    timestamp: Date.now(),
  },
  selectedPackage: 'premium_annual',
  pendingAction: () => executeAIGeneration(),
  metadata: {
    userId: 'user-123',
    screen: 'AIGeneration',
  },
};
```

## Key Operations

### Create Trigger
```typescript
function createTrigger(
  type: PaywallTriggerType,
  context?: Record<string, any>
): PaywallTrigger {
  return {
    type,
    context,
    timestamp: Date.now(),
  };
}
```

### Validate Config
```typescript
function validatePaywallConfig(config: PaywallConfig): void {
  if (!config.title) throw new Error('Title is required');
  if (!config.packages || config.packages.length === 0) {
    throw new Error('At least one package is required');
  }
  if (config.defaultPackage && !config.packages.find(p => p.identifier === config.defaultPackage)) {
    throw new Error('Default package must be in packages list');
  }
}
```

## Best Practices

1. **Rich Context**: Include context in triggers for analytics
2. **Validation**: Validate configurations before use
3. **Immutability**: Treat entities as immutable values
4. **Type Safety**: Use strict TypeScript types
5. **Analytics**: Track all paywall events and triggers

## Related

- [Paywall README](../README.md)
- [PaywallVisibility Hook](../../presentation/hooks/usePaywallVisibility.md)
