# useAuthSubscriptionSync Hook

Automatically synchronizes subscription state with authentication changes.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useAuthSubscriptionSync.ts`

**Type**: Hook

## Strategy

### Auth-Subscription Synchronization

1. **Auth Listener Setup**: Subscribe to auth state changes via provided callback
2. **User Change Detection**: Detect when userId changes (including sign out)
3. **Subscription Initialization**: Initialize subscription when user signs in
4. **One-Time Init**: Only initialize once per user session (skips duplicates)
5. **User Switching**: Re-initialize when switching between accounts
6. **Cleanup**: Unsubscribe from auth listener on unmount

### Integration Points

- **Auth Provider**: Any auth system (Firebase, Auth0, custom)
- **RevenueCat**: For subscription initialization with logIn
- **Subscription Service**: Backend subscription sync
- **Credits System**: Optional credits initialization
- **App Root**: Should be placed in root App component

## Restrictions

### REQUIRED

- **Auth State Change Callback**: MUST provide onAuthStateChanged function
- **Subscription Init**: MUST provide initializeSubscription function
- **App Root Setup**: SHOULD be placed in root App component
- **Unsubscribe Handling**: Callback MUST return unsubscribe function

### PROHIBITED

- **NEVER** place in individual screen components (use app root)
- **NEVER** call without proper auth callback
- **DO NOT** manually call initializeSubscription (hook handles it)
- **DO NOT** configure multiple times (one-time setup)

### CRITICAL SAFETY

- **ALWAYS** configure at app root level
- **MUST** handle user switching correctly
- **ALWAYS** return unsubscribe function from callback
- **NEVER** rely on manual subscription initialization

## AI Agent Guidelines

### When Implementing Auth-Subscription Sync

1. **Always** place in root App component
2. **Always** provide onAuthStateChanged that returns unsubscribe
3. **Always** provide initializeSubscription for user ID
4. **Always** test user switching scenarios
5. **Never** place in child components

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Place in root App component
- [ ] Provide onAuthStateChanged callback
- [ ] Ensure callback returns unsubscribe function
- [ ] Provide initializeSubscription function
- [ ] Test with initial user sign-in
- [ ] Test with user sign-out
- [ ] Test with account switching
- [ ] Verify subscription initializes only once per user
- [ ] Test cleanup on unmount

### Common Patterns

1. **Firebase + RevenueCat**: Sync Firebase auth with RevenueCat
2. **Custom Auth + Backend**: Use custom auth with backend sync
3. **Multi-Service Setup**: Initialize multiple services (RevenueCat, credits, backend)
4. **Error Handling**: Handle initialization failures gracefully
5. **Loading State**: Show loading during sync
6. **Analytics Tracking**: Track auth and subscription events

## Related Documentation

- **useAuth**: For authentication state
- **usePremium**: For subscription status
- **useAuthAwarePurchase**: For auth-gated purchases
- **useUserTier**: For tier determination
- **Auth Integration Guide**: `src/docs/AUTH_INTEGRATION.md`
- **RevenueCat Setup**: `src/docs/REVENUECAT_SETUP.md`
