# useCreditChecker Hook

Provides credit checking utilities with dedicated repository integration.

## Import

```typescript
import { useCreditChecker } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useCreditChecker(params?: {
  onCreditDeducted?: (userId: string, cost: number) => void;
}): {
  checkCreditsAvailable: (
    userId: string | undefined,
    cost?: number
  ) => Promise<CreditCheckResult>;
  deductCreditsAfterSuccess: (
    userId: string | undefined,
    cost?: number
  ) => Promise<void>;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `onCreditDeducted` | `(userId, cost) => void` | `undefined` | Callback after successful deduction |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `checkCreditsAvailable` | `(userId, cost?) => Promise<CreditCheckResult>` | Check if user has enough credits |
| `deductCreditsAfterSuccess` | `(userId, cost?) => Promise<void>` | Deduct after successful operation |

## CreditCheckResult

```typescript
interface CreditCheckResult {
  hasCredits: boolean;
  currentBalance: number;
  required: number;
  canProceed: boolean;
}
```

## Basic Usage

```typescript
function CreditFeature() {
  const { user } = useAuth();
  const { checkCreditsAvailable } = useCreditChecker();

  const handleUseFeature = async () => {
    const result = await checkCreditsAvailable(user?.uid, 5);

    if (!result.canProceed) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${result.required} credits but only have ${result.currentBalance}`
      );
      return;
    }

    // Proceed with feature
    await executeFeature();
  };

  return <Button onPress={handleUseFeature} title="Use Feature (5 credits)" />;
}
```

## Advanced Usage

### With Deduction Callback

```typescript
function CreditWithCallback() {
  const { user } = useAuth();

  const { checkCreditsAvailable } = useCreditChecker({
    onCreditDeducted: (userId, cost) => {
      console.log(`Deducted ${cost} credits from ${userId}`);
      analytics.track('credits_deducted', { userId, cost });
    },
  });

  const handleAction = async () => {
    const result = await checkCreditsAvailable(user?.uid, 3);

    if (!result.canProceed) {
      showPaywall();
      return;
    }

    await performAction();
  };

  return <Button onPress={handleAction} title="Execute (3 credits)" />;
}
```

### With Two-Step Process

```typescript
function TwoStepCreditProcess() {
  const { user } = useAuth();

  const {
    checkCreditsAvailable,
    deductCreditsAfterSuccess,
  } = useCreditChecker();

  const handleProcess = async () => {
    // Step 1: Check credits
    const check = await checkCreditsAvailable(user?.uid, 10);

    if (!check.canProceed) {
      Alert.alert('Insufficient Credits', 'You need 10 credits for this operation');
      return;
    }

    try {
      // Step 2: Perform operation
      const result = await expensiveOperation();

      // Step 3: Deduct credits only after success
      await deductCreditsAfterSuccess(user?.uid, 10);

      Alert.alert('Success', 'Operation completed!');
    } catch (error) {
      Alert.alert('Error', 'Operation failed, credits not deducted');
    }
  };

  return <Button onPress={handleProcess} title="Process (10 credits)" />;
}
```

### With Pre-Check UI

```typescript
function CreditPreCheck() {
  const { user } = useAuth();
  const { checkCreditsAvailable } = useCreditChecker();

  const [creditCheck, setCreditCheck] = useState<CreditCheckResult | null>(null);

  useEffect(() => {
    // Pre-check on mount
    checkCreditsAvailable(user?.uid, 5).then(setCreditCheck);
  }, [user]);

  if (!creditCheck) return <ActivityIndicator />;

  return (
    <View>
      <Text>Required: {creditCheck.required} credits</Text>
      <Text>Balance: {creditCheck.currentBalance} credits</Text>

      {creditCheck.canProceed ? (
        <Button
          onPress={() => executeAction()}
          title="Proceed"
        />
      ) : (
        <Button
          onPress={() => showPaywall()}
          title="Get More Credits"
        />
      )}
    </View>
  );
}
```

### With Cost Estimation

```typescript
function CostEstimator() {
  const { user } = useAuth();
  const { checkCreditsAvailable } = useCreditChecker();

  const estimateCost = (itemCount: number) => {
    return Math.ceil(itemCount / 10); // 1 credit per 10 items
  };

  const handleExport = async (items: any[]) => {
    const cost = estimateCost(items.length);
    const result = await checkCreditsAvailable(user?.uid, cost);

    if (!result.canProceed) {
      Alert.alert(
        'Insufficient Credits',
        `Exporting ${items.length} items costs ${cost} credits. You have ${result.currentBalance}.`
      );
      return;
    }

    await exportItems(items);
    await deductCreditsAfterSuccess(user?.uid, cost);
  };

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <ItemRow item={item} />}
      ListHeaderComponent={
        <Button
          onPress={() => handleExport(selectedItems)}
          title={`Export (${estimateCost(selectedItems.length)} credits)`}
        />
      }
    />
  );
}
```

## Examples

### AI Generation with Credits

```typescript
function AIGeneration() {
  const { user } = useAuth();
  const { checkCreditsAvailable, deductCreditsAfterSuccess } = useCreditChecker({
    onCreditDeducted: (userId, cost) => {
      analytics.track('ai_generation_completed', { userId, cost });
    },
  });

  const creditsNeeded = 5;

  const handleGenerate = async () => {
    // Check if user has enough credits
    const check = await checkCreditsAvailable(user?.uid, creditsNeeded);

    if (!check.canProceed) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${creditsNeeded} credits to generate. Current balance: ${check.currentBalance}`,
        [
          { text: 'Cancel' },
          { text: 'Get Credits', onPress: () => navigation.navigate('CreditPackages') },
        ]
      );
      return;
    }

    try {
      // Show loading
      setGenerating(true);

      // Generate AI content
      const result = await callAIGenerationAPI(prompt);

      // Only deduct credits after successful generation
      await deductCreditsAfterSuccess(user?.uid, creditsNeeded);

      setContent(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View>
      <Text>Credits needed: {creditsNeeded}</Text>
      <Button
        onPress={handleGenerate}
        disabled={generating}
        title={generating ? 'Generating...' : `Generate (${creditsNeeded} credits)`}
      />
    </View>
  );
}
```

### Batch Operations

```typescript
function BatchOperations() {
  const { user } = useAuth();
  const { checkCreditsAvailable, deductCreditsAfterSuccess } = useCreditChecker();

  const handleBatchProcess = async (items: Item[]) => {
    const cost = items.length; // 1 credit per item

    const check = await checkCreditsAvailable(user?.uid, cost);

    if (!check.canProceed) {
      Alert.alert(
        'Insufficient Credits',
        `Processing ${items.length} items requires ${cost} credits. You have ${check.currentBalance}.`,
        [
          { text: 'Cancel' },
          {
            text: 'Get Credits',
            onPress: () => navigation.navigate('CreditPackages', { required: cost }),
          },
        ]
      );
      return;
    }

    // Confirm before proceeding
    Alert.alert(
      'Confirm Batch Process',
      `Process ${items.length} items for ${cost} credits?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Process',
          onPress: async () => {
            try {
              // Process all items
              for (const item of items) {
                await processItem(item);
                updateProgress();
              }

              // Deduct only after all succeed
              await deductCreditsAfterSuccess(user?.uid, cost);

              Alert.alert('Success', `Processed ${items.length} items`);
            } catch (error) {
              Alert.alert('Error', 'Batch processing failed');
            }
          },
        },
      ]
    );
  };

  return (
    <Button
      onPress={() => handleBatchProcess(selectedItems)}
      title={`Process ${selectedItems.length} items`}
    />
  );
}
```

### Progressive Credit Check

```typescript
function ProgressiveFeature() {
  const { user } = useAuth();
  const { checkCreditsAvailable } = useCreditChecker();

  const handleProgressiveAction = async () => {
    // Try from most expensive to least expensive
    const tiers = [10, 5, 3, 1];

    for (const cost of tiers) {
      const check = await checkCreditsAvailable(user?.uid, cost);

      if (check.canProceed) {
        // Use the highest tier user can afford
        await executeAction(cost);
        Alert.alert('Success', `Used ${cost} credits`);
        return;
      }
    }

    // User can't afford any tier
    Alert.alert('Insufficient Credits', 'You need at least 1 credit to proceed');
  };

  return (
    <Button
      onPress={handleProgressiveAction}
      title="Smart Action (1-10 credits)"
    />
  );
}
```

## Best Practices

1. **Check before deduct** - Always verify credits before operations
2. **Deduct after success** - Only deduct when operation succeeds
3. **Show clear messaging** - Tell users cost and balance
4. **Handle failures** - Don't deduct on error
5. **Track deductions** - Use callback for analytics
6. **Provide alternatives** - Link to credit purchase when low
7. **Estimate costs** - Calculate and show cost upfront

## Related Hooks

- **useCredits** - For accessing credits balance
- **useDeductCredit** - For direct credit deduction
- **useCreditsGate** - For gating features with credits
- **useCreditChecker** (utility) - For reusable credit checker

## See Also

- [Credit Checker Utility](../../../utils/creditChecker.md)
- [Credits README](../../../domains/wallet/README.md)
- [Credits Entity](../../../domains/wallet/domain/entities/Credits.md)
