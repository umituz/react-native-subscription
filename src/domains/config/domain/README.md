# Config Domain

Domain layer for configuration management.

## Overview

This directory contains the business logic and domain models for subscription and feature configuration.

## Structure

```
domain/
├── entities/        # Configuration entities
└── value-objects/   # Configuration value objects
```

## Entities

### PackageConfig

Represents a subscription package configuration.

```typescript
class PackageConfig {
  readonly identifier: string;
  readonly productId: string;
  readonly period: PackagePeriod;
  readonly price: Money;
  readonly features: Feature[];
  readonly credits?: number;
  readonly metadata: PackageMetadata;

  constructor(config: PackageConfigData) {
    this.identifier = config.identifier;
    this.productId = config.productId;
    this.period = config.period;
    this.price = new Money(config.price, config.currency);
    this.features = config.features;
    this.credits = config.credits;
    this.metadata = config.metadata || {};
    this.validate();
  }

  private validate(): void {
    if (!this.identifier) {
      throw new Error('Package identifier is required');
    }
    if (!this.productId) {
      throw new Error('Product ID is required');
    }
    if (this.price.getAmount() < 0) {
      throw new Error('Price cannot be negative');
    }
  }

  isAnnual(): boolean {
    return this.period === 'annual';
  }

  isMonthly(): boolean {
    return this.period === 'monthly';
  }

  isLifetime(): boolean {
    return this.period === 'lifetime';
  }

  hasCredits(): boolean {
    return !!this.credits && this.credits > 0;
  }

  isRecommended(): boolean {
    return this.metadata.recommended === true;
  }

  isHighlighted(): boolean {
    return this.metadata.highlight === true;
  }

  getDiscountPercentage(): number | null {
    return this.metadata.discount?.percentage ?? null;
  }

  getBadge(): string | null {
    return this.metadata.badge ?? null;
  }

  getPerMonthPrice(): Money | null {
    if (this.period === 'monthly') {
      return this.price;
    }
    if (this.period === 'annual') {
      return this.price.divide(12);
    }
    return null;
  }
}
```

### FeatureConfig

Represents a feature configuration.

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

  constructor(config: FeatureConfigData) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.requiresPremium = config.requiresPremium;
    this.requiresCredits = config.requiresCredits ?? false;
    this.creditCost = config.creditCost;
    this.enabled = config.enabled ?? true;
    this.gateType = config.gateType ?? this.inferGateType();
    this.validate();
  }

  private inferGateType(): 'premium' | 'credits' | 'both' {
    if (this.requiresPremium && this.requiresCredits) {
      return 'both';
    }
    if (this.requiresPremium) {
      return 'premium';
    }
    return 'credits';
  }

  private validate(): void {
    if (!this.id) {
      throw new Error('Feature ID is required');
    }
    if (this.requiresCredits && !this.creditCost) {
      throw new Error('Credit cost required when requiresCredits is true');
    }
    if (this.creditCost && this.creditCost < 0) {
      throw new Error('Credit cost cannot be negative');
    }
  }

  isAccessible(userHasPremium: boolean, userCredits: number): boolean {
    if (!this.enabled) {
      return false;
    }

    if (this.gateType === 'premium') {
      return userHasPremium;
    }

    if (this.gateType === 'credits') {
      return userCredits >= (this.creditCost ?? 0);
    }

    if (this.gateType === 'both') {
      return userHasPremium && userCredits >= (this.creditCost ?? 0);
    }

    return false;
  }

  getRequiredCredits(): number {
    return this.creditCost ?? 0;
  }
}
```

### PaywallConfig

Represents paywall configuration.

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

  constructor(config: PaywallConfigData) {
    this.id = config.id;
    this.title = config.title;
    this.subtitle = config.subtitle;
    this.features = config.features;
    this.packages = config.packages.map(p => new PackageConfig(p));
    this.highlightPackage = config.highlightPackage;
    this.style = config.style;
    this.triggers = config.triggers ?? [];
    this.validate();
  }

  private validate(): void {
    if (!this.id) {
      throw new Error('Paywall ID is required');
    }
    if (this.packages.length === 0) {
      throw new Error('At least one package is required');
    }
    if (this.highlightPackage) {
      const exists = this.packages.some(p => p.identifier === this.highlightPackage);
      if (!exists) {
        throw new Error('Highlight package not found');
      }
    }
  }

  getHighlightedPackage(): PackageConfig | null {
    if (!this.highlightPackage) {
      return this.packages.find(p => p.isHighlighted()) ?? null;
    }
    return this.packages.find(p => p.identifier === this.highlightPackage) ?? null;
  }

  getPackageByIdentifier(identifier: string): PackageConfig | null {
    return this.packages.find(p => p.identifier === identifier) ?? null;
  }

  shouldTrigger(triggerType: string): boolean {
    return this.triggers.some(t => t.type === triggerType);
  }
}
```

