# usePaywallOperations Hook

Complete paywall purchase operations with authentication handling.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/usePaywallOperations.ts`

**Type**: Hook

## Strategy

### Paywall Purchase Flow with Auth

1. **Auth Check**: Verify if user is authenticated before purchase
2. **Pending Package Management**: Store package when auth is required
3. **Auth Flow Trigger**: Show auth modal for unauthenticated users
4. **Purchase Execution**: Complete purchase after authentication
5. **Restore Support**: Handle purchase restoration with auth check
6. **Callback Handling**: Execute appropriate callbacks at each stage

### Integration Points

- **usePremium**: For purchase and restore operations
- **Auth Context**: User authentication state
- **Paywall Domain**: For paywall display and management
- **Auth UI**: For authentication modal
- **RevenueCat**: For purchase transactions

## Restrictions

### REQUIRED

- **User ID**: MUST provide valid userId parameter
- **Anonymous Check**: MUST provide isAnonymous parameter
- **Auth Required Callback**: MUST implement onAuthRequired callback
- **Error Handling**: MUST handle purchase failures

### PROHIBITED

- **NEVER** call without valid userId
- **NEVER** call without isAnonymous parameter
- **DO NOT** proceed with purchase without auth check
- **DO NOT** ignore pending package state

### CRITICAL SAFETY

- **ALWAYS** check authentication status before purchase
- **MUST** handle pending package after auth
- **ALWAYS** provide clear auth flow for users
- **NEVER** allow anonymous purchases without auth

## AI Agent Guidelines

### When Implementing Paywall Operations

1. **Always** provide valid userId
2. **Always** provide isAnonymous status
3. **Always** implement onAuthRequired with pending package handling
4. **Always** implement onPurchaseSuccess callback
5. **Always** handle purchase and restore failures

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide valid userId
- [ ] Provide isAnonymous status
- [ ] Implement onAuthRequired callback
- [ ] Implement onPurchaseSuccess callback
- [ ] Implement onPaywallClose callback
- [ ] Handle pending package state
- [ ] Test purchase with authenticated user
- [ ] Test purchase with anonymous user
- [ ] Test purchase flow after authentication

### Common Patterns

1. **Pending Purchase Flow**: Store package, show auth, complete purchase
2. **In-App Purchases**: Use handleInAppPurchase for modal paywalls
3. **Purchase Analytics**: Track purchase attempts and completions
4. **Error Recovery**: Handle failures and provide retry options
5. **Post-Onboarding**: Handle purchases after onboarding flow

## Related Documentation

- **usePremium**: For purchase and restore operations
- **useAuthAwarePurchase**: For auth-gated purchases
- **usePaywallVisibility**: For paywall visibility control
- **Paywall Screen**: `src/presentation/screens/README.md`
- **Purchase Flow**: `src/docs/PURCHASE_FLOW.md`
