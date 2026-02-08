# usePremium Hook

Hook for checking and managing premium subscription status.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/usePremium.ts`

**Type**: Hook

## Strategy

### Premium Status Flow

1. **Initial Check**: Fetch current subscription status from repository
2. **Status Evaluation**: Determine if user has active premium subscription
3. **Real-time Updates**: Automatically update when user logs in/out or subscription changes
4. **Caching**: Cache status for 5 minutes (configurable) to reduce API calls
5. **Loading States**: Provide loading indicators during data fetch
6. **Error Handling**: Handle fetch errors gracefully

### Integration Points

- **Subscription Repository**: `src/infrastructure/repositories/SubscriptionRepository.ts`
- **TanStack Query**: For caching and real-time updates
- **Auth Context**: Sync with user authentication state
- **RevenueCat**: For subscription data source

## Restrictions

### REQUIRED

- **Loading State**: MUST handle loading state in UI
- **Error Handling**: MUST handle error state
- **Check Before Access**: MUST verify isPremium before showing premium features

### PROHIBITED

- **NEVER** use for security decisions (server-side validation required)
- **NEVER** assume instant data availability (always check loading state)
- **DO NOT** use for anonymous users without proper handling

### CRITICAL SAFETY

- **ALWAYS** handle loading state before rendering premium content
- **NEVER** trust client-side state for security enforcement
- **MUST** implement error boundaries when using this hook

## AI Agent Guidelines

### When Implementing Premium Features

1. **Always** check loading state first
2. **Always** handle error state
3. **Always** verify isPremium before showing premium content
4. **Never** use for security decisions without server validation
5. **Always** provide upgrade path for non-premium users

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Handle loading state (show ActivityIndicator or skeleton)
- [ ] Handle error state (show error message)
- [ ] Check isPremium before rendering premium content
- [ ] Provide upgrade path for free users
- [ ] Test with premium user
- [ ] Test with free user
- [ ] Test with anonymous user
- [ ] Test offline scenario

### Common Patterns

1. **Conditional Rendering**: Show/hide features based on isPremium
2. **Premium Badge**: Display premium status badge
3. **Feature Gating**: Use usePremiumGate instead of manual checks
4. **Status Display**: Show subscription details with useSubscriptionDetails
5. **Upgrade Prompts**: Guide free users to paywall

## Related Documentation

- **usePremiumGate**: Gating premium features
- **useSubscription**: Detailed subscription status
- **useSubscriptionStatus**: Subscription status details
- **usePremiumWithCredits**: Hybrid premium/credits access
- **Subscription Repository**: `src/infrastructure/repositories/README.md`
- **Domain Layer**: `src/domain/README.md`
