# usePremium Hook

Hook for checking and managing premium subscription status.

## Import

```typescript
import { usePremium } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function usePremium(): {
  isPremium: boolean;
  isLoading: boolean;
  error: Error | null;
  subscription: SubscriptionStatus | null;
  refetch: () => Promise<void>;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `isPremium` | `boolean` | Whether user has active premium subscription |
| `isLoading` | `boolean` | Whether hook is loading data |
| `error` | `Error \| null` | Error if fetching failed |
| `subscription` | `SubscriptionStatus \| null` | Full subscription status object |
| `refetch` | `() => Promise<void>` | Function to manually refetch data |

## Basic Usage

```typescript
function MyComponent() {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>
        {isPremium ? 'Premium User' : 'Free User'}
      </Text>
    </View>
  );
}
```

## Advanced Usage

### With Error Handling

```typescript
function PremiumContent() {
  const { isPremium, isLoading, error } = usePremium();

  useEffect(() => {
    if (error) {
      console.error('Failed to load premium status:', error);
      analytics.track('premium_check_failed', {
        error: error.message,
      });
    }
  }, [error]);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;

  return <PremiumFeatures />;
}
```

### With Refetch

```typescript
function SettingsScreen() {
  const { isPremium, refetch, isLoading } = usePremium();

  const handleRefresh = async () => {
    await refetch();
    Alert.alert('Success', 'Status refreshed');
  };

  return (
    <View>
      <Text>Status: {isPremium ? 'Premium' : 'Free'}</Text>

      <Button
        onPress={handleRefresh}
        disabled={isLoading}
        title="Refresh Status"
      />
    </View>
  );
}
```

### With Full Subscription Details

```typescript
function SubscriptionInfo() {
  const { isPremium, subscription } = usePremium();

  if (!subscription) return null;

  return (
    <View>
      <Text>Type: {subscription.type}</Text>
      <Text>Active: {subscription.isActive ? 'Yes' : 'No'}</Text>

      {subscription.expirationDate && (
        <Text>
          Expires: {new Date(subscription.expirationDate).toLocaleDateString()}
        </Text>
      )}

      {subscription.willRenew && (
        <Text>Auto-renew: On</Text>
      )}
    </View>
  );
}
```

## Examples

### Conditional Rendering

```typescript
function FeatureList() {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) return <LoadingSpinner />;

  return (
    <View>
      <Feature name="Basic Feature" available={true} />
      <Feature name="Premium Feature 1" available={isPremium} />
      <Feature name="Premium Feature 2" available={isPremium} />
      <Feature name="Premium Feature 3" available={isPremium} />
    </View>
  );
}
```

### Premium Badge

```typescript
function PremiumBadge() {
  const { isPremium } = usePremium();

  return (
    <View style={[
      styles.badge,
      isPremium && styles.badgePremium,
    ]}>
      <Text style={styles.badgeText}>
        {isPremium ? '⭐ PREMIUM' : 'FREE'}
      </Text>
    </View>
  );
}
```

### Premium Gate

```typescript
function PremiumOnlyComponent() {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!isPremium) {
    return (
      <View>
        <Text>This feature requires Premium</Text>
        <Button
          onPress={() => navigation.navigate('Paywall')}
          title="Upgrade to Premium"
        />
      </View>
    );
  }

  return <PremiumContent />;
}
```

## Behavior

### Loading States

The hook goes through these states:

1. **Initial**: `isLoading = true`, `isPremium = false`
2. **Loading**: Fetches subscription status
3. **Loaded**: `isLoading = false`, `isPremium` set to actual value
4. **Error**: `isLoading = false`, `error` set

### Automatic Updates

The hook automatically updates when:
- User logs in/logs out
- Subscription status changes
- App comes to foreground

### Caching

The hook caches subscription status for:
- Default: 5 minutes
- Configurable via `staleTime` option

## Related Hooks

- **usePremiumGate** - For gating premium features
- **useSubscription** - For more subscription details
- **useSubscriptionStatus** - For detailed status info
- **usePremiumWithCredits** - For premium OR credits features

## See Also

- [usePremiumGate](./usePremiumGate.md)
- [useSubscription](./useSubscription.md)
- [usePremiumWithCredits](./usePremiumWithCredits.md)
