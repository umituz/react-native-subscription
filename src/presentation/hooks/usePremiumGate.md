# usePremiumGate Hook

Feature gating hook for premium-only features with optional authentication.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/usePremiumGate.ts`

**Type**: Hook

## Strategy

### Premium Gating Flow

1. **Premium Check**: Verify if user has premium access
2. **Auth Check**: Optionally verify authentication status
3. **Gate Functions**: Provide requirePremium, requireAuth, requirePremiumWithAuth
4. **Access Control**: Simple booleans for conditional rendering (canAccess, canAccessWithAuth)
5. **Callback Triggers**: Execute appropriate callback when requirements not met

### Integration Points

- **usePremium**: For premium status check
- **useAuth**: For authentication status
- **Paywall Domain**: For premium upgrade flow
- **Auth UI**: For authentication flow

## Restrictions

### REQUIRED

- **Premium Status**: MUST provide isPremium parameter
- **Callback**: MUST implement onPremiumRequired callback
- **Access Check**: MUST verify canAccess before showing premium content

### PROHIBITED

- **NEVER** show premium content without checking isPremium
- **NEVER** use for security decisions without server validation
- **DO NOT** assume premium status (always verify)

### CRITICAL SAFETY

- **ALWAYS** verify canAccess before showing premium features
- **NEVER** trust client-side state for security
- **MUST** implement proper upgrade flow
- **ALWAYS** handle authentication when required

## AI Agent Guidelines

### When Implementing Premium Gates

1. **Always** check canAccess before showing premium content
2. **Always** provide clear upgrade path in callback
3. **Always** use requirePremium for action gating
4. **Always** handle authentication when using requirePremiumWithAuth
5. **Never** bypass premium checks

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide isPremium from usePremium
- [ ] Implement onPremiumRequired callback
- [ ] Optionally provide auth status and callback
- [ ] Use requirePremium for action gating
- [ ] Check canAccess for conditional rendering
- [ ] Test with premium user
- [ ] Test with non-premium user
- [ ] Test with authenticated user
- [ ] Test with unauthenticated user

### Common Patterns

1. **Premium Only**: Gate features behind premium only
2. **Auth + Premium**: Require both authentication and premium
3. **Conditional Rendering**: Check canAccess for UI
4. **Button States**: Disable buttons when not premium
5. **Upgrade Prompts**: Show in callback when not premium

## Related Documentation

- **usePremium**: Premium status check
- **useAuthGate**: Auth + subscription gating
- **useSubscriptionGate**: Subscription-only gating
- **useFeatureGate**: Unified feature gating
- **Paywall Domain**: `src/domains/paywall/README.md`
