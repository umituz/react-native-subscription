# useAuthAwarePurchase Hook

Security-focused purchase hook that requires authentication before any transaction.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useAuthAwarePurchase.ts`

**Type**: Hook

## Strategy

### Auth-Gated Purchase Flow

1. **Auth Provider Validation**: Verify auth provider is configured at app startup
2. **Authentication Check**: Block purchases for unauthenticated users
3. **Auth Flow Trigger**: Show auth modal when guest attempts purchase
4. **Purchase Blocking**: Prevent all transactions without valid authentication
5. **Post-Auth Purchase**: Allow purchase after user completes authentication
6. **Security Enforcement**: Server-side validation required for final verification

### Integration Points

- **Auth Provider Configuration**: Must be configured once at app initialization
- **Auth Context**: User authentication state
- **Paywall Domain**: For subscription upgrade flow
- **Auth UI**: For sign-in/sign-up flows
- **RevenueCat**: For purchase transactions

## Restrictions

### REQUIRED

- **Auth Provider Configuration**: MUST call `configureAuthProvider()` once at app startup
- **isAuthenticated Function**: MUST provide function to check auth status
- **showAuthModal Function**: MUST provide function to show auth UI
- **Error Handling**: MUST handle purchase failures appropriately

### PROHIBITED

- **NEVER** use without configuring auth provider first
- **NEVER** bypass auth checks for convenience
- **NEVER** allow anonymous/guest purchases
- **DO NOT** call handlePurchase/handleRestore without auth provider setup

### CRITICAL SAFETY

- **ALWAYS** configure auth provider at app initialization
- **NEVER** allow purchases for anonymous users
- **MUST** implement proper auth flow with pending purchase preservation
- **ALWAYS** verify auth status in production

## AI Agent Guidelines

### When Implementing Auth-Gated Purchases

1. **Always** configure auth provider at app startup
2. **Always** implement isAuthenticated function
3. **Always** implement showAuthModal function
4. **Never** bypass auth checks
5. **Always** test purchase flow with authenticated and unauthenticated users

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Call `configureAuthProvider()` once at app startup
- [ ] Provide `isAuthenticated()` function
- [ ] Provide `showAuthModal()` function
- [ ] Test purchase flow with authenticated user
- [ ] Test purchase flow with unauthenticated user
- [ ] Verify auth modal appears for guests
- [ ] Verify purchase proceeds after authentication
- [ ] Check development logs for auth verification
- [ ] Verify purchases are blocked without auth provider

### Common Patterns

1. **App-Level Config**: Configure once in root App component
2. **Pending Purchase**: Store package for post-auth completion
3. **Auth Integration**: Use with Firebase, Auth0, or custom auth
4. **Error Handling**: Handle auth failures and purchase failures
5. **Development Testing**: Use dev logs to verify auth checks

## Related Documentation

- **usePremium**: For purchase and restore operations
- **usePaywallOperations**: For complete paywall purchase handling
- **useAuthGate**: For authentication gating
- **useAuthSubscriptionSync**: For syncing auth with subscription
- **Security Best Practices**: `src/docs/SECURITY.md`
