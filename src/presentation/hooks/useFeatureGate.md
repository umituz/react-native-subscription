# useFeatureGate Hook

Unified feature gate combining authentication, subscription, and credits checks.

## Import

```typescript
import { useFeatureGate } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useFeatureGate(params: {
  isAuthenticated: boolean;
  onShowAuthModal: (pendingCallback: () => void | Promise<void>) => void;
  hasSubscription?: boolean;
  hasCredits: boolean;
  creditBalance: number;
  requiredCredits?: number;
  onShowPaywall: (requiredCredits?: number) => void;
}): {
  requireFeature: (action: () => void | Promise<void>) => void;
  isAuthenticated: boolean;
  hasSubscription: boolean;
  hasCredits: boolean;
  creditBalance: number;
  canAccess: boolean;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `isAuthenticated` | `boolean` | **Required** | Whether user is authenticated |
| `onShowAuthModal` | `(callback) => void` | **Required** | Show auth modal with pending action |
| `hasSubscription` | `boolean` | `false` | Whether user has subscription |
| `hasCredits` | `boolean` | **Required** | Whether user has enough credits |
| `creditBalance` | `number` | **Required** | Current credit balance |
| `requiredCredits` | `number` | `undefined` | Credits required for action |
| `onShowPaywall` | `(credits?) => void` | **Required** | Show paywall/upgrade prompt |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `requireFeature` | `(action) => void` | Gate action behind auth, subscription, and credits |
| `isAuthenticated` | `boolean` | User is authenticated |
| `hasSubscription` | `boolean` | User has subscription |
| `hasCredits` | `boolean` | User has enough credits |
| `creditBalance` | `number` | Current credit balance |
| `canAccess` | `boolean` | User can access the feature |

## Basic Usage

```typescript
function PremiumFeature() {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { credits } = useCredits();

  const { requireFeature, canAccess } = useFeatureGate({
    isAuthenticated: !!user,
    onShowAuthModal: (pendingAction) => {
      navigation.navigate('Auth', { pendingAction });
    },
    hasSubscription: isPremium,
    hasCredits: credits >= 5,
    creditBalance: credits,
    requiredCredits: 5,
    onShowPaywall: (required) => {
      if (isPremium) {
        showInsufficientCreditsModal(required);
      } else {
        showPaywall();
      }
    },
  });

  const handleGenerate = () => {
    requireFeature(async () => {
      await generateContent();
    });
  };

  return (
    <Button
      onPress={handleGenerate}
      title={!canAccess ? 'Unlock Feature' : 'Generate'}
    />
  );
}
```

## Advanced Usage

### Progressive Access Control

```typescript
function ProgressiveFeatureGate() {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { credits } = useCredits();

  const { requireFeature, canAccess, isAuthenticated, hasSubscription, hasCredits } =
    useFeatureGate({
      isAuthenticated: !!user,
      onShowAuthModal: (pending) => showAuthModal({ pendingAction: pending }),
      hasSubscription: isPremium,
      hasCredits: credits >= 3,
      creditBalance: credits,
      requiredCredits: 3,
      onShowPaywall: (required) => showUpgradeModal({ requiredCredits: required }),
    });

  const getAccessMessage = () => {
    if (!isAuthenticated) return 'Sign in to access';
    if (!hasSubscription && !hasCredits) return 'Upgrade or purchase credits';
    if (!hasCredits) return 'Insufficient credits';
    return 'Full access';
  };

  return (
    <View>
      <Text>{getAccessMessage()}</Text>
      <Button
        onPress={() => requireFeature(() => executeAction())}
        disabled={!canAccess}
        title={canAccess ? 'Execute Action' : 'Unlock'}
      />
    </View>
  );
}
```

## Best Practices

1. **Check in order** - Auth → Subscription → Credits
2. **Clear messaging** - Tell users exactly what's required
3. **Preserve intent** - Queue pending actions through auth/purchase
4. **Smart prompts** - Show relevant upgrade option
5. **Track events** - Monitor gate triggers for optimization
6. **Respect premium** - Bypass credits for subscribers
7. **Show alternatives** - Offer both subscription and credits options

## Related Hooks

- **useAuthGate** - Auth gating only
- **useSubscriptionGate** - Subscription gating only
- **useCreditsGate** - Credits gating only
- **usePremiumGate** - Premium feature gating

## See Also

- [Feature Gating](../../../docs/FEATURE_GATING.md)
- [Access Control Patterns](../../../docs/ACCESS_PATTERNS.md)
