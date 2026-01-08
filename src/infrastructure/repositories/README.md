# Infrastructure Repositories

Repository implementations for data persistence.

## Purpose

Repositories handle data access and persistence, abstracting away the details of storage mechanisms.

## Available Repositories

### CreditsRepository

Manages credits data in Firestore.

```typescript
import {
  configureCreditsRepository,
  getCreditsRepository,
  type CreditsRepository,
} from '@umituz/react-native-subscription/infrastructure';

// Configure
configureCreditsRepository({
  firebase: { firestore: db },
  config: creditsConfig,
});

// Get instance
const repository = getCreditsRepository();

// Use
const credits = await repository.getCredits('user-123');
```

### TransactionRepository

Manages transaction history.

```typescript
import {
  createTransactionRepository,
  type TransactionRepository,
} from '@umituz/react-native-subscription/wallet';

const repository = createTransactionRepository({
  firebase: { firestore: db },
  userId: 'user-123',
});

const transactions = await repository.getTransactions({ limit: 20 });
```

## Custom Repositories

### Creating a Custom Repository

```typescript
import type { ISubscriptionRepository } from '@umituz/react-native-subscription/application';

class HttpSubscriptionRepository implements ISubscriptionRepository {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    const response = await fetch(`${this.baseUrl}/subscriptions/${userId}`);

    if (!response.ok) {
      throw new SubscriptionRepositoryError('Failed to fetch subscription');
    }

    return await response.json();
  }

  async saveSubscriptionStatus(
    userId: string,
    status: SubscriptionStatus
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/subscriptions/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status),
    });

    if (!response.ok) {
      throw new SubscriptionRepositoryError('Failed to save subscription');
    }
  }

  async deleteSubscriptionStatus(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/subscriptions/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new SubscriptionRepositoryError('Failed to delete subscription');
    }
  }

  isSubscriptionValid(status: SubscriptionStatus): boolean {
    return status.isActive && !isExpired(status.expirationDate);
  }
}
```

### In-Memory Repository (for testing)

```typescript
class InMemorySubscriptionRepository implements ISubscriptionRepository {
  private storage = new Map<string, SubscriptionStatus>();

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    return this.storage.get(userId) || null;
  }

  async saveSubscriptionStatus(
    userId: string,
    status: SubscriptionStatus
  ): Promise<void> {
    this.storage.set(userId, status);
  }

  async deleteSubscriptionStatus(userId: string): Promise<void> {
    this.storage.delete(userId);
  }

  isSubscriptionValid(status: SubscriptionStatus): boolean {
    return status.isActive && !isExpired(status.expirationDate);
  }

  // Test helpers
  __reset() {
    this.storage.clear();
  }
}
```

### Redis Repository

```typescript
import Redis from 'ioredis';

class RedisCreditsRepository {
  private redis: Redis;
  private prefix = 'credits:';

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async getCredits(userId: string): Promise<UserCredits> {
    const key = `${this.prefix}${userId}`;
    const data = await this.redis.get(key);

    if (!data) {
      return {
        balance: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    return JSON.parse(data);
  }

  async setCredits(userId: string, credits: UserCredits): Promise<void> {
    const key = `${this.prefix}${userId}`;
    await this.redis.set(key, JSON.stringify(credits));
  }

  async addCredits(
    userId: string,
    amount: number
  ): Promise<UserCredits> {
    const current = await this.getCredits(userId);
    const updated = {
      ...current,
      balance: current.balance + amount,
      lastUpdated: new Date().toISOString(),
    };

    await this.setCredits(userId, updated);
    return updated;
  }
}
```

## Repository Patterns

### 1. Active Record Pattern

