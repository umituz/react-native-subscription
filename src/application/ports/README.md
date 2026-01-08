# Application Ports

Interfaces defining contracts between application layer and external dependencies.

## Overview

This directory contains port interfaces that define how the application layer interacts with external services and repositories. This enables dependency inversion and testability.

## Ports

### ISubscriptionService
Port for subscription management service.

```typescript
interface ISubscriptionService {
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null>;
  activateSubscription(
    userId: string,
    productId: string,
    expiresAt: string | null
  ): Promise<SubscriptionStatus | null>;
  deactivateSubscription(userId: string): Promise<void>;
}
```

**Implementation:** Infrastructure services implement this interface.

### ISubscriptionRepository
Port for subscription data persistence.

```typescript
interface ISubscriptionRepository {
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null>;
  saveSubscriptionStatus(userId: string, status: SubscriptionStatus): Promise<void>;
  deleteSubscriptionStatus(userId: string): Promise<void>;
  isSubscriptionValid(status: SubscriptionStatus | null): boolean;
}
```

**Implementation:** Infrastructure repositories implement this interface.

### ICreditsRepository
Port for credits data persistence.

```typescript
interface ICreditsRepository {
  getCredits(userId: string): Promise<UserCredits | null>;
  initializeCredits(
    userId: string,
    purchaseId?: string,
    productId?: string
  ): Promise<CreditsResult>;
  deductCredit(userId: string, amount: number): Promise<CreditsResult>;
  addCredits(userId: string, amount: number): Promise<CreditsResult>;
}
```

## Usage in Application Layer

```typescript
import type { ISubscriptionService } from '../application/ports/ISubscriptionService';

class SubscriptionManager {
  constructor(private service: ISubscriptionService) {}

  async manageSubscription(userId: string) {
    // Port interface enables swapping implementations
    const status = await this.service.getSubscriptionStatus(userId);
    return status;
  }
}
```

## Testing with Mocks

```typescript
const mockService: ISubscriptionService = {
  getSubscriptionStatus: async (userId) => ({
    productId: 'premium',
    isActive: true,
    type: 'premium',
    expirationDate: null,
  }),
  activateSubscription: async () => ({} as any),
  deactivateSubscription: async () => {},
};

// Use mock in tests
const manager = new SubscriptionManager(mockService);
```

## Best Practices

1. **Interface Segregation** - Keep interfaces focused
2. **Clear Contracts** - Document behavior thoroughly
3. **Return Types** - Use domain entities in return types
4. **Async Operations** - All I/O operations should be async

## Related

- [Application README](../README.md)
- [Infrastructure Services](../../infrastructure/services/README.md)
- [Infrastructure Repositories](../../infrastructure/repositories/README.md)
