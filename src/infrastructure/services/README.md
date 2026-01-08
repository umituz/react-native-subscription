# Infrastructure Services

Service implementations in the infrastructure layer.

## Services

### SubscriptionService

Main service for subscription management.

```typescript
import { SubscriptionService } from '@umituz/react-native-subscription/infrastructure';

const service = new SubscriptionService({
  repository: myRepository,
  onStatusChanged: (userId, status) => {
    console.log(`Status changed for ${userId}`);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});
```

### SubscriptionInitializer

Initializes the subscription system on app startup.

```typescript
import { initializeSubscription } from '@umituz/react-native-subscription/infrastructure';

await initializeSubscription({
  revenueCatApiKey: 'your_key',
  revenueCatEntitlementId: 'premium',
  creditPackages: [...],
});
```

## Features

### 1. Automatic Status Sync

```typescript
const service = new SubscriptionService({
  repository: myRepository,
  onStatusChanged: (userId, newStatus) => {
    // React to status changes
    analytics.track('subscription_changed', {
      userId,
      status: newStatus.type,
    });
  },
});
```

### 2. Error Handling

```typescript
const service = new SubscriptionService({
  repository: myRepository,
  onError: (error) => {
    if (error instanceof SubscriptionValidationError) {
      // Log validation errors
      logger.warn('Validation error:', error.message);
    } else {
      // Log critical errors
      logger.error('Service error:', error);
      crashlytics().recordError(error);
    }
  },
});
```

### 3. Caching

```typescript
const service = new SubscriptionService({
  repository: myRepository,
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
  },
});
```

## Custom Services

### Creating a Custom Service

```typescript
import type { ISubscriptionService } from '@umituz/react-native-subscription/application';

export class CustomSubscriptionService implements ISubscriptionService {
  constructor(
    private repository: ISubscriptionRepository,
    private apiClient: ApiClient
  ) {}

  async getStatus(userId: string): Promise<SubscriptionStatus | null> {
    // Try cache first
    const cached = await this.cache.get(userId);
    if (cached) return cached;

    // Fetch from repository
    const status = await this.repository.getSubscriptionStatus(userId);

    // Update cache
    if (status) {
      await this.cache.set(userId, status, { ttl: 300000 });
    }

    return status;
  }

  async activateSubscription(
    userId: string,
    productId: string,
    expiresAt: string | null
  ): Promise<SubscriptionStatus> {
    // Business logic
    const current = await this.getStatus(userId);
    if (current?.isActive) {
      throw new SubscriptionOperationError(
        'User already has an active subscription'
      );
    }

    // Activate
    const status = await this.repository.saveSubscriptionStatus(userId, {
      type: 'premium',
      isActive: true,
      isPremium: true,
      expirationDate: expiresAt,
      willRenew: expiresAt !== null,
      productId,
    });

    return status;
  }

  async deactivateSubscription(userId: string): Promise<SubscriptionStatus> {
    const status = await this.getStatus(userId);
    if (!status?.isActive) {
      throw new SubscriptionOperationError('Subscription is not active');
    }

    const deactivated = {
      ...status,
      isActive: false,
      willRenew: false,
    };

    await this.repository.saveSubscriptionStatus(userId, deactivated);
    return deactivated;
  }

  async isPremium(userId: string): Promise<boolean> {
    const status = await this.getStatus(userId);
    return status?.isPremium ?? false;
  }
}
```

## Advanced Features

### Retry Logic

```typescript
class SubscriptionServiceWithRetry {
  async getStatus(userId: string): Promise<SubscriptionStatus | null> {
    return this.retryOperation(
      () => this.repository.getSubscriptionStatus(userId),
      {
        maxRetries: 3,
        delay: 1000,
        backoff: 'exponential',
      }
    );
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    let lastError;

    for (let attempt = 0; attempt < options.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < options.maxRetries - 1) {
          const delay = options.backoff === 'exponential'
            ? Math.pow(2, attempt) * options.delay
            : options.delay;

          await sleep(delay);
        }
      }
    }

    throw lastError;
  }
}
```

### Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= 5) {
      this.state = 'open';
    }
  }

  private shouldAttemptReset(): boolean {
    return (
      this.lastFailureTime !== null &&
      Date.now() - this.lastFailureTime > 60000 // 1 minute
    );
  }
}
```

### Observability

```typescript
class ObservableSubscriptionService {
  private eventEmitter = new EventEmitter();

  async getStatus(userId: string): Promise<SubscriptionStatus | null> {
    const startTime = Date.now();

    try {
      const status = await this.repository.getSubscriptionStatus(userId);

      this.eventEmitter.emit('operation_success', {
        operation: 'getStatus',
        userId,
        duration: Date.now() - startTime,
      });

      return status;
    } catch (error) {
      this.eventEmitter.emit('operation_error', {
        operation: 'getStatus',
        userId,
        error: error.message,
        duration: Date.now() - startTime,
      });

      throw error;
    }
  }

  on(event: string, listener: (data: any) => void) {
    this.eventEmitter.on(event, listener);
  }

  off(event: string, listener: (data: any) => void) {
    this.eventEmitter.off(event, listener);
  }
}
```

## Testing

### Unit Tests

```typescript
describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let mockRepository: jest.Mocked<ISubscriptionRepository>;

  beforeEach(() => {
    mockRepository = {
      getSubscriptionStatus: jest.fn(),
      saveSubscriptionStatus: jest.fn(),
      deleteSubscriptionStatus: jest.fn(),
      isSubscriptionValid: jest.fn(),
    };

    service = new SubscriptionService({
      repository: mockRepository,
    });
  });

  it('should get subscription status', async () => {
    const expectedStatus = { type: 'premium', isActive: true };
    mockRepository.getSubscriptionStatus.mockResolvedValue(expectedStatus);

    const status = await service.getStatus('user-123');

    expect(status).toEqual(expectedStatus);
    expect(mockRepository.getSubscriptionStatus).toHaveBeenCalledWith('user-123');
  });
});
```

### Integration Tests

```typescript
describe('SubscriptionService Integration', () => {
  let service: SubscriptionService;
  let repository: FirebaseSubscriptionRepository;

  beforeAll(async () => {
    // Use test Firebase instance
    const testDb = await initializeTestFirebase();
    repository = new FirebaseSubscriptionRepository(testDb);
    service = new SubscriptionService({ repository });
  });

  it('should activate subscription', async () => {
    const status = await service.activateSubscription(
      'user-123',
      'premium_monthly',
      '2025-12-31'
    );

    expect(status.type).toBe('premium');
    expect(status.isActive).toBe(true);
  });
});
```

## Best Practices

1. **Dependency Injection** - Accept dependencies via constructor
2. **Error Handling** - Handle and transform errors appropriately
3. **Logging** - Log important operations
4. **Caching** - Cache frequently accessed data
5. **Validation** - Validate inputs
6. **Type Safety** - Use TypeScript types
7. **Testing** - Write comprehensive tests

## Related

- [Application Layer](../../application/README.md)
- [Application Ports](../../application/ports/README.md)
- [Infrastructure Layer](../../README.md)