```typescript
class Subscription {
  constructor(private data: SubscriptionData) {}

  async save(): Promise<void> {
    await db.collection('subscriptions').doc(this.data.id).set(this.data);
  }

  async delete(): Promise<void> {
    await db.collection('subscriptions').doc(this.data.id).delete();
  }

  static async find(id: string): Promise<Subscription | null> {
    const doc = await db.collection('subscriptions').doc(id).get();
    if (!doc.exists) return null;
    return new Subscription(doc.data());
  }
}
```

### 2. Data Mapper Pattern

```typescript
class SubscriptionMapper {
  toEntity(doc: FirebaseFirestore.DocumentSnapshot): Subscription {
    const data = doc.data();
    return Subscription.create({
      id: doc.id,
      ...data,
    });
  }

  toData(entity: Subscription): Record<string, any> {
    return {
      type: entity.type,
      isActive: entity.isActive,
      isPremium: entity.isPremium,
      expirationDate: entity.expirationDate,
      willRenew: entity.willRenew,
    };
  }
}
```

### 3. Repository with Caching

```typescript
class CachedSubscriptionRepository {
  private cache = new Map<string, { data: SubscriptionStatus; expiry: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  constructor(private repository: ISubscriptionRepository) {}

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    // Check cache
    const cached = this.cache.get(userId);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    // Fetch from source
    const status = await this.repository.getSubscriptionStatus(userId);

    // Update cache
    if (status) {
      this.cache.set(userId, {
        data: status,
        expiry: Date.now() + this.ttl,
      });
    }

    return status;
  }

  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}
```

## Transaction Support

### Firestore Transactions

```typescript
class TransactionalCreditsRepository {
  async transferCredits(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<void> {
    await db.runTransaction(async (transaction) => {
      const fromRef = db.collection('credits').doc(fromUserId);
      const toRef = db.collection('credits').doc(toUserId);

      const fromDoc = await transaction.get(fromRef);
      const toDoc = await transaction.get(toRef);

      const fromBalance = fromDoc.data()?.balance || 0;
      const toBalance = toDoc.data()?.balance || 0;

      if (fromBalance < amount) {
        throw new InsufficientCreditsError('Insufficient credits');
      }

      transaction.update(fromRef, { balance: fromBalance - amount });
      transaction.update(toRef, { balance: toBalance + amount });
    });
  }
}
```

## Real-Time Updates

### Firestore Realtime Listener

```typescript
class RealtimeSubscriptionRepository {
  subscribeToStatus(
    userId: string,
    callback: (status: SubscriptionStatus) => void
  ): () => void {
    const unsubscribe = db
      .collection('subscriptions')
      .doc(userId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          callback(doc.data() as SubscriptionStatus);
        }
      });

    return unsubscribe;
  }
}
```

## Testing Repositories

### Mock Repository Factory

```typescript
function createMockRepository(options?: {
  initialData?: Map<string, SubscriptionStatus>;
  latency?: number;
}): ISubscriptionRepository {
  const data = options?.initialData || new Map();
  const latency = options?.latency || 0;

  return {
    async getSubscriptionStatus(userId: string) {
      if (latency > 0) {
        await sleep(latency);
      }
      return data.get(userId) || null;
    },

    async saveSubscriptionStatus(userId: string, status: SubscriptionStatus) {
      if (latency > 0) {
        await sleep(latency);
      }
      data.set(userId, status);
    },

    async deleteSubscriptionStatus(userId: string) {
      data.delete(userId);
    },

    isSubscriptionValid(status: SubscriptionStatus) {
      return status.isActive && !isExpired(status.expirationDate);
    },
  };
}
```

## Best Practices

1. **Interface Segregation** - Keep interfaces focused
2. **Error Handling** - Transform storage errors to domain errors
3. **Logging** - Log repository operations
4. **Validation** - Validate data before saving
5. **Performance** - Use caching and batching
6. **Testing** - Mock repositories for unit tests
7. **Transactions** - Use transactions for multi-document updates

## Related

- [Infrastructure Layer](../../README.md)
- [Infrastructure Services](../services/README.md)
- [Application Ports](../../application/ports/README.md)
