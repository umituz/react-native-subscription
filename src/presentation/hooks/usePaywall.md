# usePaywall Hook

Hook for controlling paywall visibility and state.

## Import

```typescript
import { usePaywall } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function usePaywall(): {
  showPaywall: (params?: PaywallTrigger) => void;
  hidePaywall: () => void;
  isPaywallVisible: boolean;
  paywallConfig: PaywallConfig | null;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `showPaywall` | `(params?: PaywallTrigger) => void` | Show paywall with optional context |
| `hidePaywall` | `() => void` | Hide paywall |
| `isPaywallVisible` | `boolean` | Whether paywall is currently visible |
| `paywallConfig` | `PaywallConfig \| null` | Current paywall configuration |

## Basic Usage

```typescript
function UpgradeButton() {
  const { showPaywall, hidePaywall, isPaywallVisible } = usePaywall();

  return (
    <>
      <Button
        onPress={() => showPaywall()}
        title="Upgrade to Premium"
      />

      <PaywallModal
        isVisible={isPaywallVisible}
        onClose={hidePaywall}
      />
    </>
  );
}
```

## Advanced Usage

### With Trigger Tracking

```typescript
function TrackedPaywall() {
  const { showPaywall, hidePaywall, isPaywallVisible } = usePaywall();

  const handleUpgradeClick = (source: string) => {
    showPaywall({
      trigger: 'upgrade_button',
      featureId: 'advanced_features',
      source,
      metadata: {
        screen: 'home',
        buttonLocation: 'header',
      },
    });

    // Analytics
    analytics.track('upgrade_button_clicked', { source });
  };

  const handleClose = () => {
    analytics.track('paywall_dismissed', {
      trigger: 'upgrade_button',
    });

    hidePaywall();
  };

  return (
    <>
      <Button onPress={() => handleUpgradeClick('header')} title="Upgrade" />

      <PaywallModal
        isVisible={isPaywallVisible}
        onClose={handleClose}
      />
    </>
  );
}
```

### With Dynamic Config

```typescript
function DynamicPaywall() {
  const { showPaywall, hidePaywall, isPaywallVisible, paywallConfig } =
    usePaywall();

  const customizePaywall = (tier: 'free' | 'premium') => {
    showPaywall({
      trigger: 'custom',
      config: {
        title: tier === 'free'
          ? 'Unlock Premium Features'
          : 'Upgrade Your Plan',
        features: tier === 'free'
          ? [
              { icon: '⭐', text: 'Unlimited Access' },
              { icon: '🚀', text: 'AI-Powered Tools' },
            ]
          : [
              { icon: '💎', text: 'Exclusive Features' },
              { icon: '👑', text: 'VIP Support' },
            ],
      },
    });
  };

  return (
    <View>
      <Button onPress={() => customizePaywall('free')} title="Show Free Paywall" />
      <Button onPress={() => customizePaywall('premium')} title="Show Premium Paywall" />

      <PaywallModal
        isVisible={isPaywallVisible}
        onClose={hidePaywall}
        config={paywallConfig || undefined}
      />
    </View>
  );
}
```

### With Context-Aware Display

```typescript
function ContextAwarePaywall() {
  const { showPaywall, hidePaywall, isPaywallVisible } = usePaywall();
  const { userTier } = useUserTier();
  const { usageCount } = useFeatureUsage();

  const shouldShowPaywall = useMemo(() => {
    // Show paywall after 5 free uses
    return userTier === 'free' && usageCount >= 5;
  }, [userTier, usageCount]);

  useEffect(() => {
    if (shouldShowPaywall && !isPaywallVisible) {
      showPaywall({
        trigger: 'usage_limit',
        featureId: 'advanced_filters',
        context: {
          usageCount,
          limit: 5,
        },
      });
    }
  }, [shouldShowPaywall]);

  return (
    <PaywallModal
      isVisible={isPaywallVisible}
      onClose={hidePaywall}
      config={{
        title: 'Free Limit Reached',
        description: `You've used this feature ${usageCount} times`,
        features: [
          { icon: '∞', text: 'Unlimited Access' },
          { icon: '⚡', text: 'Faster Processing' },
        ],
      }}
    />
  );
}
```

## PaywallTrigger Type

```typescript
interface PaywallTrigger {
  trigger: string;          // What triggered the paywall
  featureId?: string;        // Which feature triggered it
  source?: string;           // Where it was triggered from
  metadata?: Record<string, any>; // Additional context
  config?: PaywallConfig;    // Custom paywall config
}
```

## Examples

### Feature-Based Paywall

```typescript
function FeatureButton({ featureId, requiredTier }) {
  const { userTier } = useUserTier();
  const { showPaywall } = usePaywall();

  const handlePress = () => {
    if (userTier !== requiredTier) {
      showPaywall({
        trigger: 'feature_access_denied',
        featureId,
        requiredTier,
      });
      return;
    }

    executeFeature();
  };

  return <Button onPress={handlePress} title={featureId} />;
}
```

### Time-Based Paywall

```typescript
function TimedPaywall() {
  const { showPaywall, isPaywallVisible } = usePaywall();
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Show paywall after 30 seconds
    const paywallTimer = setTimeout(() => {
      showPaywall({
        trigger: 'time_based',
        context: { sessionTime },
      });
    }, 30000);

    return () => {
      clearInterval(timer);
      clearTimeout(paywallTimer);
    };
  }, []);

  return <PaywallModal isVisible={isPaywallVisible} onClose={() => {}} />;
}
```

### Event-Based Paywall

```typescript
function EventDrivenPaywall() {
  const { showPaywall, isPaywallVisible } = usePaywall();

  useEffect(() => {
    const subscription = eventBus.subscribe('premium_required', (event) => {
      showPaywall({
        trigger: 'premium_required',
        featureId: event.featureId,
        source: event.source,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return <PaywallModal isVisible={isPaywallVisible} onClose={() => {}} />;
}
```

## Integration with Analytics

```typescript
function AnalyticsIntegratedPaywall() {
  const { showPaywall, hidePaywall, isPaywallVisible } = usePaywall();
  const [paywallShownAt, setPaywallShownAt] = useState<number | null>(null);

  const handleShowPaywall = (trigger: PaywallTrigger) => {
    setPaywallShownAt(Date.now());

    // Track impression
    analytics.track('paywall_impression', {
      trigger: trigger.trigger,
      feature_id: trigger.featureId,
      source: trigger.source,
      timestamp: Date.now(),
    });

    showPaywall(trigger);
  };

  const handleClose = () => {
    if (paywallShownAt) {
      const duration = Date.now() - paywallShownAt;

      analytics.track('paywall_dismissed', {
        duration,
        trigger: 'upgrade_button',
      });
    }

    hidePaywall();
  };

  return (
    <>
      <Button onPress={() => handleShowPaywall({ trigger: 'manual' })} />
      <PaywallModal isVisible={isPaywallVisible} onClose={handleClose} />
    </>
  );
}
```

## Best Practices

1. **Track triggers** - Always log what triggered the paywall
2. **Include context** - Add relevant metadata
3. **Handle dismissal** - Track when and why users close
4. **A/B test** - Test different paywall configurations
5. **Respect users** - Don't show paywall too frequently
6. **Close on purchase** - Automatically hide on successful purchase

## Related Hooks

- **usePaywallActions** - For paywall purchase actions
- **usePaywallVisibility** - For conditional paywall display
- **usePaywallOperations** - For complete paywall operations

## See Also

- [usePaywallActions](./usePaywallActions.md)
- [usePaywallVisibility](./usePaywallVisibility.md)
- [Paywall Domain](../../../domains/paywall/README.md)
