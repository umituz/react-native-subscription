# useSubscriptionStatus Hook

Hook for accessing detailed subscription status information.

## Import

```typescript
import { useSubscriptionStatus } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useSubscriptionStatus(): {
  status: SubscriptionStatus | null;
  tier: UserTier;
  isActive: boolean;
  isExpired: boolean;
  willRenew: boolean;
  expirationDate: Date | null;
  daysUntilExpiration: number | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `status` | `SubscriptionStatus \| null` | Full status object |
| `tier` | `UserTier` | User tier (guest/free/premium) |
| `isActive` | `boolean` | Subscription is currently active |
| `isExpired` | `boolean` | Subscription has expired |
| `willRenew` | `boolean` | Subscription will auto-renew |
| `expirationDate` | `Date \| null` | When subscription expires |
| `daysUntilExpiration` | `number \| null` | Days until expiration |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error if any |

## Basic Usage

```typescript
function SubscriptionStatusDisplay() {
  const {
    status,
    tier,
    isActive,
    expirationDate,
    daysUntilExpiration,
    isLoading,
  } = useSubscriptionStatus();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Tier: {tier}</Text>
      <Text>Status: {isActive ? 'Active' : 'Inactive'}</Text>

      {expirationDate && (
        <Text>
          Expires: {expirationDate.toLocaleDateString()}
          ({daysUntilExpiration} days)
        </Text>
      )}
    </View>
  );
}
```

## Advanced Usage

### With Expiration Warning

```typescript
function ExpirationWarning() {
  const { daysUntilExpiration, willRenew } = useSubscriptionStatus();

  if (willRenew) {
    return <Text>Auto-renewal is on</Text>;
  }

  if (daysUntilExpiration === null) {
    return null;
  }

  if (daysUntilExpiration <= 3) {
    return (
      <WarningCard
        type={daysUntilExpiration <= 1 ? 'critical' : 'warning'}
        message={`Your subscription expires in ${daysUntilExpiration} day${daysUntilExpiration > 1 ? 's' : ''}`}
      />
    );
  }

  if (daysUntilExpiration <= 7) {
    return <InfoCard message={`Subscription expires in ${daysUntilExpiration} days`} />;
  }

  return null;
}
```

### With Status Badge

```typescript
function StatusBadge() {
  const { isActive, isExpired } = useSubscriptionStatus();

  const getStatusConfig = () => {
    if (isExpired) {
      return { color: 'red', icon: '⚠️', text: 'Expired' };
    }
    if (isActive) {
      return { color: 'green', icon: '✅', text: 'Active' };
    }
    return { color: 'gray', icon: '⏸️', text: 'Inactive' };
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.color }]}>
      <Text>{config.icon}</Text>
      <Text>{config.text}</Text>
    </View>
  );
}
```

### With Auto-Refresh

```typescript
function AutoRefreshStatus() {
  const { status, refetch, isLoading } = useSubscriptionStatus();

  // Refetch every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Refetch when app comes to foreground
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <View>
      <Text>Status: {status?.type}</Text>
      <Button
        onPress={refetch}
        disabled={isLoading}
        title="Refresh"
      />
    </View>
  );
}
```

### With Detailed Info Card

```typescript
function DetailedSubscriptionCard() {
  const {
    status,
    tier,
    isActive,
    willRenew,
    expirationDate,
    daysUntilExpiration,
  } = useSubscriptionStatus();

  if (!status) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Badge tier={tier} />
        <Badge
          variant={isActive ? 'success' : 'default'}
          text={isActive ? 'Active' : 'Inactive'}
        />
      </View>

      <Divider />

      <View style={styles.section}>
        <DetailRow
          label="Plan"
          value={status.productId?.replace('_', ' ').toUpperCase()}
        />
        <DetailRow
          label="Auto-renew"
          value={willRenew ? 'Enabled' : 'Disabled'}
        />
      </View>

      {expirationDate && (
        <>
          <Divider />
          <View style={styles.section}>
            <DetailRow
              label="Expires"
              value={expirationDate.toLocaleDateString()}
            />
            {daysUntilExpiration !== null && (
              <DetailRow
                label="Days remaining"
                value={daysUntilExpiration.toString()}
              />
            )}
          </View>
        </>
      )}

      {daysUntilExpiration !== null &&
        daysUntilExpiration <= 7 && (
        <Alert
          severity={daysUntilExpiration <= 3 ? 'warning' : 'info'}
          message={`Subscription expires in ${daysUntilExpiration} days`}
        />
      )}
    </Card>
  );
}
```

## Examples

### Subscription Countdown

```typescript
function SubscriptionCountdown() {
  const { expirationDate, daysUntilExpiration, isActive } =
    useSubscriptionStatus();

  if (!isActive || !expirationDate) {
    return null;
  }

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = expirationDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Every minute

    return () => clearInterval(interval);
  }, [expirationDate]);

  return (
    <View style={styles.countdown}>
      <Text>Expires in:</Text>
      <Text style={styles.timeLeft}>{timeLeft}</Text>
    </View>
  );
}
```

### Status History Tracker

```typescript
function StatusHistoryTracker() {
  const { status } = useSubscriptionStatus();
  const previousStatus = useRef(status);

  useEffect(() => {
    if (previousStatus.current?.type !== status?.type) {
      analytics.track('subscription_status_changed', {
        from: previousStatus.current?.type,
        to: status?.type,
        timestamp: Date.now(),
      });

      // Log to database for audit trail
      logStatusChange(previousStatus.current, status);
    }

    previousStatus.current = status;
  }, [status]);

  return null;
}
```

### Lifecycle Management

```typescript
function SubscriptionLifecycleManager() {
  const { status, isActive, daysUntilExpiration, willRenew } =
    useSubscriptionStatus();

  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Expiration warning
    if (daysUntilExpiration === 3) {
      notifications.send({
        title: 'Subscription Expiring Soon',
        body: 'Your subscription expires in 3 days',
      });
    }

    // Renewal reminder
    if (daysUntilExpiration === 1 && !willRenew) {
      notifications.send({
        title: 'Last Chance!',
        body: 'Your subscription expires tomorrow. Renew now to maintain access.',
      });
    }
  }, [daysUntilExpiration, willRenew, isActive]);

  return null;
}
```

## State Machine

```typescript
function SubscriptionStateMachine() {
  const { status, isActive, isExpired } = useSubscriptionStatus();

  const getState = () => {
    if (!status) return 'unknown';
    if (!isActive) return 'inactive';
    if (isExpired) return 'expired';
    return 'active';
  };

  const state = getState();

  switch (state) {
    case 'unknown':
      return <LoadingState />;
    case 'inactive':
      return <UpgradePrompt />;
    case 'expired':
      return <RenewPrompt />;
    case 'active':
      return <PremiumContent />;
    default:
      return null;
  }
}
```

## Visual Status Indicator

```typescript
function StatusIndicator() {
  const { isActive, isExpired, willRenew } = useSubscriptionStatus();

  const getStatusColor = () => {
    if (isExpired) return '#F44336'; // red
    if (isActive) return '#4CAF50'; // green
    return '#9E9E9E'; // gray
  };

  const getStatusIcon = () => {
    if (isExpired) return '⚠️';
    if (isActive && willRenew) return '♻️';
    if (isActive && !willRenew) return '⏳';
    return '⏸️';
  };

  return (
    <View style={[styles.indicator, { borderColor: getStatusColor() }]}>
      <Text>{getStatusIcon()}</Text>
      <ActivityIndicator
        size={8}
        color={getStatusColor()}
        animating={isActive}
      />
    </View>
  );
}
```

## Best Practices

1. **Handle null status** - Check if status exists
2. **Show expiration warnings** - Remind users before expiry
3. **Display renewal status** - Show if auto-renew is on/off
4. **Track changes** - Monitor status transitions
5. **Refresh regularly** - Keep status up to date
6. **Handle errors** - Show user-friendly error messages

## Related Hooks

- **usePremium** - Simple premium check
- **useSubscription** - Subscription details
- **useSubscriptionDetails** - Package and plan info
- **useUserTier** - Tier information

## See Also

- [SubscriptionStatus Entity](../../domain/entities/README.md)
- [usePremium](./usePremium.md)
- [useUserTier](./useUserTier.md)
