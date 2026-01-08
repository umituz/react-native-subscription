# useInitializeCredits Hook

TanStack Query mutation hook for initializing credits after purchase.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useInitializeCredits.ts`

**Type**: Hook

## Strategy

### Credit Initialization Flow

1. **User Validation**: Verify user is authenticated before initialization
2. **Repository Call**: Call credits repository to initialize credits
3. **Duplicate Protection**: Repository prevents duplicate initialization with same purchase ID
4. **Loading State**: Track initialization progress with isInitializing flag
5. **Error Handling**: Handle and report initialization failures
6. **Success Tracking**: Return success boolean for caller to handle

### Integration Points

- **Credits Repository**: `src/domains/wallet/infrastructure/repositories/CreditsRepository.ts`
- **Credits Entity**: `src/domains/wallet/domain/entities/UserCredits.ts`
- **TanStack Query**: For mutation and optimistic updates
- **Purchase Flow**: Called after successful subscription purchase

## Restrictions

### REQUIRED

- **User ID**: MUST provide valid userId parameter
- **Authentication**: User MUST be authenticated
- **Error Handling**: MUST handle initialization failures
- **Loading State**: MUST show loading indicator during initialization

### PROHIBITED

- **NEVER** initialize credits without valid userId
- **NEVER** call for unauthenticated users
- **DO NOT** assume successful initialization (check return value)
- **DO NOT** call excessively (repository handles duplicates)

### CRITICAL SAFETY

- **ALWAYS** validate userId before initialization
- **MUST** handle errors gracefully
- **ALWAYS** check return value
- **NEVER** rely on side effects without checking success

## AI Agent Guidelines

### When Implementing Credit Initialization

1. **Always** validate userId before calling initializeCredits
2. **Always** handle loading state
3. **Always** check return value
4. **Always** provide purchaseId and productId when available
5. **Never** initialize credits for unauthenticated users

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Validate userId is not undefined
- [ ] Handle isInitializing state
- [ ] Check return value from initializeCredits
- [ ] Provide purchaseId when available
- [ ] Provide productId when available
- [ ] Test with premium user (no existing credits)
- [ ] Test with premium user (existing credits)
- [ ] Test duplicate protection
- [ ] Test error scenarios

### Common Patterns

1. **Post-Purchase Init**: Initialize after successful purchase
2. **Auto-Init for Premium**: Automatically initialize for premium users without credits
3. **Product-Specific Allocation**: Different products provide different credit amounts
4. **Retry Logic**: Implement retry mechanism on failure
5. **Admin Init**: Manual initialization for admin users

## Related Documentation

- **useCredits**: For accessing credits balance
- **useDeductCredit**: For deducting credits
- **usePremiumWithCredits**: For premium + credits integration
- **useDevTestCallbacks**: For testing credit initialization
- **Credits Repository**: `src/domains/wallet/infrastructure/repositories/README.md`
- **Wallet Domain**: `src/domains/wallet/README.md`
