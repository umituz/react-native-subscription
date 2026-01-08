# useDeductCredit Hook

Hook for deducting credits from user balance with optimistic updates.

## Import

```typescript
import { useDeductCredit } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useDeductCredit(params: {
  userId: string | undefined;
  onCreditsExhausted?: () => void;
}): {
  deductCredit: (cost?: number) => Promise<boolean>;
  deductCredits: (cost: number) => Promise<boolean>;
  isDeducting: boolean;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | `string \| undefined` | **Required** | User ID for credit deduction |
| `onCreditsExhausted` | `() => void` | `undefined` | Callback when credits are exhausted |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `deductCredit` | `(cost?: number) => Promise<boolean>` | Deduct credits (defaults to 1) |
| `deductCredits` | `(cost: number) => Promise<boolean>` | Deduct specific amount |
| `isDeducting` | `boolean` | Mutation is in progress |

## Basic Usage

```typescript
function CreditButton() {
  const { user } = useAuth();
  const { deductCredit, isDeducting } = useDeductCredit({
    userId: user?.uid,
    onCreditsExhausted: () => {
      Alert.alert('Low Credits', 'Please purchase more credits');
    },
  });

  const handleUseFeature = async () => {
    const success = await deductCredit(1);
    if (success) {
      executePremiumFeature();
    }
  };

  return (
    <Button onPress={handleUseFeature} disabled={isDeducting}>
      Use Feature (1 Credit)
    </Button>
  );
}
```

## Advanced Usage

### With Custom Cost

```typescript
function FeatureWithCost() {
  const { deductCredit } = useDeductCredit({
    userId: user?.uid,
  });

  const features = {
    basic: { cost: 1, name: 'Basic Generation' },
    advanced: { cost: 5, name: 'Advanced Generation' },
    premium: { cost: 10, name: 'Premium Generation' },
  };

  const handleFeature = async (cost: number) => {
    const success = await deductCredit(cost);
    if (success) {
      console.log('Feature used');
    }
  };

  return (
    <View>
      {Object.entries(features).map(([key, { cost, name }]) => (
        <Button
          key={key}
          onPress={() => handleFeature(cost)}
          title={`${name} (${cost} credits)`}
        />
      ))}
    </View>
  );
}
```

### With Confirmation

```typescript
function CreditDeductionWithConfirmation() {
  const { deductCredit } = useDeductCredit({
    userId: user?.uid,
  });

  const handleActionWithConfirmation = async (cost: number, action: string) => {
    Alert.alert(
      'Confirm Action',
      `This will cost ${cost} credit${cost > 1 ? 's' : ''}. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await deductCredit(cost);
            if (success) {
              await performAction(action);
            }
          },
        },
      ]
    );
  };

  return (
    <Button
      onPress={() => handleActionWithConfirmation(5, 'export')}
      title="Export Data (5 Credits)"
    />
  );
}
```

## Best Practices

1. **Check balance first** - Show user if they have enough credits
2. **Handle exhausted credits** - Provide purchase option
3. **Show loading state** - Disable button during deduction
4. **Optimistic updates** - UI updates automatically
5. **Error handling** - Handle deduction failures gracefully
6. **Confirm expensive actions** - Ask before large deductions
7. **Clear messaging** - Tell users cost before deducting

## Related Hooks

- **useCredits** - For accessing credits balance
- **useCreditsGate** - For gating features with credits
- **useInitializeCredits** - For initializing credits after purchase
- **useCreditChecker** - For checking credit availability

## See Also

- [Credits README](../../../domains/wallet/README.md)
- [Credits Entity](../../../domains/wallet/domain/entities/Credits.md)
- [Credits Repository](../../../infrastructure/repositories/CreditsRepository.md)
