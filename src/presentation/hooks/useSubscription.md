# useSubscription Hook

Core hook for subscription status management and operations.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useSubscription.ts`

**Type**: Hook

## Strategy

### Subscription Management Flow

1. **Status Retrieval**: Fetch current subscription status from repository
2. **State Caching**: Cache status for 5 minutes using TanStack Query
3. **Real-time Updates**: Auto-refresh when user auth state changes
4. **Manual Operations**: Provide functions for manual activation/deactivation
5. **Loading States**: Handle loading and error states properly
6. **Refresh Mechanisms**: Support both load and refresh operations

### Integration Points

- **Subscription Repository**: `src/infrastructure/repositories/SubscriptionRepository.ts`
- **TanStack Query**: For caching and background updates
- **Auth Context**: Sync with user authentication state
- **RevenueCat**: For subscription data source

## Restrictions

### REQUIRED

- **User ID**: MUST provide valid userId for operations
- **Loading State**: MUST handle loading state in UI
- **Error Handling**: MUST handle error state
- **Status Check**: MUST verify isPremium before showing premium features

### PROHIBITED

- **NEVER** assume instant data availability (always check loading state)
- **NEVER** use for security decisions without server validation
- **DO NOT** call loadStatus/refreshStatus without userId
- **DO NOT** activate/deactivate subscriptions without proper validation

### CRITICAL SAFETY

- **ALWAYS** check loading state before accessing status
- **NEVER** trust client-side state for security enforcement
- **MUST** validate userId before all operations
- **ALWAYS** handle errors gracefully

## AI Agent Guidelines

### When Implementing Subscription Features

1. **Always** check loading state before rendering subscription data
2. **Always** handle error state
3. **Always** verify isPremium before showing premium features
4. **Always** validate userId before operations
5. **Never** use for security decisions without server validation

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Check isPremium before rendering premium content
- [ ] Validate userId before operations
- [ ] Implement refresh mechanism
- [ ] Test with premium user
- [ ] Test with free user
- [ ] Test with guest user
- [ ] Test offline scenario

### Common Patterns

1. **Status Display**: Show current subscription status
2. **Conditional Rendering**: Show/hide features based on isPremium
3. **Manual Refresh**: Provide refresh button for users
4. **Auto-refresh**: Refresh on screen focus or app foreground
5. **Status Polling**: Periodic refresh for real-time updates
6. **Purchase Completion**: Refresh after successful purchase
7. **Error Recovery**: Provide retry mechanism on failure

## Related Documentation

- **usePremium**: Simplified premium checking
- **useSubscriptionStatus**: Detailed subscription status
- **useSubscriptionDetails**: Package and pricing info
- **useUserTier**: Tier information
- **Subscription Repository**: `src/infrastructure/repositories/README.md`
- **Domain Layer**: `src/domain/README.md`
