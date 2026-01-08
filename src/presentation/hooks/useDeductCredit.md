# useDeductCredit Hook

Hook for deducting credits from user balance with optimistic updates.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useDeductCredit.ts`

## Strategy

### Credit Deduction Flow

1. **Pre-deduction Validation**
   - Verify user is authenticated (userId must be defined)
   - Check if sufficient credits exist
   - Validate deduction amount is positive

2. **Optimistic Update**
   - Immediately update UI with new balance
   - Store previous state for potential rollback
   - Update TanStack Query cache

3. **Server Synchronization**
   - Send deduction request to backend
   - Handle success/failure responses
   - Rollback on failure

4. **Post-deduction Handling**
   - Trigger `onCreditsExhausted` callback if balance reaches zero
   - Return success/failure boolean
   - Reset loading state

### Integration Points

- **Credits Repository**: `src/domains/wallet/infrastructure/repositories/CreditsRepository.ts`
- **Credits Entity**: `src/domains/wallet/domain/entities/UserCredits.ts`
- **TanStack Query**: For cache management and optimistic updates

## Restrictions

### REQUIRED

- **User Authentication**: `userId` parameter MUST be provided and cannot be undefined
- **Positive Amount**: Credit cost MUST be greater than zero
- **Callback Implementation**: `onCreditsExhausted` callback SHOULD be implemented to handle zero balance scenarios

### PROHIBITED

- **NEVER** call `deductCredit` or `deductCredits` without checking `isDeducting` state first
- **NEVER** allow multiple simultaneous deduction calls for the same user
- **NEVER** deduce credits when balance is insufficient (should check with `useCreditChecker` first)
- **DO NOT** use this hook for guest users (userId undefined)

### CRITICAL SAFETY

- **ALWAYS** check return value before proceeding with feature execution
- **ALWAYS** handle the case where deduction returns `false`
- **NEVER** assume deduction succeeded without checking return value
- **MUST** implement error boundaries when using this hook

## Rules

### Initialization

```typescript
// CORRECT
const { deductCredit, isDeducting } = useDeductCredit({
  userId: user?.uid,
  onCreditsExhausted: () => showPaywall(),
});

// INCORRECT - Missing callback
const { deductCredit } = useDeductCredit({
  userId: user?.uid,
});

// INCORRECT - userId undefined
const { deductCredit } = useDeductCredit({
  userId: undefined,
});
```

### Deduction Execution

```typescript
// CORRECT - Check return value
const success = await deductCredit(5);
if (success) {
  executeFeature();
}

// INCORRECT - No return value check
await deductCredit(5);
executeFeature(); // May execute even if deduction failed

// INCORRECT - Multiple simultaneous calls
Promise.all([
  deductCredit(5),
  deductCredit(3), // Race condition!
]);
```

### Loading States

```typescript
// CORRECT - Respect loading state
<Button onPress={handleDeduct} disabled={isDeducting}>
  {isDeducting ? 'Deducting...' : 'Use Feature'}
</Button>

// INCORRECT - Ignore loading state
<Button onPress={handleDeduct}>
  Use Feature
</Button>
```

### Credit Exhaustion Handling

```typescript
// CORRECT - Implement callback
const { deductCredit } = useDeductCredit({
  userId: user?.uid,
  onCreditsExhausted: () => {
    navigation.navigate('CreditPackages');
  },
});

// MINIMUM - Show alert
const { deductCredit } = useDeductCredit({
  userId: user?.uid,
  onCreditsExhausted: () => {
    Alert.alert('No Credits', 'Please purchase more credits');
  },
});
```

## AI Agent Guidelines

### When Implementing Features

1. **Always** check if user has sufficient credits BEFORE allowing action
2. **Always** show the credit cost to user before deducting
3. **Always** disable buttons while `isDeducting` is true
4. **Always** handle the case where deduction returns false
5. **Never** allow zero or negative credit costs

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide valid `userId` from authentication context
- [ ] Implement `onCreditsExhausted` callback
- [ ] Check `isDeducting` before calling deduct functions
- [ ] Validate return value before proceeding
- [ ] Show credit cost to user before action
- [ ] Handle error cases gracefully
- [ ] Test with insufficient credits
- [ ] Test with zero balance

### Common Patterns to Implement

1. **Pre-check**: Use `useCreditChecker` before showing feature button
2. **Confirmation Dialog**: Ask user before expensive operations (>5 credits)
3. **Success Feedback**: Show success message after deduction
4. **Failure Handling**: Show appropriate error message on failure
5. **Purchase Flow**: Navigate to purchase screen on exhaustion

## Related Documentation

- **useCredits**: Access current credit balance
- **useCreditChecker**: Check credit availability before operations
- **useInitializeCredits**: Initialize credits after purchase
- **useFeatureGate**: Unified feature gating with credits
- **Credits Repository**: `src/domains/wallet/infrastructure/repositories/README.md`
- **Wallet Domain**: `src/domains/wallet/README.md`
