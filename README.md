# @umituz/react-native-subscription

Subscription management system for React Native apps - Database-first approach with secure validation.

Built with **SOLID**, **DRY**, and **KISS** principles.

## Installation

```bash
npm install @umituz/react-native-subscription
```

## Peer Dependencies

- `react` >= 18.2.0
- `react-native` >= 0.74.0

## Features

- ✅ Domain-Driven Design (DDD) architecture
- ✅ SOLID principles (Single Responsibility, Open/Closed, etc.)
- ✅ DRY (Don't Repeat Yourself)
- ✅ KISS (Keep It Simple, Stupid)
- ✅ **Security**: Database-first approach - Always validate server-side
- ✅ Type-safe operations
- ✅ React hooks for easy integration
- ✅ Works with any database (Firebase, Supabase, etc.)

## Important: Database-First Approach

**This package follows a database-first approach:**

- Subscription status is ALWAYS checked from your database
- This ensures 10-50x faster subscription checks
- Works offline (database cache)
- More reliable than SDK-dependent checks
- **SECURITY**: Server-side validation always enforced

## Usage

### 1. Implement Repository Interface

First, implement the `ISubscriptionRepository` interface with your database:

```typescript
import type { ISubscriptionRepository } from '@umituz/react-native-subscription';
import type { SubscriptionStatus } from '@umituz/react-native-subscription';

class MySubscriptionRepository implements ISubscriptionRepository {
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    // Fetch from your database (Firebase, Supabase, etc.)
    const doc = await db.collection('users').doc(userId).get();
    return doc.data()?.subscription || null;
  }

  async updateSubscriptionStatus(
    userId: string,
    status: Partial<SubscriptionStatus>,
  ): Promise<SubscriptionStatus> {
    // Update in your database
    await db.collection('users').doc(userId).update({
      subscription: status,
      updatedAt: new Date(),
    });
    return await this.getSubscriptionStatus(userId) || createDefaultSubscriptionStatus();
  }

  isSubscriptionValid(status: SubscriptionStatus): boolean {
    if (!status.isPremium) return false;
    if (!status.expiresAt) return true; // Lifetime subscription
    return new Date(status.expiresAt) > new Date();
  }
}
```

### 2. Initialize Subscription Service

Initialize the service early in your app (e.g., in `App.tsx`):

```typescript
import { initializeSubscriptionService } from '@umituz/react-native-subscription';
import { MySubscriptionRepository } from './repositories/MySubscriptionRepository';

// Initialize Subscription service
initializeSubscriptionService({
  repository: new MySubscriptionRepository(),
  onStatusChanged: async (userId, status) => {
    // Optional: Sync to analytics, send notifications, etc.
    await analytics.logEvent('subscription_changed', {
      userId,
      isPremium: status.isPremium,
    });
  },
  onError: async (error, context) => {
    // Optional: Log errors to crash reporting
    await crashlytics.logError(error, context);
  },
});
```

### 3. Use Subscription Hook in Components

```typescript
import { useSubscription } from '@umituz/react-native-subscription';
import { useAuth } from '@umituz/react-native-auth';

function PremiumFeature() {
  const { user } = useAuth();
  const { status, isPremium, loading, loadStatus } = useSubscription();

  useEffect(() => {
    if (user?.uid) {
      loadStatus(user.uid);
    }
  }, [user?.uid, loadStatus]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isPremium) {
    return <UpgradePrompt />;
  }

  return <PremiumContent />;
}
```

### 4. Activate/Deactivate Subscription

```typescript
import { getSubscriptionService } from '@umituz/react-native-subscription';

const service = getSubscriptionService();

// Activate subscription (e.g., after purchase)
await service.activateSubscription(
  userId,
  'premium_monthly',
  '2024-12-31T23:59:59Z', // or null for lifetime
);

// Deactivate subscription
await service.deactivateSubscription(userId);
```

## API

### Functions

- `initializeSubscriptionService(config)`: Initialize Subscription service with configuration
- `getSubscriptionService()`: Get Subscription service instance (throws if not initialized)
- `resetSubscriptionService()`: Reset service instance (useful for testing)

### Hook

- `useSubscription()`: React hook for subscription operations

### Types

- `SubscriptionStatus`: Subscription status entity
- `SubscriptionConfig`: Configuration interface
- `ISubscriptionRepository`: Repository interface (must be implemented)
- `UseSubscriptionResult`: Hook return type

### Errors

- `SubscriptionError`: Base error class
- `SubscriptionRepositoryError`: Repository errors
- `SubscriptionValidationError`: Validation errors
- `SubscriptionConfigurationError`: Configuration errors

## Security Best Practices

1. **Database-First**: Always check subscription status from your database, not SDK
2. **Server-Side Validation**: Always validate subscription expiration server-side
3. **Error Handling**: Always handle errors gracefully
4. **Repository Pattern**: Implement repository interface with your database
5. **Callbacks**: Use callbacks to sync subscription changes to analytics/notifications

## Integration with RevenueCat

This package works seamlessly with `@umituz/react-native-revenuecat`:

```typescript
import { initializeRevenueCatService } from '@umituz/react-native-revenuecat';
import { getSubscriptionService } from '@umituz/react-native-subscription';

initializeRevenueCatService({
  onPremiumStatusChanged: async (userId, isPremium, productId, expiresAt) => {
    const subscriptionService = getSubscriptionService();
    if (subscriptionService) {
      if (isPremium && productId) {
        await subscriptionService.activateSubscription(userId, productId, expiresAt || null);
      } else {
        await subscriptionService.deactivateSubscription(userId);
      }
    }
  },
});
```

## License

MIT











