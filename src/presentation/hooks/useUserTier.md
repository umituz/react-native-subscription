# useUserTier Hook

Hook for determining and tracking user tier (guest, free, premium).

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useUserTier.ts`

**Type**: Hook

## Strategy

### Tier Determination Flow

1. **Auth State Check**: Determine if user is authenticated
2. **Subscription Check**: Verify active subscription status
3. **Tier Assignment**: Assign tier based on auth + subscription
4. **Real-time Updates**: Update tier when auth or subscription changes
5. **Caching**: Cache tier status for performance
6. **Transition Tracking**: Monitor and track tier changes

### Integration Points

- **Auth Context**: User authentication state
- **Subscription Repository**: `src/infrastructure/repositories/SubscriptionRepository.ts`
- **Domain Layer**: `src/domain/entities/README.md`
- **TanStack Query**: For caching and real-time updates

## Restrictions

### REQUIRED

- **Tier Handling**: MUST handle all three tiers (guest, free, premium)
- **Loading State**: MUST handle loading state
- **Auth Integration**: MUST sync with authentication state
- **Guest Support**: MUST support unauthenticated users

### PROHIBITED

- **NEVER** assume user is authenticated (check isGuest)
- **NEVER** use for security decisions without server validation
- **DO NOT** hardcode tier values (use hook return values)

### CRITICAL SAFETY

- **ALWAYS** check loading state before using tier values
- **NEVER** trust client-side tier for security enforcement
- **MUST** handle tier transitions gracefully
- **ALWAYS** test with all three tier types

## AI Agent Guidelines

### When Implementing Tier-Based Features

1. **Always** handle loading state before checking tier
2. **Always** handle all three tiers (guest, free, premium)
3. **Always** provide upgrade path for free users
4. **Never** show features to guests that require auth
5. **Always** track tier changes in analytics

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Handle loading state
- [ ] Implement logic for guest users
- [ ] Implement logic for free users
- [ ] Implement logic for premium users
- [ ] Provide upgrade prompts for free users
- [ ] Provide auth prompts for guest users
- [ ] Test tier transitions (guest → free → premium)
- [ ] Test tier downgrade (premium → free)
- [ ] Track tier changes in analytics

### Common Patterns

1. **Conditional Rendering**: Show/hide features based on tier
2. **Navigation Guards**: Redirect based on tier requirements
3. **Feature Flags**: Enable features per tier
4. **Progress Indicators**: Show tier progression
5. **Upgrade Prompts**: Guide users to higher tiers

## Related Documentation

- **useAuth**: Authentication state
- **usePremium**: Premium subscription check
- **useSubscription**: Detailed subscription information
- **useAuthGate**: Authentication and subscription gating
- **Domain Entities**: `src/domain/entities/README.md`
- **User Tier Utils**: `src/utils/README.md`
