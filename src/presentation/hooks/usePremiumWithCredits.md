# usePremiumWithCredits Hook

Combined hook for premium subscription with credits system integration.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/usePremiumWithCredits.ts`

**Type**: Hook

## Strategy

### Premium + Credits Integration

1. **Credits Access**: Provide all credits data from useCredits hook
2. **Auto-Initialization**: Automatically initialize credits when user becomes premium
3. **Premium Check**: Monitor isPremium status to trigger initialization
4. **Duplicate Prevention**: Skip initialization if credits already exist
5. **Loading Management**: Handle loading state during initialization
6. **Error Handling**: Handle initialization failures gracefully

### Integration Points

- **useCredits**: For credits balance and transactions
- **usePremium**: For premium status check
- **useInitializeCredits**: For credit initialization
- **Credits Repository**: `src/domains/wallet/infrastructure/repositories/CreditsRepository.ts`

## Restrictions

### REQUIRED

- **User ID**: MUST provide valid userId parameter
- **Premium Status**: MUST provide isPremium parameter
- **Loading State**: MUST handle loading state
- **Error Handling**: MUST handle initialization errors

### PROHIBITED

- **NEVER** call without valid userId
- **NEVER** call without isPremium parameter
- **DO NOT** manually manage credits state (use hook values)
- **DO NOT** call ensureCreditsInitialized excessively

### CRITICAL SAFETY

- **ALWAYS** validate userId before use
- **MUST** handle loading state during initialization
- **ALWAYS** check isPremium before showing premium features
- **NEVER** trust client-side state for security

## AI Agent Guidelines

### When Implementing Premium + Credits

1. **Always** provide valid userId
2. **Always** provide isPremium status
3. **Always** handle loading state
4. **Always** call ensureCreditsInitialized for premium users
5. **Never** manually initialize credits without checking isPremium

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide valid userId
- [ ] Provide isPremium from usePremium
- [ ] Handle loading state
- [ ] Call ensureCreditsInitialized when isPremium is true
- [ ] Test with premium user (no credits)
- [ ] Test with premium user (has credits)
- [ ] Test with free user
- [ ] Test subscription upgrade flow
- [ ] Test error scenarios

### Common Patterns

1. **Auto-Initialization**: Automatically initialize credits for premium users
2. **Subscription Change Detection**: Detect when user subscribes
3. **Premium Benefits Display**: Show credits along with premium status
4. **Subscription Monitor**: Refresh status periodically
5. **Manual Init**: Provide button for manual initialization

## Related Documentation

- **useCredits**: Credits management
- **useInitializeCredits**: Manual credit initialization
- **usePremium**: Premium status
- **useDeductCredit**: Credit deduction
- **Credits System**: `src/domains/wallet/README.md`
- **Premium Integration**: `src/docs/PREMIUM_INTEGRATION.md`
