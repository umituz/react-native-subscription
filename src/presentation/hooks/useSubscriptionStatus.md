# useSubscriptionStatus Hook

Hook for accessing detailed subscription status information.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useSubscriptionStatus.ts`

**Type**: Hook

## Strategy

### Subscription Status Flow

1. **Status Fetch**: Retrieve current subscription status from repository
2. **Status Parsing**: Extract tier, active state, expiration info
3. **Real-time Updates**: Update when subscription changes
4. **Expiration Tracking**: Calculate days until expiration
5. **Renewal Status**: Determine if subscription will auto-renew
6. **Caching**: Cache status for performance (5 min default)

### Integration Points

- **Subscription Repository**: `src/infrastructure/repositories/SubscriptionRepository.ts`
- **SubscriptionStatus Entity**: `src/domain/entities/README.md`
- **TanStack Query**: For caching and real-time updates
- **RevenueCat**: For subscription data source

## Restrictions

### REQUIRED

- **Loading State**: MUST handle loading state
- **Error Handling**: MUST handle error state
- **Null Check**: MUST handle null status (guest users)
- **Expiration**: SHOULD warn users before expiration

### PROHIBITED

- **NEVER** assume status exists (check for null)
- **NEVER** use for security decisions without server validation
- **DO NOT** show expiration for lifetime subscriptions
- **DO NOT** cache beyond configured time

### CRITICAL SAFETY

- **ALWAYS** check if status is null before accessing properties
- **NEVER** trust client-side status for security
- **MUST** implement error boundaries
- **ALWAYS** refresh status when app comes to foreground

## AI Agent Guidelines

### When Displaying Subscription Info

1. **Always** check for null status (guest users)
2. **Always** handle loading and error states
3. **Always** show expiration warnings
4. **Always** display auto-renewal status
5. **Never** show technical details to end users

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Check for null status (guest users)
- [ ] Display subscription tier
- [ ] Show expiration date
- [ ] Show days until expiration
- [ ] Show auto-renewal status
- [ ] Implement expiration warnings
- [ ] Test with active subscription
- [ ] Test with expired subscription
- [ ] Test with guest user (null status)

### Common Patterns

1. **Status Badge**: Visual indicator of subscription status
2. **Expiration Countdown**: Days remaining until expiration
3. **Warning System**: Notify users before expiration
4. **Detail Card**: Comprehensive subscription information
5. **Lifecycle Management**: Handle subscription events

## Related Documentation

- **usePremium**: Simple premium status check
- **useSubscription**: Detailed subscription information
- **useSubscriptionDetails**: Package and feature details
- **useUserTier**: Tier information
- **SubscriptionStatus Entity**: `src/domain/entities/README.md`
- **Subscription Repository**: `src/infrastructure/repositories/README.md`
