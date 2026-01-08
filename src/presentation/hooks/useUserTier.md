# useUserTier Hook

Hook for determining and tracking user tier (guest, free, premium).

## Import

```typescript
import { useUserTier } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useUserTier(): {
  tier: UserTier;
  isGuest: boolean;
  isFree: boolean;
  isPremium: boolean;
  canUpgrade: boolean;
  isLoading: boolean;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `tier` | `'guest' \| 'free' \| 'premium'` | Current user tier |
| `isGuest` | `boolean` | User is not authenticated |
| `isFree` | `boolean` | User is authenticated but free |
| `isPremium` | `boolean` | User has premium subscription |
| `canUpgrade` | `boolean` | User can upgrade to premium |
| `isLoading` | `boolean` | Loading state |

## User Tiers

### Guest
- User is not authenticated
- No access to personalized features
- Limited functionality

### Free
- User is authenticated
- Has basic access
- Can upgrade to premium

### Premium
- User has active subscription
- Full access to all features
- Priority support

## Basic Usage

```typescript
function UserDisplay() {
  const { tier, isGuest, isFree, isPremium } = useUserTier();

  return (
    <View>
      <Badge>{tier.toUpperCase()}</Badge>

      {isGuest && <Text>Please sign in to save your progress</Text>}
      {isFree && <Text>Upgrade to Premium for full access</Text>}
      {isPremium && <Text>Welcome, Premium member!</Text>}
    </View>
  );
}
```

## Advanced Usage

### Tier-Based UI

```typescript
function TierBasedFeatures() {
  const { tier } = useUserTier();

  return (
    <View>
      {/* Available to everyone */}
      <BasicFeature />

      {/* Free and Premium only */}
      {(tier === 'free' || tier === 'premium') && (
        <FreeFeature />
      )}

      {/* Premium only */}
      {tier === 'premium' && (
        <PremiumFeature />
      )}
    </View>
  );
}
```

### With Navigation Guard

```typescript
function ProtectedScreen() {
  const { tier, isLoading } = useUserTier();

  useEffect(() => {
    if (!isLoading && tier !== 'premium') {
      navigation.replace('Paywall');
    }
  }, [tier, isLoading]);

  if (isLoading) return <LoadingScreen />;

  return tier === 'premium' ? <PremiumContent /> : null;
}
```

### With Progress Tracking

```typescript
function TierProgress() {
  const { tier, canUpgrade } = useUserTier();

  const tiers = ['guest', 'free', 'premium'];
  const currentIndex = tiers.indexOf(tier);

  return (
    <View>
      <Text>Current Tier: {tier}</Text>

      <View style={styles.progress}>
        {tiers.map((t, index) => (
          <View
            key={t}
            style={[
              styles.step,
              index <= currentIndex && styles.activeStep,
            ]}
          >
            <Text>{t}</Text>
          </View>
        ))}
      </View>

      {canUpgrade && (
        <Button
          onPress={() => navigation.navigate('Upgrade')}
          title="Upgrade to Premium"
        />
      )}
    </View>
  );
}
```

## Examples

### Tier-Based Pricing

```typescript
function PricingCards() {
  const { tier } = useUserTier();

  return (
    <ScrollView horizontal>
      <PricingCard
        tier="free"
        price="$0"
        features={['Basic Access', 'Limited Storage']}
        isCurrent={tier === 'free'}
      />

      <PricingCard
        tier="premium"
        price="$9.99/mo"
        features={[
          'Full Access',
          'Unlimited Storage',
          'Priority Support',
          'Ad-Free',
        ]}
        isCurrent={tier === 'premium'}
        popular
      />
    </ScrollView>
  );
}
```

### Tier Indicator

```typescript
function TierIndicator() {
  const { tier, isPremium } = useUserTier();

  return (
    <View style={[
      styles.container,
      isPremium && styles.premiumContainer,
    ]}>
      {isPremium ? (
        <>
          <Icon name="crown" size={20} color="#FFD700" />
          <Text style={styles.text}>PREMIUM</Text>
        </>
      ) : (
        <Text style={styles.text}>FREE</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  premiumContainer: {
    backgroundColor: '#FFD700',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});
```

### Conditional Features

```typescript
function FeatureList() {
  const { isGuest, isFree, isPremium } = useUserTier();

  const features = [
    { name: 'Basic Search', available: true },
    { name: 'Save Favorites', available: !isGuest },
    { name: 'Advanced Filters', available: isFree || isPremium },
    { name: 'AI Recommendations', available: isPremium },
    { name: 'Priority Support', available: isPremium },
  ];

  return (
    <View>
      {features.map((feature) => (
        <FeatureItem
          key={feature.name}
          {...feature}
          locked={!feature.available}
        />
      ))}
    </View>
  );
}
```

### Tier Transition Tracking

```typescript
function TierTransitionTracker() {
  const { tier } = useUserTier();
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

## Integration with Auth

```typescript
function TierWithAuth() {
  const { user } = useAuth();
  const { tier } = useUserTier();

  // Tier updates automatically when auth state changes
  useEffect(() => {
    if (user) {
      console.log(`Logged in as ${tier}`);
    } else {
      console.log('Logged out, now guest');
    }
  }, [user, tier]);

  return (
    <View>
      <Text>Current tier: {tier}</Text>
      <Text>User: {user?.email || 'Not logged in'}</Text>
    </View>
  );
}
```

## Testing

```typescript
describe('useUserTier', () => {
  it('should return guest for unauthenticated user', () => {
    const { result } = renderHook(() => useUserTier(), {
      wrapper: ({ children }) => (
        <AuthProvider value={{ user: null }}>{children}</AuthProvider>
      ),
    });

    expect(result.current.tier).toBe('guest');
    expect(result.current.isGuest).toBe(true);
  });

  it('should return premium for subscribed user', () => {
    const { result } = renderHook(() => useUserTier(), {
      wrapper: ({ children }) => (
        <AuthProvider
          value={{
            user: { uid: '123' },
            subscription: { type: 'premium', isActive: true },
          }}
        >
          {children}
        </AuthProvider>
      ),
    });

    expect(result.current.tier).toBe('premium');
    expect(result.current.isPremium).toBe(true);
  });
});
```

## Best Practices

1. **Handle all tiers** - Don't forget guest users
2. **Show upgrade prompts** - Guide free users to premium
3. **Track transitions** - Monitor tier changes
4. **Provide value** - Show benefits of upgrading
5. **Respect users** - Don't be too aggressive with upselling
6. **Test all tiers** - Ensure features work for each tier

## Related Hooks

- **useAuth** - Authentication state
- **usePremium** - Premium subscription check
- **useSubscription** - Subscription details
- **useAuthGate** - Auth + subscription gate

## See Also

- [User Tier Utils](../../../utils/README.md#user-tier-utilities)
- [Tier README](../../utils/README.md)
