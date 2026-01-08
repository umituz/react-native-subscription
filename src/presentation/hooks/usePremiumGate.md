# usePremiumGate Hook

Feature gating hook for premium-only features with optional authentication.

## Import

```typescript
import { usePremiumGate } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function usePremiumGate(params: {
  isPremium: boolean;
  onPremiumRequired: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}): {
  isPremium: boolean;
  isAuthenticated: boolean;
  requirePremium: (action: () => void) => void;
  requireAuth: (action: () => void) => void;
  requirePremiumWithAuth: (action: () => void) => void;
  canAccess: boolean;
  canAccessWithAuth: boolean;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `isPremium` | `boolean` | **Required** | Whether user has premium access |
| `onPremiumRequired` | `() => void` | **Required** | Callback when premium is required |
| `isAuthenticated` | `boolean` | `true` | Whether user is authenticated |
| `onAuthRequired` | `() => void` | `undefined` | Callback when auth is required |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `isPremium` | `boolean` | User has premium access |
| `isAuthenticated` | `boolean` | User is authenticated |
| `requirePremium` | `(action) => void` | Gate action behind premium |
| `requireAuth` | `(action) => void` | Gate action behind auth |
| `requirePremiumWithAuth` | `(action) => void` | Gate behind both auth and premium |
| `canAccess` | `boolean` | Can access premium feature |
| `canAccessWithAuth` | `boolean` | Can access (auth + premium) |

## Basic Usage

```typescript
function PremiumFeature() {
  const { isPremium } = usePremium();

  const { requirePremium, canAccess } = usePremiumGate({
    isPremium,
    onPremiumRequired: () => {
      showPaywall();
    },
  });

  const handleGenerate = () => {
    requirePremium(() => {
      // This only runs if user is premium
      generatePremiumContent();
    });
  };

  return (
    <Button
      onPress={handleGenerate}
      disabled={!canAccess}
      title={canAccess ? 'Generate' : 'Upgrade to Premium'}
    />
  );
}
```

## Advanced Usage

### With Authentication Check

```typescript
function AuthenticatedPremiumFeature() {
  const { isPremium } = usePremium();
  const { user } = useAuth();

  const { requirePremiumWithAuth, canAccessWithAuth } = usePremiumGate({
    isPremium,
    onPremiumRequired: () => showPaywall(),
    isAuthenticated: !!user,
    onAuthRequired: () => showAuthModal(),
  });

  const handleAction = () => {
    requirePremiumWithAuth(() => {
      // Only runs if user is both authenticated AND premium
      executeAction();
    });
  };

  return (
    <Button
      onPress={handleAction}
      disabled={!canAccessWithAuth}
      title="Premium Action"
    />
  );
}
```

### With Separate Gates

```typescript
function MultiGateFeature() {
  const { isPremium } = usePremium();
  const { user } = useAuth();

  const {
    requirePremium,
    requireAuth,
    canAccess,
  } = usePremiumGate({
    isPremium,
    onPremiumRequired: () => showPaywall(),
    isAuthenticated: !!user,
    onAuthRequired: () => showAuthModal(),
  });

  return (
    <View>
      <Button
        onPress={() => requireAuth(() => saveToAccount())}
        title="Save to Account (Auth required)"
      />

      <Button
        onPress={() => requirePremium(() => usePremiumFeature())}
        title="Premium Feature (Premium required)"
      />
    </View>
  );
}
```

### With Progressive Access

```typescript
function ProgressiveAccess() {
  const { isPremium } = usePremium();
  const { user } = useAuth();

  const {
    isPremium: premium,
    isAuthenticated: auth,
    canAccess,
    canAccessWithAuth,
  } = usePremiumGate({
    isPremium,
    onPremiumRequired: () => showPaywall(),
    isAuthenticated: !!user,
    onAuthRequired: () => showAuthModal(),
  });

  const getAccessLevel = () => {
    if (!auth) return 'guest';
    if (!premium) return 'free';
    return 'premium';
  };

  const accessLevel = getAccessLevel();

  return (
    <View>
      <Badge text={accessLevel} />

      <FeatureList accessibleTo={['guest', 'free', 'premium']} />
      <FeatureList accessibleTo={['free', 'premium']} />
      <FeatureList accessibleTo={['premium']} />
    </View>
  );
}
```

### With Navigation Guard

```typescript
function PremiumScreen() {
  const { isPremium } = usePremium();
  const navigation = useNavigation();

  const { requirePremium } = usePremiumGate({
    isPremium,
    onPremiumRequired: () => {
      navigation.replace('Paywall', {
        returnTo: 'PremiumScreen',
      });
    },
  });

  useEffect(() => {
    // Redirect if not premium
    requirePremium(() => {});
  }, []);

  if (!isPremium) return null;

  return (
    <View>
      <Text>Premium Screen Content</Text>
    </View>
  );
}
```

## Examples

### Premium Button Component

```typescript
function PremiumButton({
  children,
  onAction,
  showUpgradeMessage = true,
}) {
  const { isPremium } = usePremium();

  const { requirePremium, canAccess } = usePremiumGate({
    isPremium,
    onPremiumRequired: () => {
      if (showUpgradeMessage) {
        Alert.alert(
          'Premium Feature',
          'This feature requires a Premium subscription',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => navigation.navigate('Paywall') },
          ]
        );
      }
    },
  });

  const handlePress = () => {
    requirePremium(() => {
      onAction?.();
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, !canAccess && styles.lockedButton]}
      disabled={!canAccess}
    >
      <PremiumIcon active={canAccess} />
      <Text style={styles.text}>{children}</Text>
      {!canAccess && <LockIcon />}
    </TouchableOpacity>
  );
}
```

### Batch Premium Operations

```typescript
function BatchPremiumOperations({ items }) {
  const { isPremium } = usePremium();

  const { requirePremium } = usePremiumGate({
    isPremium,
    onPremiumRequired: () => {
      showPaywall({
        feature: 'Batch Operations',
        highlight: `Process ${items.length} items at once`,
      });
    },
  });

  const handleBatchProcess = () => {
    requirePremium(async () => {
      for (const item of items) {
        await processItem(item);
        updateProgress();
      }
      Alert.alert('Complete', `Processed ${items.length} items`);
    });
  };

  return (
    <Button
      onPress={handleBatchProcess}
      title={`Process ${items.length} items`}
    />
  );
}
```

### Conditional Rendering

```typescript
function ConditionalPremiumFeature() {
  const { isPremium } = usePremium();

  const { canAccess } = usePremiumGate({
    isPremium,
    onPremiumRequired: () => showPaywall(),
  });

  if (!canAccess) {
    return (
      <View style={styles.lockedContainer}>
        <LockIcon size={48} />
        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.message}>
          Upgrade to access this feature
        </Text>
        <Button
          onPress={() => showPaywall()}
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

### With Analytics

```typescript
function TrackedPremiumFeature() {
  const { isPremium } = usePremium();

  const { requirePremium } = usePremiumGate({
    isPremium,
    onPremiumRequired: () => {
      analytics.track('premium_feature_accessed', {
        feature: 'advanced_analytics',
        success: false,
        reason: 'not_premium',
      });
      showPaywall();
    },
  });

  const handleFeature = () => {
    requirePremium(() => {
      analytics.track('premium_feature_used', {
        feature: 'advanced_analytics',
        success: true,
      });
      executeFeature();
    });
  };

  return <Button onPress={handleFeature} title="Use Premium Feature" />;
}
```

## Best Practices

1. **Clear messaging** - Tell users what they're missing
2. **Smooth upgrades** - Make subscription path obvious
3. **Respect auth** - Check authentication before premium
4. **Track events** - Monitor gate triggers
5. **Value first** - Show benefits before locking
6. **Graceful fallbacks** - Show limited version if appropriate
7. **Context-aware** - Customize paywall based on feature

## Use Case Patterns

### Premium Only (No Auth)

```typescript
const { requirePremium } = usePremiumGate({
  isPremium,
  onPremiumRequired: () => showPaywall(),
});
```

### Auth + Premium Required

```typescript
const { requirePremiumWithAuth } = usePremiumGate({
  isPremium,
  onPremiumRequired: () => showPaywall(),
  isAuthenticated: !!user,
  onAuthRequired: () => showAuthModal(),
});
```

### Separate Auth and Premium Gates

```typescript
const { requireAuth, requirePremium } = usePremiumGate({
  isPremium,
  onPremiumRequired: () => showPaywall(),
  isAuthenticated: !!user,
  onAuthRequired: () => showAuthModal(),
});
```

## Related Hooks

- **useAuthGate** - Authentication gating only
- **useSubscriptionGate** - Subscription gating
- **useFeatureGate** - Combined auth + subscription + credits
- **usePremium** - Premium status checking

## See Also

- [Premium Gating](../../../docs/PREMIUM_GATING.md)
- [Feature Access Patterns](../../../docs/ACCESS_PATTERNS.md)
- [Paywall Triggers](../screens/README.md#triggers)
