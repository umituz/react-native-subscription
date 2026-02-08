# Subscription Hooks

Collection of React hooks for subscription, premium, and credits management.

## Location

**Import Path**: `@umituz/react-native-subscription`

**Directory**: `src/presentation/hooks/`

**Type**: Hooks Collection

## Strategy

### Hook Organization

Hooks are organized by functionality:

1. **Subscription Hooks**: Manage subscription status and details
2. **Premium Hooks**: Check and manage premium access
3. **Credits Hooks**: Handle credit balance and operations
4. **Gate Hooks**: Control feature access based on user state
5. **Auth Hooks**: Authentication-aware purchase flows
6. **Paywall Hooks**: Paywall display and management

### Integration Pattern

All hooks follow consistent patterns:
- Return loading, error, and data states
- Provide refetch/refresh functions
- Use TanStack Query for caching
- Handle optimistic updates
- Support real-time updates

## Hook Categories

### Subscription Hooks

- **useSubscription**: Core subscription status management
- **useSubscriptionStatus**: Detailed subscription status
- **useSubscriptionDetails**: Subscription package and feature details
- **useSubscriptionSettingsConfig**: Settings and configuration

### Premium Hooks

- **usePremium**: Premium status checker
- **usePremiumGate**: Premium feature gating
- **usePremiumWithCredits**: Hybrid premium/credits access

### Credits Hooks

- **useCredits**: Credit balance and transactions
- **useCreditChecker**: Simple credit validation
- **useDeductCredit**: Credit deduction with optimistic updates
- **useInitializeCredits**: Initialize credits after purchase

### Gate Hooks

- **useFeatureGate**: Unified auth, subscription, and credits gating
- **useSubscriptionGate**: Subscription-only gating
- **useCreditsGate**: Credits-only gating
- **usePremiumGate**: Premium-only gating
- **useAuthGate**: Authentication gating

### Auth Hooks

- **useAuthAwarePurchase**: Authentication-aware purchase flow
- **useAuthSubscriptionSync**: Auth and subscription synchronization

### Paywall Hooks

- **usePaywall**: Paywall display management
- **usePaywallOperations**: Paywall show/hide operations
- **usePaywallVisibility**: Paywall visibility rules

### User Tier Hooks

- **useUserTier**: User tier management
- **useUserTierWithRepository**: Repository-based tier management

### Development Hooks

- **useDevTestCallbacks**: Development and testing utilities

## Restrictions

### REQUIRED

- **Import Path**: MUST import from `@umituz/react-native-subscription`
- **Loading States**: MUST handle loading state in UI
- **Error Handling**: MUST handle error state
- **User Authentication**: Most hooks require authenticated user

### PROHIBITED

- **NEVER** use hooks outside React components
- **NEVER** ignore loading states
- **NEVER** skip error handling
- **DO NOT** use hook returns for security decisions (server-side validation required)

### CRITICAL SAFETY

- **ALWAYS** handle loading and error states
- **NEVER** trust client-side state for security
- **MUST** implement error boundaries
- **ALWAYS** test with various user states (anonymous, free, premium)

## AI Agent Guidelines

### When Using Subscription Hooks

1. **Always** handle loading and error states
2. **Always** use appropriate gate hooks for feature access
3. **Always** provide user feedback for all operations
4. **Never** trust client-side state for security
5. **Always** test with different user tiers

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Choose appropriate hook for use case
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Implement error boundaries
- [ ] Use gate hooks for feature access
- [ ] Test with all user tiers
- [ ] Test offline scenarios
- [ ] Test error scenarios

### Common Patterns

1. **Feature Gating**: Use `useFeatureGate` for unified access control
2. **Credit Operations**: Check → Deduct → Execute pattern
3. **Subscription Display**: Show status, expiration, renewal info
4. **Premium Features**: Gate content, provide upgrade path
5. **Paywall Integration**: Automatic display on access denial
6. **Real-time Updates**: Refresh on focus, background sync

## Related Documentation

- **Subscription Domain**: `src/domains/wallet/README.md`
- **Paywall Domain**: `src/domains/paywall/README.md`
- **Config Domain**: `src/domains/config/README.md`
- **RevenueCat Integration**: `src/revenuecat/README.md`
- **Presentation Components**: `src/presentation/components/README.md`

## Individual Hook Documentation

- [useDeductCredit](./useDeductCredit.md) - Credit deduction with optimistic updates
- [useCredits](./useCredits.md) - Credit balance access
- [useCreditChecker](./useCreditChecker.md) - Simple credit validation
- [useFeatureGate](./useFeatureGate.md) - Unified feature gating
- [useSubscription](./useSubscription.md) - Subscription status management
- [usePremium](./usePremium.md) - Premium status checker
- [useCreditsGate](./useCreditsGate.md) - Credits-based feature gating
- [useInitializeCredits](./useInitializeCredits.md) - Initialize credits after purchase
