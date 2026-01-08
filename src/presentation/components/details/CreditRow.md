# CreditRow Component

Displays credit information with label, count badge, and progress bar.

## Import

```typescript
import { CreditRow } from '@umituz/react-native-subscription';
```

## Signature

```typescript
interface CreditRowProps {
  label: string;
  current: number;
  total: number;
  remainingLabel?: string;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **Required** | Credit type label |
| `current` | `number` | **Required** | Current credit amount |
| `total` | `number` | **Required** | Maximum credit amount |
| `remainingLabel` | `string` | `undefined` | Label for remaining text |

## Basic Usage

```typescript
function CreditsDisplay() {
  const { credits } = useCredits();

  return (
    <CreditRow
      label="Monthly Credits"
      current={credits}
      total={100}
      remainingLabel="credits remaining"
    />
  );
}
```

## Advanced Usage

### With Multiple Credit Types

```typescript
function MultipleCredits() {
  const { credits: monthlyCredits } = useCredits();
  const bonusCredits = 50;

  return (
    <View>
      <CreditRow
        label="Monthly Credits"
        current={monthlyCredits}
        total={100}
        remainingLabel="credits left"
      />

      <CreditRow
        label="Bonus Credits"
        current={bonusCredits}
        total={50}
        remainingLabel="bonus credits"
      />

      <CreditRow
        label="Reward Credits"
        current={25}
        total={100}
        remainingLabel="rewards"
      />
    </View>
  );
}
```

### With Dynamic Updates

```typescript
function LiveCredits() {
  const { credits, refetch } = useCredits();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <CreditRow
      label="Credits"
      current={credits}
      total={100}
      remainingLabel="remaining"
    />
  );
}
```

### With Warning Thresholds

```typescript
function CreditWarning() {
  const { credits } = useCredits();

  return (
    <CreditRow
      label="Monthly Credits"
      current={credits}
      total={100}
      remainingLabel={credits < 20 ? '⚠️ Low balance!' : 'credits remaining'}
    />
  );
}
```

### Complete Credit Dashboard

```typescript
function CreditDashboard() {
  const { credits: monthlyCredits, transactions } = useCredits();
  const { purchasedAt } = useCredits();

  // Calculate bonus credits from transactions
  const bonusCredits = transactions
    .filter(tx => tx.type === 'bonus')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Calculate total usage
  const totalUsed = 100 - monthlyCredits + bonusCredits;

  return (
    <Card>
      <Text style={styles.title}>Your Credits</Text>

      <CreditRow
        label="Monthly Credits"
        current={monthlyCredits}
        total={100}
        remainingLabel="credits this month"
      />

      <CreditRow
        label="Bonus Credits"
        current={bonusCredits}
        total={50}
        remainingLabel="bonus credits"
      />

      <View style={styles.footer}>
        <Text style={styles.info}>
          Resets on {getNextMonthDate(purchasedAt).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );
}
```

## Progress Bar Colors

The progress bar color changes based on percentage:

| Percentage | Color | Visual |
|------------|-------|--------|
| 0-20% | Error (red) | ██████░░░░░░░░░░░░░ |
| 21-50% | Warning (orange) | ████████████░░░░░░ |
| 51-100% | Success (green) | ████████████████████ |

## Examples

### In Subscription Settings

```typescript
function SubscriptionCredits() {
  const { credits, isLoading } = useCredits();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Credits</Text>

      <CreditRow
        label="Monthly Allowance"
        current={credits}
        total={100}
        remainingLabel="credits"
      />
    </View>
  );
}
```

### With Purchase Link

```typescript
function CreditWithPurchase() {
  const { credits } = useCredits();

  const isLow = credits < 20;

  return (
    <View>
      <CreditRow
        label="Credits"
        current={credits}
        total={100}
        remainingLabel="remaining"
      />

      {isLow && (
        <Button
          onPress={() => navigation.navigate('CreditPackages')}
          title="Get More Credits"
          style={styles.purchaseButton}
        />
      )}
    </View>
  );
}
```

### With Feature Costs

```typescript
function FeatureCostDisplay() {
  const { credits } = useCredits();

  const features = [
    { name: 'AI Generation', cost: 5 },
    { name: 'Advanced Export', cost: 3 },
    { name: 'Cloud Sync', cost: 1 },
  ];

  return (
    <View>
      <CreditRow
        label="Available Credits"
        current={credits}
        total={100}
        remainingLabel="credits"
      />

      <View style={styles.divider} />

      {features.map((feature) => (
        <DetailRow
          key={feature.name}
          label={feature.name}
          value={`${feature.cost} credits`}
        />
      ))}
    </View>
  );
}
```

## Component Layout

```
┌─────────────────────────────────────┐
│ Monthly Credits        [50/100]     │
│ ████████████░░░░░░░░░░░░░░░░        │
│ 50 credits remaining               │
└─────────────────────────────────────┘
```

## Styling

```typescript
const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: tokens.colors.surfaceSecondary,
  },
  count: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: tokens.colors.surfaceSecondary,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: progressColor, // Dynamic based on percentage
  },
});
```

## Best Practices

1. **Show total always** - Display max credits for context
2. **Update regularly** - Keep credits current
3. **Color code thresholds** - Use colors for low/high amounts
4. **Provide context** - Explain credit reset周期
5. **Link to purchase** - Add purchase option when low
6. **Test edge cases** - Zero credits, max credits, negative values
7. **Format numbers** - Use appropriate number formatting

## Related Components

- **PremiumDetailsCard** - Contains credit rows
- **DetailRow** - Simple label-value row
- **SubscriptionSection** - Section with credits

## See Also

- [useCredits](../../hooks/useCredits.md)
- [Credits Entity](../../../domains/wallet/domain/entities/Credits.md)
- [Credits README](../../../../domains/wallet/README.md)
