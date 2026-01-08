# useCreditsGate Hook

Hook for gating features behind credit requirements.

## Import

```typescript
import { useCreditsGate } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useCreditsGate(config: {
  creditCost: number;
  featureId: string;
}): {
  hasCredits: boolean;
  credits: number;
  consumeCredit: () => Promise<CreditsResult>;
  isLoading: boolean;
  showPurchasePrompt: () => void;
}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config.creditCost` | `number` | Yes | Number of credits required |
| `config.featureId` | `string` | Yes | Unique identifier for the feature |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `hasCredits` | `boolean` | Whether user has enough credits |
| `credits` | `number` | Current credit balance |
| `consumeCredit` | `() => Promise<CreditsResult>` | Function to consume credits |
| `isLoading` | `boolean` | Whether hook is loading |
| `showPurchasePrompt` | `() => void` | Show purchase prompt UI |

## Basic Usage

```typescript
function CreditFeature() {
  const { hasCredits, credits, consumeCredit } = useCreditsGate({
    creditCost: 5,
    featureId: 'export_data',
  });

  const handleExport = async () => {
    if (!hasCredits) {
      Alert.alert('Insufficient Credits', `You need 5 credits, have ${credits}`);
      return;
    }

    const result = await consumeCredit();

    if (result.success) {
      await exportData();
      Alert.alert('Success', `Data exported! ${result.newBalance} credits remaining`);
    } else {
      Alert.alert('Error', result.error?.message || 'Failed to consume credits');
    }
  };

  return (
    <Button
      onPress={handleExport}
      title={`Export Data (5 credits)`}
      disabled={!hasCredits}
    />
  );
}
```

## Advanced Usage

### With Purchase Prompt

```typescript
function AdvancedCreditFeature() {
  const { hasCredits, credits, consumeCredit, showPurchasePrompt } =
    useCreditsGate({
      creditCost: 10,
      featureId: 'ai_analysis',
    });

  const handleAnalyze = async () => {
    if (!hasCredits) {
      showPurchasePrompt();
      return;
    }

    const result = await consumeCredit();

    if (result.success) {
      await performAIAnalysis();
    }
  };

  return (
    <View>
      <Text>Credits: {credits}</Text>
      <Text>Cost: 10 credits</Text>

      <Button
        onPress={handleAnalyze}
        title={hasCredits ? 'Analyze (10 credits)' : 'Get More Credits'}
        disabled={!hasCredits && credits < 10}
      />
    </View>
  );
}
```

### With Transaction Tracking

```typescript
function TrackedCreditFeature() {
  const { consumeCredit, hasCredits } = useCreditsGate({
    creditCost: 3,
    featureId: 'filter_apply',
  });

  const handleApplyFilter = async () => {
    const result = await consumeCredit();

    if (result.success) {
      // Track usage
      analytics.track('credit_consumed', {
        feature_id: 'filter_apply',
        amount: 3,
        transaction_id: result.transaction?.id,
      });

      // Apply filter
      await applyFilter();
    }
  };

  return <Button onPress={handleApplyFilter} title="Apply Filter (3 credits)" />;
}
```

### With Loading State

```typescript
function CreditFeatureWithLoading() {
  const { consumeCredit, isLoading, hasCredits } = useCreditsGate({
    creditCost: 5,
    featureId: 'premium_template',
  });

  const handleUse = async () => {
    if (!hasCredits) return;

    const result = await consumeCredit();

    if (result.success) {
      // Show loading while processing
      await processFeature();
    }
  };

  return (
    <View>
      <Button
        onPress={handleUse}
        disabled={isLoading || !hasCredits}
        title={isLoading ? 'Processing...' : 'Use Feature (5 credits)'}
      />
    </View>
  );
}
```

## Examples

### Credit-Based Action Button

```typescript
function CreditActionButton({ featureId, cost, action, label }) {
  const { hasCredits, credits, consumeCredit } = useCreditsGate({
    creditCost: cost,
    featureId,
  });

  const handlePress = async () => {
    if (!hasCredits) {
      showInsufficientCreditsDialog(cost, credits);
      return;
    }

    const result = await consumeCredit();
    if (result.success) {
      await action();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!hasCredits}
      style={hasCredits ? styles.buttonEnabled : styles.buttonDisabled}
    >
      <Text style={styles.buttonText}>{label}</Text>
      <Text style={styles.costText}>{cost} credits</Text>
    </TouchableOpacity>
  );
}
```

### Credit Balance Display

```typescript
function CreditBalanceDisplay() {
  const { credits, isLoading } = useCreditsGate({
    creditCost: 1,
    featureId: 'any',
  });

  return (
    <View style={styles.balanceContainer}>
      <Text style={styles.balanceLabel}>Your Credits:</Text>

      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text style={styles.balanceValue}>{credits}</Text>
      )}
    </View>
  );
}
```

### Multiple Credit Tiers

```typescript
function TieredFeatureAccess() {
  const { credits: basicCredits, hasCredits: hasBasic } = useCreditsGate({
    creditCost: 5,
    featureId: 'basic_feature',
  });

  const { credits: proCredits, hasCredits: hasPro } = useCreditsGate({
    creditCost: 20,
    featureId: 'pro_feature',
  });

  return (
    <View>
      <Button
        onPress={handleBasicFeature}
        disabled={!hasBasic}
        title={`Basic Feature (5 credits)`}
      />

      <Button
        onPress={handleProFeature}
        disabled={!hasPro}
        title={`Pro Feature (20 credits)`}
      />

      <Text>Balance: {basicCredits} credits</Text>
    </View>
  );
}
```

## Result Type

```typescript
interface CreditsResult {
  success: boolean;
  newBalance?: number;
  transaction?: {
    id: string;
    amount: number;
    reason: string;
    timestamp: string;
  };
  error?: Error;
}
```

## Error Handling

```typescript
function RobustCreditFeature() {
  const { consumeCredit } = useCreditsGate({
    creditCost: 10,
    featureId: 'robust_feature',
  });

  const handleAction = async () => {
    const result = await consumeCredit();

    if (!result.success) {
      if (result.error?.message.includes('Insufficient')) {
        Alert.alert('Insufficient Credits', 'Please purchase more credits');
      } else if (result.error?.message.includes('Network')) {
        Alert.alert('Network Error', 'Please check your connection');
      } else {
        Alert.alert('Error', 'Failed to process. Please try again');
      }

      // Log error
      analytics.track('credit_consumption_failed', {
        feature_id: 'robust_feature',
        error: result.error?.message,
      });
      return;
    }

    // Success
    await executeFeature();
  };

  return <Button onPress={handleAction} title="Execute (10 credits)" />;
}
```

## Best Practices

1. **Always check `hasCredits`** before enabling actions
2. **Show credit cost** in UI
3. **Handle errors gracefully**
4. **Provide purchase prompt** when credits are insufficient
5. **Display current balance**
6. **Track credit consumption** in analytics
7. **Refetch balance** after consumption

## Related Hooks

- **useCredits** - For credit balance only
- **useDeductCredit** - For manual credit deduction
- **usePremiumWithCredits** - For premium OR credits access
- **useCreditChecker** - For simple credit checks

## See Also

- [useCredits](./useCredits.md)
- [useDeductCredit](./useDeductCredit.md)
- [usePremiumWithCredits](./usePremiumWithCredits.md)
