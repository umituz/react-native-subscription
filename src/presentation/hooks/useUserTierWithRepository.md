# useUserTierWithRepository Hook

Automatically fetches premium status and provides tier information with repository integration.

## Import

```typescript
import { useUserTierWithRepository } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useUserTierWithRepository(params: {
  auth: AuthProvider;
  repository: ISubscriptionRepository;
}): {
  tier: 'guest' | 'freemium' | 'premium';
  isPremium: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `auth` | `AuthProvider` | **Required** | Auth provider with user state |
| `repository` | `ISubscriptionRepository` | **Required** | Subscription repository |

## AuthProvider Interface

```typescript
interface AuthProvider {
  user: { uid: string } | null;
  isGuest: boolean;
  isAuthenticated: boolean;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `tier` | `'guest' \| 'freemium' \| 'premium'` | User tier |
| `isPremium` | `boolean` | User has premium access |
| `isGuest` | `boolean` | User is not authenticated |
| `isAuthenticated` | `boolean` | User is authenticated |
| `userId` | `string \| null` | User ID |
| `isLoading` | `boolean` | Premium status is loading |
| `error` | `string \| null` | Error message |
| `refresh` | `() => Promise<void>` | Manually refresh premium status |

## Basic Usage

```typescript
function UserTierDisplay() {
  const auth = useAuth(); // Your auth hook
  const subscriptionRepository = useSubscriptionRepository();

  const {
    tier,
    isPremium,
    isLoading,
  } = useUserTierWithRepository({
    auth,
    repository: subscriptionRepository,
  });

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Tier: {tier.toUpperCase()}</Text>
      <Text>Status: {isPremium ? 'Premium' : 'Free'}</Text>
    </View>
  );
}
```

## Advanced Usage

### With Custom Auth Provider

```typescript
function WithCustomAuth() {
  const authManager = useCustomAuthManager();

  const authProvider = {
    user: authManager.user ? { uid: authManager.user.id } : null,
    isGuest: !authManager.user,
    isAuthenticated: !!authManager.user,
  };

  const { tier, isPremium } = useUserTierWithRepository({
    auth: authProvider,
    repository: subscriptionRepository,
  });

  return (
    <View>
      <Badge text={tier} />
      {isPremium && <PremiumBadge />}
    </View>
  );
}
```

### With Firebase Auth

```typescript
function WithFirebaseAuth() {
  const { user } = useFirebaseAuth();

  const authProvider = useMemo(() => ({
    user: user ? { uid: user.uid } : null,
    isGuest: !user,
    isAuthenticated: !!user,
  }), [user]);

  const { tier, isPremium, isLoading } = useUserTierWithRepository({
    auth: authProvider,
    repository: subscriptionRepository,
  });

  if (isLoading) return <LoadingScreen />;

  return <TierBadge tier={tier} />;
}
```

### With Error Handling

```typescript
function TierWithErrorHandling() {
  const auth = useAuth();

  const {
    tier,
    error,
    isLoading,
    refresh,
  } = useUserTierWithRepository({
    auth,
    repository: subscriptionRepository,
  });

  useEffect(() => {
    if (error) {
      console.error('Failed to fetch tier:', error);
      // Optionally show error to user
    }
  }, [error]);

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <View>
        <Text>Failed to load subscription status</Text>
        <Button onPress={refresh} title="Retry" />
      </View>
    );
  }

  return <TierDisplay tier={tier} />;
}
```

### With Manual Refresh

```typescript
function TierWithRefresh() {
  const auth = useAuth();

  const {
    tier,
    isLoading,
    refresh,
  } = useUserTierWithRepository({
    auth,
    repository: subscriptionRepository,
  });

  const handleRefresh = async () => {
    await refresh();
    Alert.alert('Success', 'Subscription status refreshed');
  };

  return (
    <View>
      <Text>Tier: {tier}</Text>

      <Button
        onPress={handleRefresh}
        disabled={isLoading}
        title="Refresh Status"
      />
    </View>
  );
}
```

### With Loading State

```typescript
function TierWithLoading() {
  const auth = useAuth();

  const {
    tier,
    isPremium,
    isLoading,
  } = useUserTierWithRepository({
    auth,
    repository: subscriptionRepository,
  });

  return (
    <View>
      <Text>Tier: {tier}</Text>
      <Text>Premium: {isPremium ? 'Yes' : 'No'}</Text>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <Text>Checking subscription...</Text>
        </View>
      )}
    </View>
  );
}
```

## Examples

### Complete User Profile

```typescript
function UserProfile() {
  const auth = useAuth();

  const {
    tier,
    isPremium,
    userId,
    isLoading,
    error,
  } = useUserTierWithRepository({
    auth,
    repository: subscriptionRepository,
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView>
      <UserHeader userId={userId} />

      <View style={styles.section}>
        <Text style={styles.label}>Account Status</Text>
        <TierBadge tier={tier} />
      </View>

      {isPremium && (
        <View style={styles.section}>
          <Text style={styles.label}>Premium Benefits</Text>
          <BenefitList />
        </View>
      )}

      {!isPremium && tier !== 'guest' && (
        <View style={styles.section}>
          <Button
            onPress={() => navigation.navigate('Paywall')}
            title="Upgrade to Premium"
          />
        </View>
      )}

      {error && (
        <ErrorBanner
          message="Failed to load subscription status"
          onRetry={() => refresh()}
        />
      )}
    </ScrollView>
  );
}
```

### Navigation Guard

```typescript
function ProtectedScreen() {
  const auth = useAuth();
  const navigation = useNavigation();

  const {
    tier,
    isLoading,
  } = useUserTierWithRepository({
    auth,
    repository: subscriptionRepository,
  });

  useEffect(() => {
    if (!isLoading && tier !== 'premium') {
      navigation.replace('Paywall', {
        returnTo: 'ProtectedScreen',
      });
    }
  }, [tier, isLoading]);

  if (isLoading) return <LoadingScreen />;
  if (tier !== 'premium') return null;

  return <ProtectedContent />;
}
```

### Conditional Features

```typescript
function TierBasedFeatures() {
  const auth = useAuth();

  const { tier } = useUserTierWithRepository({
    auth,
    repository: subscriptionRepository,
  });

  return (
    <View>
      {/* Available to everyone */}
      <BasicFeature />

      {/* Available to freemium and premium */}
      {(tier === 'freemium' || tier === 'premium') && (
        <AuthenticatedFeature />
      )}

      {/* Premium only */}
      {tier === 'premium' && (
        <PremiumFeature />
      )}
    </View>
  );
}
```

### With Analytics

```typescript
function TierTracker() {
  const auth = useAuth();

  const { tier } = useUserTierWithRepository({
    auth,
    repository: subscriptionRepository,
  });

  const previousTier = useRef(tier);

  useEffect(() => {
    if (previousTier.current !== tier) {
      analytics.track('tier_changed', {
        from: previousTier.current,
        to: tier,
        timestamp: Date.now(),
      });
      previousTier.current = tier;
    }
  }, [tier]);

  return <YourComponent />;
}
```

## How It Works

### Automatic Fetching

```typescript
// Mount with authenticated user
auth.user = { uid: 'user-123' }
auth.isAuthenticated = true
→ Fetch premium status from repository ✅

// Status returned
tier = 'premium'
isPremium = true
isLoading = false ✅

// User logs out
auth.user = null
auth.isAuthenticated = false
→ No fetch (guest users can't be premium) ✅
tier = 'guest'
isPremium = false ✅
```

### Guest Users

```typescript
auth.user = null
auth.isGuest = true
auth.isAuthenticated = false

// Hook doesn't fetch for guests
tier = 'guest'
isPremium = false
isLoading = false (no fetch needed) ✅
```

### Abort Handling

The hook uses AbortController for race condition prevention:

```typescript
// User changes quickly: A → B → A
// Only the last user's status is set
// Intermediate fetches are aborted ✅
```

## Best Practices

1. **Provide valid auth** - Ensure auth provider has correct state
2. **Handle loading** - Show loading during initial fetch
3. **Handle errors** - Display error messages and retry option
4. **Use refresh** - Call refresh when needed (e.g., after purchase)
5. **Check tier** - Use tier for feature gating
6. **Test transitions** - Verify guest → freemium → premium flows
7. **Cache appropriately** - Repository should handle caching

## Related Hooks

- **useUserTier** - Tier logic without repository
- **usePremium** - Premium status checking
- **useAuthGate** - Authentication gating
- **useSubscription** - Subscription details

## See Also

- [User Tier Guide](../../../docs/USER_TIER.md)
- [Repository Pattern](../../infrastructure/repositories/README.md)
- [Tier Utilities](../../utils/tierUtils.md)
