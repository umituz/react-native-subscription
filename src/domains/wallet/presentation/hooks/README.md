# Wallet Presentation Hooks

React hooks for wallet and credit functionality.

## Overview

This directory contains React hooks specifically for credit management and wallet operations.

## Hooks

### useCredits
Access and manage credit balance.

```typescript
function useCredits(params: {
  userId: string | undefined;
  enabled?: boolean;
}): {
  credits: number;
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

**Usage:**
```typescript
function CreditBalance() {
  const { credits, isLoading } = useCredits({ userId: user?.uid });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View>
      <Text>Balance: {credits} credits</Text>
    </View>
  );
}
```

### useDeductCredit
Deduct credits with optimistic updates.

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

**Usage:**
```typescript
function AIGeneration() {
  const { deductCredit } = useDeductCredit({
    userId: user?.uid,
    onCreditsExhausted: () => showPaywall(),
  });

  const handleGenerate = async () => {
    const success = await deductCredit(5);
    if (success) {
      await callAIGenerationAPI();
    }
  };
}
```

### useInitializeCredits
Initialize credits after purchase.

```typescript
function useInitializeCredits(params: {
  userId: string | undefined;
}): {
  initializeCredits: (options?: {
    purchaseId?: string;
    productId?: string;
  }) => Promise<boolean>;
  isInitializing: boolean;
}
```

**Usage:**
```typescript
function PurchaseCompletion() {
  const { initializeCredits } = useInitializeCredits({
    userId: user?.uid,
  });

  const handlePurchaseComplete = async (transaction: Purchase) => {
    const success = await initializeCredits({
      purchaseId: transaction.transactionId,
      productId: transaction.productId,
    });

    if (success) {
      Alert.alert('Success', 'Credits added!');
    }
  };
}
```

### useCreditChecker
Check credit availability before operations.

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

**Usage:**
```typescript
function PreCheckFeature() {
  const { checkCreditsAvailable } = useCreditChecker();

  const handleCheck = async () => {
    const result = await checkCreditsAvailable(user?.uid, 10);

    if (!result.canProceed) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${result.required} credits but have ${result.currentBalance}`
      );
      return;
    }

    await executeFeature();
  };
}
```

## Usage Patterns

### Two-Step Credit Process

```typescript
function TwoStepCreditProcess() {
  const { checkCreditsAvailable } = useCreditChecker();
  const { deductCreditsAfterSuccess } = useCreditChecker();

  const handleOperation = async () => {
    // Step 1: Check credits
    const check = await checkCreditsAvailable(user?.uid, 10);

    if (!check.canProceed) {
      showPaywall({ required: 10 });
      return;
    }

    try {
      // Step 2: Perform operation
      await performOperation();

      // Step 3: Deduct credits after success
      await deductCreditsAfterSuccess(user?.uid, 10);

      Alert.alert('Success', 'Operation completed');
    } catch (error) {
      Alert.alert('Error', 'Operation failed');
    }
  };
}
```

### With Loading and Error States

```typescript
function CreditOperation() {
  const { credits, isLoading, error } = useCredits({ userId: user?.uid });
  const { deductCredit } = useDeductCredit({
    userId: user?.uid,
  });

  const handleDeduct = async () => {
    if (isLoading) return;

    const success = await deductCredit(5);

    if (success) {
      await executeFeature();
    } else {
      Alert.alert('Failed', 'Could not deduct credits');
    }
  };

  return (
    <View>
      {error && <ErrorBanner message={error.message} />}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Text>Credits: {credits}</Text>
          <Button onPress={handleDeduct} disabled={isLoading}>
            Use 5 Credits
          </Button>
        </>
      )}
    </View>
  );
}
```

### With Auto-Initialization

```typescript
function AutoInitialize() {
  const { isPremium } = usePremium();
  const { credits } = useCredits({ userId: user?.uid });
  const { initializeCredits, isInitializing } = useInitializeCredits({
    userId: user?.uid,
  });

  useEffect(() => {
    // Auto-initialize if premium but no credits
    if (isPremium && !credits && !isInitializing) {
      initializeCredits();
    }
  }, [isPremium, credits]);

  return <YourComponent />;
}
```

## Best Practices

1. **Check Balance First**: Always check before deducting
2. **Handle Loading**: Show loading states appropriately
3. **Error Recovery**: Handle deduction failures gracefully
4. **Optimistic Updates**: Use optimistic updates for better UX
5. **Track Usage**: Log all credit operations
6. **Auto-Init**: Initialize credits after premium purchase
7. **Test Scenarios**: Test zero credits, max credits, failures

## Related

- [useCredits Hook Documentation](../../../presentation/hooks/useCredits.md)
- [useDeductCredit Hook Documentation](../../../presentation/hooks/useDeductCredit.md)
- [Credits Entity](../../domain/entities/README.md)
