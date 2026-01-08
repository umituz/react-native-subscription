# useUserTierWithRepository Hook

Automatically fetches premium status and provides tier information with repository integration.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useUserTierWithRepository.ts`

**Type**: Hook

## Strategy

### Tier Determination with Repository

1. **Auth State Check**: Use provided auth provider to check authentication
2. **Premium Fetch**: Automatically fetch premium status from repository for authenticated users
3. **Tier Assignment**: Assign tier based on auth + subscription (guest/freemium/premium)
4. **Abort Control**: Use AbortController to prevent race conditions on rapid user changes
5. **Guest Optimization**: Skip repository fetch for guest users (no fetch needed)
6. **Real-time Updates**: React to auth state changes

### Integration Points

- **Auth Provider**: Custom auth provider with user state
- **Subscription Repository**: `src/infrastructure/repositories/SubscriptionRepository.ts`
- **Domain Layer**: `src/domain/entities/README.md`
- **TanStack Query**: For caching and real-time updates

## Restrictions

### REQUIRED

- **Auth Provider**: MUST provide valid auth provider object
- **Repository**: MUST provide subscription repository
- **Loading State**: MUST handle loading state
- **Error Handling**: MUST handle error state

### PROHIBITED

- **NEVER** call without valid auth provider
- **NEVER** call without valid repository
- **DO NOT** hardcode tier values (use hook return values)
- **DO NOT** assume instant data availability

### CRITICAL SAFETY

- **ALWAYS** check loading state before using tier values
- **NEVER** trust client-side tier for security enforcement
- **MUST** provide valid auth provider structure
- **ALWAYS** handle tier transitions gracefully

## AI Agent Guidelines

### When Implementing Tier Determination

1. **Always** provide valid auth provider with user, isGuest, isAuthenticated
2. **Always** provide valid subscription repository
3. **Always** handle loading state
4. **Always** handle error state
5. **Never** use for security decisions without server validation

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide valid auth provider object
- [ ] Provide valid subscription repository
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Use refresh() when needed
- [ ] Test with guest user
- [ ] Test with freemium user
- [ ] Test with premium user
- [ ] Test user switching scenarios

### Common Patterns

1. **Auth Provider Setup**: Use with Firebase, custom auth, or auth library
2. **Tier-Based UI**: Show different features based on tier
3. **Navigation Guards**: Redirect based on tier requirements
4. **Tier Monitoring**: Track tier changes for analytics
5. **Manual Refresh**: Call refresh() after subscription changes

## Related Documentation

- **useUserTier**: Tier logic without repository
- **usePremium**: Premium status checking
- **useAuthGate**: Authentication gating
- **useSubscription**: Subscription details
- **Repository Pattern**: `src/infrastructure/repositories/README.md`
- **User Tier Utils**: `src/utils/README.md`
