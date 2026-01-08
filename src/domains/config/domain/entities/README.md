# Config Domain Entities

Domain entities for configuration management.

## Overview

This directory contains entity classes representing configuration concepts like packages, features, and paywalls.

## Entities

### PackageConfig

Represents a subscription package configuration.

**File**: `PackageConfig.ts`

```typescript
class PackageConfig {
  readonly identifier: string;
  readonly productId: string;
  readonly period: PackagePeriod;
  readonly price: Money;
  readonly features: string[];
  readonly credits?: number;
  readonly metadata: PackageMetadata;

  // Methods
  isAnnual(): boolean;
  isMonthly(): boolean;
  isLifetime(): boolean;
  hasCredits(): boolean;
  isRecommended(): boolean;
  isHighlighted(): boolean;
  getPerMonthPrice(): Money | null;
  getDiscountPercentage(): number | null;
  getBadge(): string | null;
}
```

**Usage:**
```typescript
const pkg = new PackageConfig({
  identifier: 'premium_annual',
  productId: 'com.app.premium.annual',
  period: 'annual',
  price: 79.99,
  currency: 'USD',
  features: ['Unlimited Access', 'Ad-Free'],
  credits: 1200,
  metadata: {
    recommended: true,
    badge: 'Best Value',
    discount: { percentage: 20, description: 'Save 20%' },
  },
});

console.log(pkg.isAnnual()); // true
console.log(pkg.getPerMonthPrice()?.format()); // '$6.67'
console.log(pkg.getDiscountPercentage()); // 20
```

### FeatureConfig

Represents a feature configuration with gating rules.

**File**: `FeatureConfig.ts`

```typescript
class FeatureConfig {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly requiresPremium: boolean;
  readonly requiresCredits: boolean;
  readonly creditCost?: number;
  readonly enabled: boolean;
  readonly gateType: 'premium' | 'credits' | 'both';

  // Methods
  isAccessible(userHasPremium: boolean, userCredits: number): boolean;
  getRequiredCredits(): number;
}
```

**Usage:**
```typescript
const feature = new FeatureConfig({
  id: 'ai_generation',
  name: 'AI Generation',
  requiresPremium: false,
  requiresCredits: true,
  creditCost: 5,
  enabled: true,
  gateType: 'credits',
});

console.log(feature.isAccessible(false, 10)); // true
console.log(feature.isAccessible(false, 3)); // false
console.log(feature.getRequiredCredits()); // 5
```

### PaywallConfig

Represents a paywall screen configuration.

**File**: `PaywallConfig.ts`

```typescript
class PaywallConfig {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly features: string[];
  readonly packages: PackageConfig[];
  readonly highlightPackage?: string;
  readonly style: PaywallStyle;
  readonly triggers: PaywallTrigger[];

  // Methods
  getHighlightedPackage(): PackageConfig | null;
  getPackageByIdentifier(identifier: string): PackageConfig | null;
  shouldTrigger(triggerType: string): boolean;
}
```

**Usage:**
```typescript
const paywall = new PaywallConfig({
  id: 'premium_upgrade',
  title: 'Upgrade to Premium',
  features: ['Unlimited Access', 'Ad-Free'],
  packages: [monthlyPkg, annualPkg],
  highlightPackage: 'premium_annual',
  style: {
    primaryColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  triggers: [{ type: 'credit_gate', enabled: true }],
});

const highlighted = paywall.getHighlightedPackage();
console.log(highlighted?.identifier); // 'premium_annual'
```

### SubscriptionSettingsConfig

Represents subscription settings configuration.

**File**: `SubscriptionSettingsConfig.ts`

```typescript
class SubscriptionSettingsConfig {
  readonly showSubscriptionDetails: boolean;
  readonly showCreditBalance: boolean;
  readonly allowRestorePurchases: boolean;
  readonly showManageSubscriptionButton: boolean;
  readonly subscriptionManagementURL: string;
  readonly supportEmail: string;

  // Methods
  getAvailableActions(): string[];
  isRestoreAllowed(): boolean;
}
```

