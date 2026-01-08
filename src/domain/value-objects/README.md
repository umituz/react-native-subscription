# Domain Value Objects

Value objects for the subscription domain.

## Purpose

Value objects are immutable objects that represent concepts by their attributes rather than identity. They are used to ensure validity and prevent primitive obsession.

## Value Objects

### SubscriptionConfig

Configuration object for subscription system.

```typescript
interface SubscriptionConfig {
  revenueCatApiKey: string;
  revenueCatEntitlementId: string;
  plans: Record<string, Plan>;
  defaultPlan: string;
  features: ConfigFeatures;
  ui?: ConfigUI;
  onStatusChanged?: (userId: string, status: SubscriptionStatus) => void;
  onError?: (error: Error) => void;
}
```

**Usage:**
```typescript
import { SubscriptionConfig } from '@umituz/react-native-subscription/domain';

const config: SubscriptionConfig = {
  revenueCatApiKey: 'your_key',
  revenueCatEntitlementId: 'premium',
  plans: {
    monthly: monthlyPlan,
    annual: annualPlan,
  },
  defaultPlan: 'monthly',
  features: {
    requireAuth: true,
    allowRestore: true,
  },
};
```

## Characteristics

### 1. Immutable

```typescript
const config = SubscriptionConfig.create({...});
// config.apiKey = 'new_key'; // Error: Cannot assign
```

### 2. Value-Based Equality

```typescript
const config1 = SubscriptionConfig.create({...});
const config2 = SubscriptionConfig.create({...});

config1.equals(config2); // true (if same values)
```

### 3. Self-Validating

```typescript
const config = SubscriptionConfig.create({
  apiKey: '', // Invalid!
  entitlementId: 'premium',
});
// Throws ValidationError
```

## Creating Value Objects

### Factory Method

```typescript
const config = SubscriptionConfig.create({
  apiKey: 'your_key',
  entitlementId: 'premium',
});
```

### Builder Pattern

```typescript
const config = SubscriptionConfig.builder()
  .apiKey('your_key')
  .entitlementId('premium')
  .addPlan('monthly', monthlyPlan)
  .addPlan('annual', annualPlan)
  .build();
```

## Common Value Objects

### Money

```typescript
class Money {
  private constructor(
    private amount: number,
    private currency: string
  ) {}

  static create(amount: number, currency: string): Money {
    if (amount < 0) throw new Error('Amount cannot be negative');
    return new Money(amount, currency);
  }

  format(): string {
    return new Intl.NumberFormat('en-US', {
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
}
```

### DateRange

```typescript
class DateRange {
  constructor(
    private start: Date,
    private end: Date
  ) {}

  includes(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  durationInDays(): number {
    return Math.ceil(
      (this.end.getTime() - this.start.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}
```

## Best Practices

1. **Make immutable** - All properties readonly
2. **Validate on creation** - Fail fast
3. **Override equality** - Compare by value, not reference
4. **Use for complex attributes** - Don't use for simple primitives
5. **Keep small** - Value objects should be focused

## Testing

```typescript
describe('SubscriptionConfig', () => {
  it('should create valid config', () => {
    const config = SubscriptionConfig.create({
      apiKey: 'test_key',
      entitlementId: 'premium',
    });

    expect(config.apiKey).toBe('test_key');
  });

  it('should reject invalid config', () => {
    expect(() => {
      SubscriptionConfig.create({
        apiKey: '',
        entitlementId: 'premium',
      });
    }).toThrow();
  });
});
```

## Related

- [Domain Entities](../entities/README.md)
- [Domain Errors](../errors/README.md)
- [Domain Layer](../../README.md)
