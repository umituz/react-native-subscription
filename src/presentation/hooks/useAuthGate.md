# useAuthGate Hook

Hook for combining authentication and subscription gating.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useAuthGate.ts`

**Type**: Hook

## Strategy

### Auth Gate Flow

1. **Authentication Check**: Verify if user is authenticated
2. **Subscription Check**: Verify if user has required subscription
3. **Authorization Evaluation**: Combine auth + subscription status
4. **Gate Actions**: Provide functions to gate features
5. **Sign In Flow**: Trigger authentication when required
6. **Upgrade Flow**: Trigger subscription when required

### Integration Points

- **Auth Context**: User authentication state
- **Subscription Repository**: `src/infrastructure/repositories/SubscriptionRepository.ts`
- **Paywall Domain**: For subscription upgrade flow
- **Auth UI**: For sign-in/sign-up flows

## Restrictions

### REQUIRED

- **Loading State**: MUST handle loading state
- **Authorization Check**: MUST verify isAuthorized before showing protected content
- **Callback Implementation**: MUST implement onAuthRequired/onSubscriptionRequired callbacks

### PROHIBITED

- **NEVER** show protected content without checking isAuthorized
- **NEVER** use for security decisions without server validation
- **DO NOT** assume user is authenticated or subscribed

### CRITICAL SAFETY

- **ALWAYS** check isAuthorized before showing protected features
- **NEVER** trust client-side state for security
- **MUST** implement proper auth flow
- **ALWAYS** handle all states (loading, authorized, unauthorized)

## AI Agent Guidelines

### When Implementing Auth Gates

1. **Always** check loading state first
2. **Always** verify isAuthorized before showing content
3. **Always** provide sign-in option for unauthenticated users
4. **Always** provide upgrade option for non-subscribed users
5. **Never** bypass auth checks for convenience

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Configure requireAuth and requireSubscription
- [ ] Handle loading state
- [ ] Check isAuthorized before showing content
- [ ] Implement sign-in callback
- [ ] Implement subscription upgrade callback
- [ ] Test with unauthenticated user
- [ ] Test with authenticated non-subscribed user
- [ ] Test with authenticated subscribed user
- [ ] Test loading states

### Common Patterns

1. **Auth Only**: Require authentication only
2. **Subscription Only**: Require subscription only (auth handled internally)
3. **Both**: Require both auth and subscription
4. **Conditional Gates**: Different requirements per feature
5. **Nested Gates**: Layer multiple gate conditions

## Related Documentation

- **useAuth**: Authentication state
- **usePremiumGate**: Premium-only gating
- **useSubscriptionGate**: Subscription-only gating
- **useFeatureGate**: Unified feature gating
- **Auth Domain**: `src/domains/config/README.md`