**Usage:**
```typescript
const settings = new SubscriptionSettingsConfig({
  showSubscriptionDetails: true,
  showCreditBalance: true,
  allowRestorePurchases: true,
  showManageSubscriptionButton: true,
  subscriptionManagementURL: 'https://apps.apple.com/account/subscriptions',
  supportEmail: 'support@example.com',
});

console.log(settings.isRestoreAllowed()); // true
```

## Supporting Types

### PackageMetadata

```typescript
interface PackageMetadata {
  highlight?: boolean;
  recommended?: boolean;
  discount?: {
    percentage: number;
    description: string;
  };
  badge?: string;
}
```

### PaywallStyle

```typescript
interface PaywallStyle {
  primaryColor: string;
  backgroundColor: string;
  textColor?: string;
  image?: string;
  logo?: string;
}
```

### PaywallTrigger

```typescript
interface PaywallTrigger {
  type: string;
  enabled: boolean;
  conditions?: Record<string, unknown>;
}
```

## Factory Functions

### createDefaultPackages

Create default package configurations.

```typescript
function createDefaultPackages(): PackageConfig[] {
  return [
    new PackageConfig({
      identifier: 'premium_monthly',
      productId: 'com.app.premium.monthly',
      period: 'monthly',
      price: 9.99,
      currency: 'USD',
      features: ['Unlimited Access', 'Ad-Free'],
      credits: 100,
    }),
    new PackageConfig({
      identifier: 'premium_annual',
      productId: 'com.app.premium.annual',
      period: 'annual',
      price: 79.99,
      currency: 'USD',
      features: ['Unlimited Access', 'Ad-Free', 'Save 20%'],
      credits: 1200,
      metadata: {
        recommended: true,
        badge: 'Best Value',
        discount: { percentage: 20, description: 'Save 20%' },
      },
    }),
  ];
}
```

### createDefaultPaywall

Create default paywall configuration.

```typescript
function createDefaultPaywall(): PaywallConfig {
  return new PaywallConfig({
    id: 'default_paywall',
    title: 'Upgrade to Premium',
    subtitle: 'Get unlimited access to all features',
    features: [
      'Unlimited Access',
      'Ad-Free Experience',
      'Priority Support',
      'Exclusive Features',
    ],
    packages: createDefaultPackages(),
    highlightPackage: 'premium_annual',
    style: {
      primaryColor: '#007AFF',
      backgroundColor: '#FFFFFF',
    },
    triggers: [
      { type: 'premium_feature', enabled: true },
      { type: 'credit_gate', enabled: true },
    ],
  });
}
```

## Usage Examples

### Validating Package Configuration

```typescript
function validatePackage(config: PackageConfigData): boolean {
  try {
    new PackageConfig(config);
    return true;
  } catch (error) {
    console.error('Invalid package config:', error.message);
    return false;
  }
}
```

### Finding Recommended Package

```typescript
function findRecommendedPackage(packages: PackageConfig[]): PackageConfig | null {
  return packages.find(pkg => pkg.isRecommended()) ?? null;
}

const recommended = findRecommendedPackage(packages);
console.log('Recommended:', recommended?.identifier);
```

### Filtering Packages by Period

```typescript
function getPackagesByPeriod(packages: PackageConfig[], period: 'monthly' | 'annual'): PackageConfig[] {
  return packages.filter(pkg => {
    if (period === 'monthly') return pkg.isMonthly();
    if (period === 'annual') return pkg.isAnnual();
    return false;
  });
}

const monthlyPackages = getPackagesByPeriod(packages, 'monthly');
```

### Checking Feature Access

```typescript
function canUserAccessFeature(feature: FeatureConfig, user: User): boolean {
  return feature.isAccessible(user.isPremium, user.credits);
}

const aiFeature = new FeatureConfig({ /* ... */ });
const canAccess = canUserAccessFeature(aiFeature, currentUser);
```

## Best Practices

1. **Validation**: Always validate configuration in constructor
2. **Immutability**: Never modify entities after creation
3. **Business Logic**: Keep business logic in entities
4. **Type Safety**: Use TypeScript strictly
5. **Error Messages**: Provide clear error messages
6. **Defaults**: Provide factory functions for defaults
7. **Testing**: Test validation logic thoroughly

## Related

- [Config Domain](../README.md)
- [Config Value Objects](../value-objects/README.md)
- [Config Utils](../../utils/README.md)
