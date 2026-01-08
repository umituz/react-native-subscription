# useSubscription Hook

Core hook for subscription status management and operations.

## Import

```typescript
import { useSubscription } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useSubscription(): {
  status: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  isPremium: boolean;
  loadStatus: (userId: string) => Promise<void>;
  refreshStatus: (userId: string) => Promise<void>;
  activateSubscription: (
    userId: string,
    productId: string,
    expiresAt: string | null,
  ) => Promise<void>;
  deactivateSubscription: (userId: string) => Promise<void>;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `status` | `SubscriptionStatus \| null` | Current subscription status object |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message if any |
| `isPremium` | `boolean` | Whether user has active subscription |
| `loadStatus` | `(userId) => Promise<void>` | Load subscription status |
| `refreshStatus` | `(userId) => Promise<void>` | Refresh subscription status |
| `activateSubscription` | `(userId, productId, expiresAt) => Promise<void>` | Activate subscription |
| `deactivateSubscription` | `(userId) => Promise<void>` | Deactivate subscription |

## Basic Usage

```typescript
function SubscriptionStatus() {
  const { user } = useAuth();
  const { status, isPremium, loading, loadStatus } = useSubscription();

  useEffect(() => {
    if (user?.uid) {
      loadStatus(user.uid);
    }
  }, [user]);

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Status: {isPremium ? 'Premium' : 'Free'}</Text>
      {status && (
        <Text>Product: {status.productId}</Text>
      )}
    </View>
  );
}
```

## Advanced Usage

### With Auto-Refresh

```typescript
function SubscriptionWithRefresh() {
  const { user } = useAuth();
  const { status, isPremium, loading, refreshStatus } = useSubscription();

  useEffect(() => {
    if (user?.uid) {
      refreshStatus(user.uid);
    }
  }, [user]);

  // Refresh when app comes to foreground
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        refreshStatus(user.uid);
      }
    }, [user])
  );

  // Refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.uid) {
        refreshStatus(user.uid);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  if (loading) return <LoadingScreen />;

  return (
    <View>
      <Text>{isPremium ? 'Premium' : 'Free'} User</Text>
    </View>
  );
}
```

### With Manual Activation

```typescript
function SubscriptionManager() {
  const { user } = useAuth();
  const {
    status,
    activateSubscription,
    deactivateSubscription,
    loading,
  } = useSubscription();

  const handleActivate = async () => {
    if (!user?.uid) return;

    try {
      await activateSubscription(
        user.uid,
        'premium_monthly',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      );
      Alert.alert('Success', 'Subscription activated');
    } catch (error) {
      Alert.alert('Error', 'Failed to activate subscription');
    }
  };

  const handleDeactivate = async () => {
    if (!user?.uid) return;

    try {
      await deactivateSubscription(user.uid);
      Alert.alert('Success', 'Subscription deactivated');
    } catch (error) {
      Alert.alert('Error', 'Failed to deactivate subscription');
    }
  };

  return (
    <View>
      <Text>Status: {status?.type || 'None'}</Text>

      <Button
        onPress={handleActivate}
        disabled={loading}
        title="Activate Subscription"
      />

      <Button
        onPress={handleDeactivate}
        disabled={loading || !status}
        title="Deactivate Subscription"
      />
    </View>
  );
}
```

### With Error Handling

```typescript
function RobustSubscription() {
  const { user } = useAuth();
  const { status, error, loading, loadStatus } = useSubscription();

  useEffect(() => {
    if (user?.uid) {
      loadStatus(user.uid).catch((err) => {
        console.error('Failed to load subscription:', err);
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Subscription Error',
        error,
        [{ text: 'Retry', onPress: () => user && loadStatus(user.uid) }]
      );
    }
  }, [error]);

  if (loading) return <LoadingScreen />;

  return (
    <View>
      {error ? (
        <ErrorBanner message={error} />
      ) : (
        <SubscriptionDisplay status={status} />
      )}
    </View>
  );
}
```

### With Status Polling

```typescript
function PollingSubscription() {
  const { user } = useAuth();
  const { status, refreshStatus, loading } = useSubscription();

  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    // Initial load
    refreshStatus(user.uid);

    // Poll for status updates
    const interval = setInterval(async () => {
      if (!isPolling) {
        setIsPolling(true);
        try {
          await refreshStatus(user.uid);
        } finally {
          setIsPolling(false);
        }
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  return (
    <View>
      <Text>Status: {status?.type || 'Loading...'}</Text>
      {loading && <ActivityIndicator size="small" />}
    </View>
  );
}
```

## Examples

### Complete Subscription Dashboard

```typescript
function SubscriptionDashboard() {
  const { user } = useAuth();
  const {
    status,
    isPremium,
    loading,
    error,
    refreshStatus,
  } = useSubscription();

  useEffect(() => {
    if (user?.uid) {
      refreshStatus(user.uid);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        refreshStatus(user.uid);
      }
    }, [user])
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView>
      {error && <ErrorBanner message={error} />}

      <SubscriptionCard
        status={status}
        isPremium={isPremium}
      />

      {status && (
        <>
          <DetailRow
            label="Product ID"
            value={status.productId}
          />
          <DetailRow
            label="Status"
            value={status.isActive ? 'Active' : 'Inactive'}
          />
          {status.expirationDate && (
            <DetailRow
              label="Expires"
              value={new Date(status.expirationDate).toLocaleDateString()}
            />
          )}
        </>
      )}

      <Button
        onPress={() => user && refreshStatus(user.uid)}
        title="Refresh Status"
      />
    </ScrollView>
  );
}
```

### Subscription State Machine

```typescript
function SubscriptionStateMachine() {
  const { user } = useAuth();
  const { status, loading, isPremium } = useSubscription();

  useEffect(() => {
    if (user?.uid) {
      loadStatus(user.uid);
    }
  }, [user]);

  const getState = () => {
    if (loading) return 'loading';
    if (!status) return 'none';
    if (!status.isActive) return 'expired';
    if (isPremium) return 'active';
    return 'inactive';
  };

  const state = getState();

  switch (state) {
    case 'loading':
      return <LoadingScreen />;
    case 'none':
      return <EmptyState message="No subscription found" />;
    case 'expired':
      return <ExpiredState onRenew={() => navigation.navigate('Paywall')} />;
    case 'active':
      return <PremiumContent />;
    default:
      return <FreeContent />;
  }
}
```

### With Analytics Tracking

```typescript
function TrackedSubscription() {
  const { user } = useAuth();
  const { status, isPremium, loading, loadStatus } = useSubscription();

  const previousStatus = useRef(status);

  useEffect(() => {
    if (user?.uid) {
      loadStatus(user.uid);
    }
  }, [user]);

  useEffect(() => {
    // Track subscription status changes
    if (previousStatus.current?.isActive !== status?.isActive) {
      analytics.track('subscription_status_changed', {
        from: previousStatus.current?.isActive,
        to: status?.isActive,
        userId: user?.uid,
      });
    }

    if (previousStatus.current?.type !== status?.type) {
      analytics.track('subscription_type_changed', {
        from: previousStatus.current?.type,
        to: status?.type,
        userId: user?.uid,
      });
    }

    previousStatus.current = status;
  }, [status]);

  if (loading) return <LoadingScreen />;

  return (
    <View>
      <Text>Status: {isPremium ? 'Premium' : 'Free'}</Text>
    </View>
  );
}
```

## Best Practices

1. **Validate user ID** - Always check userId before operations
2. **Handle loading** - Show loading states appropriately
3. **Handle errors** - Display user-friendly error messages
4. **Refresh on focus** - Update when screen regains focus
5. **Auto-load** - Load status when user changes
6. **Track changes** - Monitor status transitions
7. **Cache wisely** - Don't over-refresh

## Common Patterns

### Basic Load

```typescript
const { status, loadStatus } = useSubscription();
useEffect(() => {
  if (user?.uid) loadStatus(user.uid);
}, [user]);
```

### With Refresh

```typescript
const { status, refreshStatus } = useSubscription();
const handleRefresh = () => user && refreshStatus(user.uid);
```

### Manual Activation

```typescript
const { activateSubscription } = useSubscription();
await activateSubscription(userId, productId, expiresAt);
```

## Related Hooks

- **usePremium** - Simplified premium checking
- **useSubscriptionStatus** - Detailed subscription status
- **useSubscriptionDetails** - Package and pricing info
- **useUserTier** - Tier information

## See Also

- [Subscription Entity](../../domain/entities/SubscriptionStatus.md)
- [Subscription Service](../../infrastructure/services/SubscriptionService.md)
- [Status Utilities](../../utils/subscriptionUtils.md)
