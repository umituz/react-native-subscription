# useCreditChecker Hook

Simple hook for checking if user has sufficient credits before operations.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useCreditChecker.ts`

**Type**: Hook

## Strategy

### Credit Validation Flow

1. **Initial Check**
   - Compare current balance against required amount
   - Return boolean result immediately
   - No network calls required (uses cached balance)

2. **Real-time Updates**
   - Automatically re-checks when credits change
   - Updates result via `useCredits` hook
   - Triggers re-renders on balance changes

3. **Manual Refresh**
   - Optionally trigger manual credit check
   - Useful before expensive operations
   - Validates current state before action

### Integration Points

- **useCredits**: For fetching current credit balance
- **useDeductCredit**: For deducting credits after check
- **Credit Checking UI**: Pre-action validation displays
- **Purchase Flows**: Redirect to credit packages

## Restrictions

### REQUIRED

- **Required Amount**: MUST specify positive credit cost
- **Balance Check**: MUST verify `hasEnoughCredits` before action
- **User Feedback**: MUST show credit cost to user

### PROHIBITED

- **NEVER** assume credits are sufficient without checking
- **NEVER** use for security decisions (server-side validation required)
- **DO NOT** deduct credits with this hook (use `useDeductCredit`)
- **NEVER** hardcode credit costs (should be configurable)

### CRITICAL SAFETY

- **ALWAYS** check return value before proceeding with action
- **ALWAYS** show credit cost to user before execution
- **NEVER** trust client-side check for security (server must validate)
- **MUST** handle case where credits become insufficient between check and action

## AI Agent Guidelines

### When Implementing Credit Checks

1. **Always** specify positive credit cost
2. **Always** check `hasEnoughCredits` before action
3. **Always** show credit cost to user in UI
4. **Always** provide upgrade path when insufficient
5. **Never** use for security decisions (server validation required)

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Specify positive credit cost
- [ ] Check `hasEnoughCredits` before action
- [ ] Display credit cost to user
- [ ] Show upgrade/purchase option when insufficient
- [ ] Validate credit cost is positive number
- [ ] Test with sufficient credits
- [ ] Test with insufficient credits
- [ ] Test with zero credits
- [ ] Test credit changes between check and action

### Common Patterns to Implement

1. **Pre-action Validation**: Check before showing button
2. **Cost Display**: Always show credit cost to user
3. **Upgrade Prompts**: Link to credit packages when low
4. **Manual Refresh**: Check again before expensive operations
5. **Credit Deduction**: Use with `useDeductCredit` for complete flow
6. **Visual Feedback**: Disable buttons when insufficient
7. **Warning Messages**: Alert user before high-cost operations
8. **Balance Display**: Show current balance alongside cost

## Related Documentation

- **useCredits**: Access current credit balance
- **useDeductCredit**: Deduct credits after check passes
- **useCreditsGate**: Complete credit gating with deduction
- **useFeatureGate**: Unified feature gating with credits
- **Credits Repository**: `src/domains/wallet/infrastructure/repositories/README.md`
- **Wallet Domain**: `src/domains/wallet/README.md`
