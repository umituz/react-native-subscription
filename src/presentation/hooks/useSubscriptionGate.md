# useSubscriptionGate Hook

Subscription-only feature gating with simple, focused API.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useSubscriptionGate.ts`

**Type**: Hook

## Strategy

### Subscription Gating Flow

1. **Subscription Check**: Verify if user has active subscription
2. **Gate Function**: Provide requireSubscription function for gating
3. **Action Wrapping**: Wrap actions behind subscription check
4. **Callback Trigger**: Execute callback when subscription is required
5. **Boolean Access**: Provide simple hasSubscription boolean for conditional rendering

### Integration Points

- **usePremium**: For subscription status check
- **Paywall Domain**: For subscription upgrade flow
- **Feature Gates**: For unified feature access control

## Restrictions

### REQUIRED

- **Subscription Status**: MUST provide hasSubscription parameter
- **Callback**: MUST implement onSubscriptionRequired callback
- **Return Check**: SHOULD check return value from requireSubscription

### PROHIBITED

- **NEVER** show protected content without checking hasSubscription
- **NEVER** use for security decisions without server validation
- **DO NOT** assume subscription status (always verify)

### CRITICAL SAFETY

- **ALWAYS** verify hasSubscription before allowing access
- **NEVER** trust client-side state for security
- **MUST** implement proper upgrade flow
- **ALWAYS** handle both subscribed and non-subscribed states

## AI Agent Guidelines

### When Implementing Subscription Gates

1. **Always** check hasSubscription before showing protected content
2. **Always** provide clear upgrade path in callback
3. **Always** use requireSubscription for action gating
4. **Never** bypass subscription checks
5. **Always** test with both subscribed and non-subscribed users

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide hasSubscription from usePremium
- [ ] Implement onSubscriptionRequired callback
- [ ] Use requireSubscription for action gating
- [ ] Check hasSubscription for conditional rendering
- [ ] Test with subscribed user
- [ ] Test with non-subscribed user
- [ ] Verify upgrade flow triggers correctly

### Common Patterns

1. **Action Gating**: Use requireSubscription to wrap actions
2. **Conditional Rendering**: Check hasSubscription for UI
3. **Button States**: Disable buttons when not subscribed
4. **Upgrade Prompts**: Show in callback when not subscribed

## Related Documentation

- **usePremium**: Subscription status check
- **usePremiumGate**: Premium feature gating
- **useAuthGate**: Auth + subscription gating
- **useFeatureGate**: Unified feature gating
- **Paywall Domain**: `src/domains/paywall/README.md`