## Value Objects

### PackagePeriod

```typescript
class PackagePeriod {
  readonly value: 'monthly' | 'annual' | 'lifetime' | 'weekly';

  constructor(value: string) {
    const valid = ['monthly', 'annual', 'lifetime', 'weekly'];
    if (!valid.includes(value)) {
      throw new Error(`Invalid period: ${value}`);
    }
    this.value = value as PackagePeriod['value'];
  }

  isRecurring(): boolean {
    return this.value === 'monthly' || this.value === 'annual' || this.value === 'weekly';
  }

  getDurationInMonths(): number | null {
    switch (this.value) {
      case 'monthly': return 1;
      case 'annual': return 12;
      case 'weekly': return 1 / 4;
      case 'lifetime': return null;
    }
  }

  toString(): string {
    return this.value;
  }
}
```

### Money

```typescript
class Money {
  readonly amount: number;
  readonly currency: string;

  constructor(amount: number, currency: string) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    this.amount = amount;
    this.currency = currency;
  }

  format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  divide(factor: number): Money {
    return new Money(this.amount / factor, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
```

## Usage

### Creating Package Configuration

```typescript
import { PackageConfig } from './entities/PackageConfig';

const monthlyPackage = new PackageConfig({
  identifier: 'premium_monthly',
  productId: 'com.app.premium.monthly',
  period: 'monthly',
  price: 9.99,
  currency: 'USD',
  features: ['Unlimited Access', 'Ad-Free'],
  credits: 100,
  metadata: {
    recommended: true,
    badge: 'Most Popular',
  },
});

console.log(monthlyPackage.isMonthly()); // true
console.log(monthlyPackage.getPerMonthPrice()?.format()); // '$9.99'
```

### Creating Feature Configuration

```typescript
import { FeatureConfig } from './entities/FeatureConfig';

const aiFeature = new FeatureConfig({
  id: 'ai_generation',
  name: 'AI Generation',
  description: 'Generate AI content',
  requiresPremium: false,
  requiresCredits: true,
  creditCost: 5,
  enabled: true,
  gateType: 'credits',
});

console.log(aiFeature.isAccessible(false, 10)); // true
console.log(aiFeature.isAccessible(false, 3)); // false
console.log(aiFeature.getRequiredCredits()); // 5
```

### Creating Paywall Configuration

```typescript
import { PaywallConfig } from './entities/PaywallConfig';

const paywall = new PaywallConfig({
  id: 'premium_upgrade',
  title: 'Upgrade to Premium',
  subtitle: 'Get unlimited access',
  features: ['Feature 1', 'Feature 2'],
  packages: [monthlyPackage, annualPackage],
  highlightPackage: 'premium_annual',
  style: {
    primaryColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  triggers: [
    { type: 'credit_gate', enabled: true },
    { type: 'manual', enabled: true },
  ],
});

const highlighted = paywall.getHighlightedPackage();
console.log(highlighted?.identifier); // 'premium_annual'
```

## Best Practices

1. **Validation**: Validate in constructor, fail fast
2. **Immutability**: Keep entities immutable
3. **Type Safety**: Use TypeScript for compile-time checks
4. **Business Logic**: Encapsulate business logic in entities
5. **Equality**: Implement proper equality methods
6. **Formatting**: Provide formatting methods

## Related

- [Config Domain](../../README.md)
- [Config Entities](./entities/README.md)
- [Config Value Objects](./value-objects/README.md)
