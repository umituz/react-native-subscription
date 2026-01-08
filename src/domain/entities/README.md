# Domain Entities

Core domain entities for subscription management.

## Purpose

Domain entities represent the core business concepts and rules of the subscription system. They are framework-agnostic and contain only business logic.

## Entities

### SubscriptionStatus

Represents the subscription state of a user.

```typescript
interface SubscriptionStatus {
  type: SubscriptionStatusType;
  isActive: boolean;
  isPremium: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  productId?: string;
}

type SubscriptionStatusType =
  | 'unknown'
  | 'guest'
  | 'free'
  | 'premium';
```

**Usage:**
```typescript
import { SubscriptionStatus } from '@umituz/react-native-subscription/domain';

const status = SubscriptionStatus.create({
  type: 'premium',
  isActive: true,
  isPremium: true,
  expirationDate: '2025-12-31',
  willRenew: true,
});
```

## Design Principles

### 1. Self-Validation

Entities validate themselves on creation:

```typescript
class SubscriptionStatus {
  private constructor(data: SubscriptionStatusData) {
    this.validate(data);
    // ...
  }

  private validate(data: SubscriptionStatusData): void {
    if (data.isPremium && !data.isActive) {
      throw new ValidationError('Premium users must be active');
    }
  }
}
```

### 2. Immutable State

Entities cannot be modified after creation:

```typescript
const status = SubscriptionStatus.create({...});
// status.isActive = false; // Error: Cannot assign to read-only property
```

### 3. Business Rules

Business logic is encapsulated in entities:

```typescript
class SubscriptionStatus {
  isExpired(): boolean {
    if (!this.expirationDate) return false;
    return new Date(this.expirationDate) < new Date();
  }

  requiresRenewal(): boolean {
    return this.isPremium && this.expirationDate && this.willRenew;
  }
}
```

## Creating Entities

### Factory Method

```typescript
const status = SubscriptionStatus.create({
  type: 'premium',
  isActive: true,
  isPremium: true,
  expirationDate: null,
  willRenew: false,
});
```

### Validation

```typescript
try {
  const status = SubscriptionStatus.create({
    type: 'premium',
    isActive: false, // Invalid!
    isPremium: true,
  });
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

## Domain Services

Business operations that don't naturally fit in entities:

```typescript
class SubscriptionDomainService {
  canUpgrade(currentStatus: SubscriptionStatus): boolean {
    return !currentStatus.isPremium;
  }

  calculateDaysUntilExpiry(status: SubscriptionStatus): number | null {
    if (!status.expirationDate) return null;
    const diff = new Date(status.expirationDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
```

## Best Practices

1. **Keep entities pure** - No framework dependencies
2. **Validate invariants** - Ensure valid state
3. **Use value objects** - For complex attributes
4. **Encapsulate logic** - Keep business rules inside entities
5. **Make immutable** - Prevent direct state modification

## Testing

```typescript
describe('SubscriptionStatus', () => {
  it('should create valid premium status', () => {
    const status = SubscriptionStatus.create({
      type: 'premium',
      isActive: true,
      isPremium: true,
    });

    expect(status.isPremium).toBe(true);
  });

  it('should reject invalid premium status', () => {
    expect(() => {
      SubscriptionStatus.create({
        type: 'premium',
        isActive: false,
        isPremium: true,
      });
    }).toThrow();
  });
});
```

## Related

- [Value Objects](../value-objects/README.md)
- [Domain Errors](../errors/README.md)
- [Domain Layer](../../README.md)
