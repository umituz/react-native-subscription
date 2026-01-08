# RevenueCat Domain Value Objects

Value objects for RevenueCat integration.

## Overview

This directory contains value objects - immutable types that represent concepts in the RevenueCat domain with no identity. Value objects are defined by their attributes rather than an identity.

## Value Objects

### EntitlementId

Represents an entitlement identifier.

```typescript
class EntitlementId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Entitlement ID cannot be empty');
    }
    this.value = value.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EntitlementId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Usage
const premiumId = new EntitlementId('premium');
```

### OfferingId

Represents an offering identifier.

```typescript
class OfferingId {
  private readonly value: string;

  constructor(value: string) {
    const validIds = ['default', 'annual_offer', 'lifetime_offer'];
    if (!validIds.includes(value)) {
      throw new Error(`Invalid offering ID: ${value}`);
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  isDefault(): boolean {
    return this.value === 'default';
  }

  equals(other: OfferingId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Usage
const defaultOffering = new OfferingId('default');
const annualOffering = new OfferingId('annual_offer');
```

### PackageIdentifier

Represents a package identifier.

```typescript
class PackageIdentifier {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Package identifier cannot be empty');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  getType(): PackageType {
    if (this.value.includes('monthly')) return 'monthly';
    if (this.value.includes('annual')) return 'annual';
    if (this.value.includes('lifetime')) return 'lifetime';
    if (this.value.includes('weekly')) return 'weekly';
    return 'single_purchase';
  }

  isSubscription(): boolean {
    const type = this.getType();
    return type === 'monthly' || type === 'annual' || type === 'weekly';
  }

  equals(other: PackageIdentifier): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Usage
const monthlyPackage = new PackageIdentifier('$rc_monthly');
console.log(monthlyPackage.getType()); // 'monthly'
console.log(monthlyPackage.isSubscription()); // true
```

### ProductId

Represents a product identifier.

```typescript
class ProductId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Product ID cannot be empty');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Usage
const productId = new ProductId('com.app.premium.monthly');
```

### Money

Represents monetary value with currency.

```typescript
class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (currency.length !== 3) {
      throw new Error('Currency must be ISO 4217 code (3 letters)');
    }
    this.amount = amount;
    this.currency = currency.toUpperCase();
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return this.format();
  }
}

// Usage
const price = new Money(9.99, 'USD');
console.log(price.format()); // '$9.99'
console.log(price.format('tr-TR')); // '9,99 $'

const annualPrice = price.multiply(12);
console.log(annualPrice.format()); // '$119.88'
```

### SubscriptionPeriod

Represents a subscription period.

```typescript
class SubscriptionPeriod {
  private readonly value: number;
  private readonly unit: 'day' | 'week' | 'month' | 'year';

  constructor(value: number, unit: 'day' | 'week' | 'month' | 'year') {
    if (value <= 0) {
      throw new Error('Period value must be positive');
    }
    this.value = value;
    this.unit = unit;
  }

  getValue(): number {
    return this.value;
  }

  getUnit(): string {
    return this.unit;
  }

  inDays(): number {
    switch (this.unit) {
      case 'day': return this.value;
      case 'week': return this.value * 7;
      case 'month': return this.value * 30; // Approximate
      case 'year': return this.value * 365;
    }
  }

  inMonths(): number {
    switch (this.unit) {
      case 'day': return this.value / 30;
      case 'week': return this.value / 4;
      case 'month': return this.value;
      case 'year': return this.value * 12;
    }
  }

  format(locale: string = 'en-US'): string {
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
    return formatter.format(this.value, this.unit);
  }

  equals(other: SubscriptionPeriod): boolean {
    return this.value === other.value && this.unit === other.unit;
  }

  toString(): string {
    return this.format();
  }
}

// Usage
const monthly = new SubscriptionPeriod(1, 'month');
const annual = new SubscriptionPeriod(1, 'year');

console.log(monthly.format()); // '1 month'
console.log(annual.inDays()); // 365
console.log(annual.inMonths()); // 12
```

### PurchaseToken

Represents a purchase transaction token.

```typescript
class PurchaseToken {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Purchase token cannot be empty');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PurchaseToken): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  // Mask sensitive parts
  mask(): string {
    if (this.value.length <= 8) {
      return '***';
    }
    const start = this.value.substring(0, 4);
    const end = this.value.substring(this.value.length - 4);
    return `${start}...${end}`;
  }
}

// Usage
const token = new PurchaseToken('abc123def456ghi789');
console.log(token.mask()); // 'abc1...i789'
```

## Usage Examples

### Creating Value Objects

```typescript
import {
  EntitlementId,
  OfferingId,
  PackageIdentifier,
  Money,
  SubscriptionPeriod,
} from './value-objects';

// Create entitlement ID
const premiumId = new EntitlementId('premium');

// Create offering ID
const defaultOffering = new OfferingId('default');

// Create package identifier
const monthlyPackage = new PackageIdentifier('$rc_monthly');

// Create price
const price = new Money(9.99, 'USD');

// Create subscription period
const period = new SubscriptionPeriod(1, 'month');
```

### Comparing Value Objects

```typescript
const id1 = new EntitlementId('premium');
const id2 = new EntitlementId('premium');
const id3 = new EntitlementId('pro');

console.log(id1.equals(id2)); // true
console.log(id1.equals(id3)); // false

const price1 = new Money(9.99, 'USD');
const price2 = new Money(9.99, 'USD');
const price3 = new Money(19.99, 'USD');

console.log(price1.equals(price2)); // true
console.log(price1.equals(price3)); // false
```

### Performing Operations

```typescript
// Money arithmetic
const monthlyPrice = new Money(9.99, 'USD');
const annualPrice = monthlyPrice.multiply(12);
const withDiscount = annualPrice.multiply(0.8); // 20% off

console.log(monthlyPrice.format()); // '$9.99'
console.log(annualPrice.format()); // '$119.88'
console.log(withDiscount.format()); // '$95.90'

// Period conversions
const period = new SubscriptionPeriod(1, 'year');
console.log(period.inDays()); // 365
console.log(period.inMonths()); // 12
console.log(period.format('tr-TR')); // '1 yıl'
```

### Validation

```typescript
// Valid values
const validEntitlement = new EntitlementId('premium');
const validMoney = new Money(10.00, 'USD');
const validPeriod = new SubscriptionPeriod(1, 'month');

// Invalid values (will throw)
try {
  new EntitlementId(''); // Error: Entitlement ID cannot be empty
} catch (error) {
  console.error(error.message);
}

try {
  new Money(-10, 'USD'); // Error: Amount cannot be negative
} catch (error) {
  console.error(error.message);
}

try {
  new SubscriptionPeriod(0, 'month'); // Error: Period value must be positive
} catch (error) {
  console.error(error.message);
}
```

## Best Practices

1. **Immutability**: Never modify value objects after creation
2. **Validation**: Validate in constructor, fail fast
3. **Equality**: Implement proper equality based on values
4. **Formatting**: Provide locale-aware formatting
5. **Operations**: Return new instances for operations
6. **Type Safety**: Use TypeScript for compile-time checks
7. **Serialization**: Provide toString/JSON methods if needed

## Related

- [RevenueCat Domain](../README.md)
- [RevenueCat Entities](../entities/README.md)
- [RevenueCat Types](../types/README.md)
