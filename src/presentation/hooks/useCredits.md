# useCredits Hook

Hook for accessing and managing credits balance.

## Import

```typescript
import { useCredits } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useCredits(): {
  credits: number;
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `credits` | `number` | Current credit balance |
| `balance` | `number` | Balance in currency (USD, etc.) |
| `transactions` | `Transaction[]` | Transaction history |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error if any |
| `refetch` | `() => Promise<void>` | Manually refetch data |

## Basic Usage

```typescript
function CreditsDisplay() {
  const { credits, isLoading } = useCredits();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Your Credits: {credits}</Text>
      <Text>Balance: ${balance.toFixed(2)}</Text>
    </View>
  );
}
```

## Advanced Usage

### With Refresh Control

```typescript
function CreditsWithRefresh() {
  const { credits, refetch, isLoading } = useCredits();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View>
      <Text>Credits: {credits}</Text>

      <Button
        onPress={handleRefresh}
        disabled={refreshing || isLoading}
        title={refreshing ? 'Refreshing...' : 'Refresh'}
      />
    </View>
  );
}
```

### With Auto-Refresh

```typescript
function AutoRefreshCredits() {
  const { credits, refetch } = useCredits();

  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Refresh when app comes to foreground
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return <Text>Credits: {credits}</Text>;
}
```

### With Credit History

```typescript
function CreditsWithHistory() {
  const { credits, transactions, isLoading } = useCredits();

  return (
    <View>
      <BalanceDisplay credits={credits} />

      <Text style={styles.historyTitle}>Recent Transactions</Text>

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem
              amount={item.amount}
              reason={item.reason}
              timestamp={item.timestamp}
            />
          )}
        />
      )}
    </View>
  );
}
```

### With Balance Conversion

```typescript
function CreditsWithConversion() {
  const { credits, balance } = useCredits();

  const creditValue = 0.01; // 1 credit = $0.01

  return (
    <View>
      <Text style={styles.credits}>{credits} Credits</Text>
      <Text style={styles.balance}>
        Worth approximately ${(balance || 0).toFixed(2)}
      </Text>
      <Text style={styles.info}>
        (1 credit = ${(creditValue).toFixed(2)})
      </Text>
    </View>
  );
}
```

## Examples

### Credits Balance Card

```typescript
function CreditsBalanceCard() {
  const { credits, balance, isLoading } = useCredits();

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <Card style={styles.card}>
      <Card.Header>
        <Card.Title>Your Balance</Card.Title>
      </Card.Header>

      <Card.Body>
        <View style={styles.balanceContainer}>
          <Text style={styles.credits}>{credits}</Text>
          <Text style={styles.label}>Credits</Text>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balance}>
            ${(balance || 0).toFixed(2)}
          </Text>
          <Text style={styles.label}>Value</Text>
        </View>
      </Card.Body>

      <Card.Footer>
        <Button
          onPress={() => navigation.navigate('CreditPackages')}
          title="Get More Credits"
          size="sm"
        />
      </Card.Footer>
    </Card>
  );
}
```

### Credits Indicator

```typescript
function CreditsIndicator() {
  const { credits } = useCredits();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Wallet')}
      style={styles.indicator}
    >
      <Icon name="coins" size={20} color="#FFD700" />
      <Text style={styles.credits}>{credits}</Text>
    </TouchableOpacity>
  );
}
```

### Low Credits Warning

```typescript
function LowCreditsWarning() {
  const { credits } = useCredits();
  const lowCreditThreshold = 10;

  useEffect(() => {
    if (credits <= lowCreditThreshold && credits > 0) {
      notifications.show({
        title: 'Low Credits',
        body: `You have ${credits} credits remaining. Purchase more to continue using features.`,
      });
    }
  }, [credits]);

  if (credits <= lowCreditThreshold) {
    return (
      <Alert
        severity={credits === 0 ? 'error' : 'warning'}
        message={
          credits === 0
            ? 'No credits remaining. Purchase more to continue.'
            : `Low credits: ${credits} remaining`
        }
        action={
          <Button onPress={() => navigation.navigate('CreditPackages')}>
            Get More
          </Button>
        }
      />
    );
  }

  return null;
}
```

### Credits Usage Chart

```typescript
function CreditsUsageChart() {
  const { transactions } = useCredits();

  // Group transactions by date
  const usageByDate = useMemo(() => {
    const grouped = transactions.reduce((acc, tx) => {
      const date = new Date(tx.timestamp).toDateString();
      acc[date] = (acc[date] || 0) + Math.abs(tx.amount);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  }, [transactions]);

  return (
    <View>
      <Text>Credits Usage (Last 7 Days)</Text>

      <LineChart
        data={usageByDate}
        xKey="date"
        yKey="amount"
        height={200}
      />
    </View>
  );
}
```

### Real-Time Balance Updates

```typescript
function RealtimeCreditsBalance() {
  const { credits, refetch } = useCredits();

  // Listen to credit updates
  useEffect(() => {
    const unsubscribe = creditsListener.on((newBalance) => {
      console.log('Credits updated:', newBalance);
      refetch();
    });

    return () => unsubscribe?.();
  }, []);

  return (
    <View>
      <Text>Credits: {credits}</Text>
    </View>
  );
}
```

## Best Practices

1. **Handle loading** - Show skeleton or spinner
2. **Display balance** - Show both credits and value
3. **Provide purchase option** - Link to credit packages
4. **Show warnings** - Alert when credits are low
5. **Track usage** - Display transaction history
6. **Auto-refresh** - Keep balance up to date
7. **Handle errors** - Show user-friendly messages

## Related Hooks

- **useCreditsGate** - For gating features with credits
- **useDeductCredit** - For deducting credits
- **useTransactionHistory** - For transaction list
- **useWallet** - Wallet domain hook

## See Also

- [CreditsGate](./useCreditsGate.md)
- [DeductCredit](./useDeductCredit.md)
- [Wallet Domain](../../../domains/wallet/README.md)
