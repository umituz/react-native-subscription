# useSubscriptionGate Hook

Subscription-only feature gating with simple, focused API.

## Import

```typescript
import { useSubscriptionGate } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useSubscriptionGate(params: {
  hasSubscription: boolean;
  onSubscriptionRequired: () => void;
}): {
  hasSubscription: boolean;
  requireSubscription: (action: () => void | Promise<void>) => boolean;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hasSubscription` | `boolean` | **Required** | Whether user has active subscription |
| `onSubscriptionRequired` | `() => void` | **Required** | Callback when subscription is required |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `hasSubscription` | `boolean` | User has active subscription |
| `requireSubscription` | `(action) => boolean` | Gate action behind subscription |

## Basic Usage

```typescript
function PremiumFeature() {
  const { isPremium } = usePremium();

  const { requireSubscription, hasSubscription } = useSubscriptionGate({
    hasSubscription: isPremium,
    onSubscriptionRequired: () => {
      showPaywall();
    },
  });

  const handlePremiumAction = () => {
    const allowed = requireSubscription(() => {
      executePremiumFeature();
    });

    if (!allowed) {
      console.log('User was shown paywall');
    }
  };

  return (
    <Button
      onPress={handlePremiumAction}
      title={hasSubscription ? 'Access' : 'Upgrade to Premium'}
    />
  );
}
```

## Advanced Usage

### With Conditional Rendering

```typescript
function ConditionalPremiumFeature() {
  const { isPremium } = usePremium();

  const { requireSubscription, hasSubscription } = useSubscriptionGate({
    hasSubscription: isPremium,
    onSubscriptionRequired: () => {
      navigation.navigate('Paywall');
    },
  });

  if (!hasSubscription) {
    return (
      <View>
        <PremiumLockedIcon />
        <Text>This feature requires Premium</Text>
        <Button
          onPress={() => requireSubscription(() => {})}
          title="Upgrade Now"
        />
      </View>
    );
  }

  return (
    <View>
      <Text>Premium Content</Text>
      <PremiumFeatureComponent />
    </View>
  );
}
```

### With Async Actions

```typescript
function AsyncPremiumFeature() {
  const { isPremium } = usePremium();

  const { requireSubscription } = useSubscriptionGate({
    hasSubscription: isPremium,
    onSubscriptionRequired: () => {
      showPaywall({
        feature: 'Advanced Analytics',
        onSubscribe: () => {
          // Action will execute after subscription
        },
      });
    },
  });

  const handleExportData = () => {
    requireSubscription(async () => {
      await exportLargeDataset();
      Alert.alert('Success', 'Data exported successfully');
    });
  };

  return <Button onPress={handleExportData} title="Export Data" />;
}
```

## Best Practices

1. **Simple checks** - Keep gating logic straightforward
2. **Clear messaging** - Tell users what they're missing
3. **Smooth upgrades** - Make subscription path obvious
4. **Track access** - Monitor gate triggers for optimization
5. **Value first** - Show benefits before locking
6. **Graceful fallbacks** - Show preview or limited version
7. **Context-aware** - Customize paywall based on feature

## Development Logging

In development mode, the hook logs useful information:

```typescript
// User not premium
[useSubscriptionGate] No subscription, showing paywall

// User has subscription
[useSubscriptionGate] Has subscription, proceeding
```

## Related Hooks

- **useAuthGate** - Add authentication requirements
- **useCreditsGate** - Credits-based gating
- **useFeatureGate** - Combined auth + subscription + credits
- **usePremiumGate** - Premium feature gating with auth option

## See Also

- [Subscription Gating](../../../docs/SUBSCRIPTION_GATING.md)
- [Paywall Triggers](../screens/README.md#triggers)
- [usePremium](./usePremium.md)
