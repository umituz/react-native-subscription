# useCreditsGate Hook

Hook for gating features behind credit requirements.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useCreditsGate.ts`

**Type**: Hook

## Strategy

### Credit Gating Flow

1. **Credit Check**: Verify user has sufficient credits for feature
2. **Balance Display**: Show current credit balance to user
3. **Feature Access Control**: Enable/disable features based on credit availability
4. **Consumption**: Deduct credits when feature is used
5. **Purchase Prompt**: Guide users to purchase when insufficient
6. **Transaction Tracking**: Record all credit transactions

### Integration Points

- **Credits Repository**: `src/domains/wallet/infrastructure/repositories/CreditsRepository.ts`
- **Credits Entity**: `src/domains/wallet/domain/entities/UserCredits.ts`
- **TanStack Query**: For optimistic updates and caching
- **Paywall Domain**: For purchase flow integration

## Restrictions

### REQUIRED

- **Credit Cost**: MUST specify credit cost for feature
- **Feature ID**: MUST provide unique feature identifier
- **Balance Check**: MUST verify hasCredits before allowing action
- **Error Handling**: MUST handle consumption failures

### PROHIBITED

- **NEVER** allow feature access when hasCredits is false
- **NEVER** consume credits without checking balance first
- **NEVER** assume credits will be sufficient (always check)
- **DO NOT** use for security decisions without server validation

### CRITICAL SAFETY

- **ALWAYS** check return value from consumeCredit
- **NEVER** allow negative credit balance
- **MUST** handle insufficient credits gracefully
- **ALWAYS** show credit cost to user before action

## AI Agent Guidelines

### When Implementing Credit Gates

1. **Always** display credit cost to user before action
2. **Always** check hasCredits before enabling buttons
3. **Always** handle consumeCredit result
4. **Never** allow action when credits are insufficient
5. **Always** provide purchase path for credits

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Specify credit cost in config
- [ ] Provide unique feature ID
- [ ] Check hasCredits before enabling feature
- [ ] Handle consumeCredit result
- [ ] Show credit cost in UI
- [ ] Display current balance
- [ ] Implement purchase prompt for insufficient credits
- [ ] Test with zero balance
- [ ] Test with insufficient credits
- [ ] Test with sufficient credits

### Common Patterns

1. **Pre-check**: Verify balance before showing feature
2. **Confirmation**: Ask user before expensive operations
3. **Success Feedback**: Show message after successful consumption
4. **Failure Handling**: Display appropriate error on failure
5. **Purchase Flow**: Navigate to purchase screen on exhaustion

## Related Documentation

- **useCredits**: Access current credit balance
- **useDeductCredit**: Manual credit deduction with optimistic updates
- **useCreditChecker**: Simple credit validation
- **usePremiumWithCredits**: Hybrid premium/credits access
- **useFeatureGate**: Unified feature gating
- **Credits Repository**: `src/domains/wallet/infrastructure/repositories/README.md`
- **Wallet Domain**: `src/domains/wallet/README.md`
