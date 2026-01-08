# useAuthSubscriptionSync Hook

Automatically synchronizes subscription state with authentication changes.

## Import

```typescript
import { useAuthSubscriptionSync } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useAuthSubscriptionSync(config: {
  onAuthStateChanged: (callback: (userId: string | null) => void) => () => void;
  initializeSubscription: (userId: string) => Promise<void>;
}): void
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `onAuthStateChanged` | `(callback) => () => void` | **Required** | Subscribe to auth changes, returns unsubscribe function |
| `initializeSubscription` | `(userId) => Promise<void>` | **Required** | Initialize subscription for user |

## Basic Usage

```typescript
function App() {
  useAuthSubscriptionSync({
    onAuthStateChanged: (callback) => {
      // Subscribe to Firebase auth changes
      const unsubscribe = auth.onAuthStateChanged((user) => {
        callback(user?.uid || null);
      });
      return unsubscribe;
    },
    initializeSubscription: async (userId) => {
      // Initialize RevenueCat or subscription service
      await Purchases.configure({ apiKey: 'your_key', appUserID: userId });
      await fetchSubscriptionStatus(userId);
    },
  });

  return <YourAppNavigation />;
}
```

## Advanced Usage

### With Firebase Auth

```typescript
function AppWithFirebase() {
  useAuthSubscriptionSync({
    onAuthStateChanged: (callback) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        callback(user?.uid || null);
      });
      return unsubscribe;
    },
    initializeSubscription: async (userId) => {
      if (!userId) return;

      // Configure RevenueCat with user ID
      await Purchases.logIn(userId);
      await syncSubscriptionWithBackend(userId);
    },
  });

  return <AppNavigator />;
}
```

### With Custom Auth Provider

```typescript
function AppWithCustomAuth() {
  const authManager = useAuthManager();

  useAuthSubscriptionSync({
    onAuthStateChanged: (callback) => {
      // Your custom auth system
      const unsubscribe = authManager.addListener((user) => {
        callback(user?.id || null);
      });
      return unsubscribe;
    },
    initializeSubscription: async (userId) => {
      // Initialize your subscription system
      await subscriptionService.initialize(userId);
      await loadSubscriptionData(userId);
    },
  });

  return <App />;
}
```

### With Multiple Subscription Services

```typescript
function AppWithMultipleServices() {
  useAuthSubscriptionSync({
    onAuthStateChanged: (callback) => {
      return auth.onAuthStateChanged((user) => {
        callback(user?.uid || null);
      });
    },
    initializeSubscription: async (userId) => {
      // Initialize RevenueCat
      await Purchases.logIn(userId);

      // Initialize custom credits system
      await creditsRepository.initialize(userId);

      // Sync with backend
      await subscriptionSyncService.sync(userId);
    },
  });

  return <App />;
}
```

### With Error Handling

```typescript
function AppWithErrorHandling() {
  const [syncError, setSyncError] = useState<Error | null>(null);

  useAuthSubscriptionSync({
    onAuthStateChanged: (callback) => {
      return auth.onAuthStateChanged((user) => {
        callback(user?.uid || null);
      });
    },
    initializeSubscription: async (userId) => {
      try {
        setSyncError(null);
        await Purchases.logIn(userId);
        await syncSubscriptionData(userId);
      } catch (error) {
        console.error('Subscription sync failed:', error);
        setSyncError(error as Error);
        // Optionally retry or show error to user
      }
    },
  });

  if (syncError) {
    return <ErrorScreen error={syncError} />;
  }

  return <AppNavigation />;
}
```

### With Loading State

```typescript
function AppWithLoadingState() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useAuthSubscriptionSync({
    onAuthStateChanged: (callback) => {
      return auth.onAuthStateChanged((user) => {
        callback(user?.uid || null);
      });
    },
    initializeSubscription: async (userId) => {
      if (!userId) {
        setIsInitialized(false);
        return;
      }

      setIsSyncing(true);
      try {
        await Purchases.logIn(userId);
        await loadUserSubscription(userId);
        setIsInitialized(true);
      } finally {
        setIsSyncing(false);
      }
    },
  });

  if (isSyncing) {
    return <LoadingScreen message="Syncing subscription..." />;
  }

  return <AppNavigation />;
}
```

## Examples

### Complete App Setup

```typescript
import React from 'react';
import { useAuthSubscriptionSync } from '@umituz/react-native-subscription';
import { auth } from './firebase/config';
import { Purchases } from 'react-native-purchases';
import { subscriptionService } from './services/subscription';

