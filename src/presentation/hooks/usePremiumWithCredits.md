# usePremiumWithCredits Hook

Combined hook for premium subscription with credits system integration.

## Import

```typescript
import { usePremiumWithCredits } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function usePremiumWithCredits(params: {
  userId: string | undefined;
  isPremium: boolean;
}): {
  credits: number;
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  ensureCreditsInitialized: () => Promise<void>;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | `string \| undefined` | **Required** | User ID |
| `isPremium` | `boolean` | **Required** | Whether user has premium subscription |

## Returns

Returns all properties from `useCredits` plus:

| Property | Type | Description |
|----------|------|-------------|
| `ensureCreditsInitialized` | `() => Promise<void>` | Ensure credits are initialized |

## Basic Usage

```typescript
function PremiumUserDashboard() {
  const { user } = useAuth();
  const { isPremium } = usePremium();

  const { credits, isLoading, ensureCreditsInitialized } = usePremiumWithCredits({
    userId: user?.uid,
    isPremium,
  });

  useEffect(() => {
    if (isPremium) {
      ensureCreditsInitialized();
    }
  }, [isPremium]);

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Credits: {credits}</Text>
      <Text>Status: {isPremium ? 'Premium' : 'Free'}</Text>
    </View>
  );
}
```

## Advanced Usage

### With Auto-Initialization

```typescript
function PremiumCreditsManager() {
  const { user } = useAuth();
  const { isPremium } = usePremium();

  const {
    credits,
    transactions,
    isLoading,
    ensureCreditsInitialized,
  } = usePremiumWithCredits({
    userId: user?.uid,
    isPremium,
  });

  // Hook automatically initializes credits when user becomes premium
  useEffect(() => {
    if (isPremium && !credits) {
      console.log('User is premium but has no credits, initializing...');
      ensureCreditsInitialized();
    }
  }, [isPremium, credits]);

  if (isLoading) return <LoadingScreen />;

  return (
    <View>
      <CreditBalance credits={credits} />
      <TransactionHistory transactions={transactions} />
    </View>
  );
}
```

### With Subscription Change Detection

```typescript
function SubscriptionWatcher() {
  const { user } = useAuth();
  const { isPremium } = usePremium();

  const { credits, ensureCreditsInitialized } = usePremiumWithCredits({
    userId: user?.uid,
    isPremium,
  });

  const previousPremium = useRef(isPremium);

  useEffect(() => {
    // User just subscribed
    if (isPremium && !previousPremium.current) {
      console.log('User subscribed to premium!');
      ensureCreditsInitialized();
    }

    previousPremium.current = isPremium;
  }, [isPremium]);

  return (
    <View>
      <Text>Status: {isPremium ? 'Premium' : 'Free'}</Text>
      <Text>Credits: {credits || 0}</Text>
    </View>
  );
}
```

### With Manual Initialization

```typescript
function ManualCreditInit() {
  const { user } = useAuth();
  const { isPremium } = usePremium();

  const { credits, isLoading, ensureCreditsInitialized } = usePremiumWithCredits({
    userId: user?.uid,
    isPremium,
  });

  const handleInitializeCredits = async () => {
    if (!isPremium) {
      Alert.alert('Premium Required', 'This feature requires a subscription');
      return;
    }

    if (credits) {
      Alert.alert('Already Initialized', 'Credits are already set up');
      return;
    }

    await ensureCreditsInitialized();
    Alert.alert('Success', 'Credits initialized successfully');
  };

  return (
    <View>
      <Text>Credits: {credits || 'Not initialized'}</Text>

      {!credits && isPremium && (
        <Button
          onPress={handleInitializeCredits}
          disabled={isLoading}
          title="Initialize Credits"
        />
      )}
    </View>
  );
}
```

### With Error Handling

```typescript
function RobustCreditManager() {
  const { user } = useAuth();
  const { isPremium } = usePremium();

  const {
    credits,
    error,
    isLoading,
    ensureCreditsInitialized,
  } = usePremiumWithCredits({
    userId: user?.uid,
    isPremium,
  });

  useEffect(() => {
    if (error) {
      console.error('Credits error:', error);
      Alert.alert('Error', 'Failed to load credits');
    }
  }, [error]);

  const handleRetry = async () => {
    try {
      await ensureCreditsInitialized();
    } catch (err) {
      Alert.alert('Error', 'Failed to initialize credits');
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View>
      <Text>Credits: {credits || 0}</Text>

      {error && (
        <Button onPress={handleRetry} title="Retry" />
      )}
    </View>
  );
}
```

## Examples

### Premium Onboarding Flow

```typescript
function PremiumOnboarding() {
  const { user } = useAuth();
  const { isPremium } = usePremium();

  const {
    credits,
    isLoading,
    ensureCreditsInitialized,
  } = usePremiumWithCredits({
    userId: user?.uid,
    isPremium,
  });

  useEffect(() => {
    // Auto-initialize credits for new premium users
    if (isPremium && !credits && !isLoading) {
      const initialize = async () => {
        await ensureCreditsInitialized();
        analytics.track('premium_credits_initialized', {
          userId: user?.uid,
        });
      };
      initialize();
    }
  }, [isPremium, credits, isLoading]);

  if (!isPremium) {
    return <PremiumUpgradePrompt />;
  }

  if (isLoading) {
    return <LoadingScreen message="Setting up your account..." />;
  }

  return (
    <View>
      <CongratulationsMessage />

      <CreditCard credits={credits} />

      <Button
        onPress={() => navigation.navigate('Home')}
        title="Get Started"
      />
    </View>
  );
}
```

### Premium Benefits Display

```typescript
function PremiumBenefits() {
  const { user } = useAuth();
  const { isPremium } = usePremium();

  const { credits, balance, transactions } = usePremiumWithCredits({
    userId: user?.uid,
    isPremium,
  });

  return (
    <ScrollView>
      <PremiumBadge />

      <View style={styles.section}>
        <Text style={styles.title}>Your Premium Benefits</Text>
        <BenefitItem icon="✓" text="Ad-free experience" />
        <BenefitItem icon="✓" text="Unlimited access" />
        <BenefitItem icon="✓" text={`${credits} monthly credits`} />
        <BenefitItem icon="✓" text="Priority support" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Credit Balance</Text>
        <Text style={styles.balance}>{credits} Credits</Text>
        <Text style={styles.value}>Worth ~${balance.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Recent Activity</Text>
        {transactions.slice(0, 5).map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </View>
    </ScrollView>
  );
}
```

### Subscription Status Monitor

```typescript
function SubscriptionMonitor() {
  const { user } = useAuth();
  const { isPremium } = usePremium();

  const {
    credits,
    isLoading,
    ensureCreditsInitialized,
  } = usePremiumWithCredits({
    userId: user?.uid,
    isPremium,
  });

  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const handleRefresh = async () => {
    await ensureCreditsInitialized();
    setLastChecked(new Date());
  };

  useEffect(() => {
    // Periodic refresh every 5 minutes
    const interval = setInterval(() => {
      if (isPremium) {
        handleRefresh();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isPremium]);

  return (
    <View>
      <Text>Subscription Status: {isPremium ? 'Active' : 'Inactive'}</Text>
      <Text>Credits: {credits || 0}</Text>
      {lastChecked && (
        <Text>Last checked: {lastChecked.toLocaleTimeString()}</Text>
      )}

      <Button
        onPress={handleRefresh}
        disabled={isLoading}
        title="Refresh Status"
      />
    </View>
  );
}
```

## How It Works

### Automatic Initialization

The hook automatically:

1. **Detects premium status** - Checks if user is premium
2. **Monitors credits** - Watches credits value
3. **Initializes when needed** - Calls init if premium but no credits
4. **Prevents duplicate inits** - Won't initialize if credits exist
5. **Handles loading** - Shows loading state during initialization

```typescript
// Premium user without credits
isPremium = true
credits = undefined
→ Auto-initializes credits ✅

// Premium user with credits
isPremium = true
credits = 100
→ No initialization needed ✅

// Free user
isPremium = false
credits = undefined
→ No initialization (not premium) ✅
```

## Best Practices

1. **Trust the hook** - Let it handle auto-initialization
2. **Monitor loading** - Show loading during initialization
3. **Handle errors** - Catch and display init failures
4. **Track events** - Log credit initialization
5. **Refresh periodically** - Keep credits up to date
6. **Check premium first** - Verify user is premium before showing features
7. **Test scenarios** - Test new subscription, existing subscription, cancellation

## Related Hooks

- **useCredits** - Credits management
- **useInitializeCredits** - Manual credit initialization
- **usePremium** - Premium status
- **useDeductCredit** - Credit deduction

## See Also

- [Credits System](../../../domains/wallet/README.md)
- [Premium Integration](../../../docs/PREMIUM_INTEGRATION.md)
- [Credits README](./useCredits.md)