function App() {
  useAuthSubscriptionSync({
    onAuthStateChanged: (callback) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user?.uid || 'none');
        callback(user?.uid || null);
      });
      return unsubscribe;
    },
    initializeSubscription: async (userId) => {
      if (!userId) {
        console.log('No user, skipping subscription init');
        return;
      }

      console.log('Initializing subscription for:', userId);

      try {
        // Step 1: Identify user in RevenueCat
        await Purchases.logIn(userId);

        // Step 2: Fetch subscription status
        await subscriptionService.fetchStatus(userId);

        // Step 3: Sync with backend
        await subscriptionService.syncWithBackend(userId);

        console.log('Subscription initialized successfully');
      } catch (error) {
        console.error('Failed to initialize subscription:', error);
      }
    },
  });

  return <AppNavigator />;
}

export default App;
```

### With Analytics Tracking

```typescript
function AppWithAnalytics() {
  useAuthSubscriptionSync({
    onAuthStateChanged: (callback) => {
      return auth.onAuthStateChanged((user) => {
        const userId = user?.uid || null;
        analytics.identify(userId);
        callback(userId);
      });
    },
    initializeSubscription: async (userId) => {
      analytics.track('subscription_sync_start', { userId });

      await Purchases.logIn(userId);

      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = !!customerInfo.entitlements.active.premium;

      analytics.track('subscription_sync_complete', {
        userId,
        isPremium,
      });
    },
  });

  return <App />;
}
```

### With User Switching

```typescript
function AppWithUserSwitching() {
  useAuthSubscriptionSync({
    onAuthStateChanged: (callback) => {
      return auth.onAuthStateChanged((user) => {
        const newUserId = user?.uid || null;
        console.log('User changed:', newUserId);
        callback(newUserId);
      });
    },
    initializeSubscription: async (userId) => {
      if (!userId) {
        // User signed out - clear subscription data
        subscriptionService.clear();
        return;
      }

      // New user signed in or account switch
      // The hook handles detecting userId changes
      await Purchases.logIn(userId);
      await subscriptionService.loadForUser(userId);
    },
  });

  return <App />;
}
```

## How It Works

### Automatic Initialization

The hook automatically:

1. **Listens to auth changes** - Subscribes to your auth provider
2. **Detects user changes** - Identifies when user ID changes
3. **Initializes once** - Only initializes once per user session
4. **Re-initializes on user switch** - Detects account switching
5. **Cleans up** - Unsubscribes when component unmounts

### User Change Detection

```typescript
// Initial mount with user A
auth.onAuthStateChanged => callback('user-a-id')
initializeSubscription('user-a-id') // ✅ Runs

// Same user, no change
auth.onAuthStateChanged => callback('user-a-id')
initializeSubscription('user-a-id') // ❌ Skipped (same user)

// User switches to user B
auth.onAuthStateChanged => callback('user-b-id')
initializeSubscription('user-b-id') // ✅ Runs (user changed)

// User signs out
auth.onAuthStateChanged => callback(null)
// ❌ No initialization (no user)
```

## Best Practices

1. **Configure at app root** - Place in root App component
2. **Handle errors gracefully** - Catch and log initialization errors
3. **Show loading state** - Display loading during sync
4. **Test user switching** - Verify account switching works
5. **Cleanup properly** - Let hook handle unsubscribe
6. **One-time setup** - Configure once, don't reinitialize
7. **Monitor logs** - Use dev logs to verify behavior

## Common Patterns

### Firebase + RevenueCat

```typescript
useAuthSubscriptionSync({
  onAuthStateChanged: (callback) => auth.onAuthStateChanged((user) => callback(user?.uid || null)),
  initializeSubscription: (userId) => Purchases.logIn(userId),
});
```

### Custom Auth + Backend

```typescript
useAuthSubscriptionSync({
  onAuthStateChanged: (callback) => customAuth.onAuthChange((user) => callback(user?.id || null)),
  initializeSubscription: (userId) => backend.syncSubscription(userId),
});
```

### Multi-Service Setup

```typescript
useAuthSubscriptionSync({
  onAuthStateChanged: (callback) => auth.onAuthStateChanged((user) => callback(user?.uid)),
  initializeSubscription: async (userId) => {
    await Promise.all([
      Purchases.logIn(userId),
      creditsService.init(userId),
      subscriptionBackend.sync(userId),
    ]);
  },
});
```

## Related Hooks

- **useAuth** - For authentication state
- **usePremium** - For subscription status
- **useAuthAwarePurchase** - For auth-gated purchases
- **useUserTier** - For tier determination

## See Also

- [Auth Integration Guide](../../../docs/AUTH_INTEGRATION.md)
- [RevenueCat Setup](../../../docs/REVENUECAT_SETUP.md)
- [Subscription State Management](../providers/README.md)
