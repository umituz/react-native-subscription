# useFeatureGate Hook

Unified feature gate combining authentication, subscription, and credits checks.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useFeatureGate.ts`

**Type**: Hook

## Strategy

### Progressive Access Control

1. **Authentication Check**
   - Verify user is authenticated
   - Show auth modal if not authenticated
   - Queue pending action for post-auth execution

2. **Subscription Check**
   - Verify user has required subscription tier
   - Show paywall if subscription insufficient
   - Bypass credit check for premium users

3. **Credit Check**
   - Verify sufficient credit balance
   - Show purchase prompt if insufficient
   - Deduct credits only after all checks pass

4. **Action Execution**
   - Execute gated action only if all checks pass
   - Handle failures gracefully
   - Update UI state appropriately

### Integration Points

- **useAuth**: For authentication state
- **usePremium**: For subscription status
- **useCredits**: For credit balance
- **useDeductCredit**: For credit deduction
- **Auth Modals**: Custom authentication UI
- **Paywall Components**: Upgrade prompts

## Restrictions

### REQUIRED

- **Authentication Check**: MUST implement `onShowAuthModal` callback
- **Paywall Handler**: MUST implement `onShowPaywall` callback
- **Credit Validation**: MUST check `hasCredits` before allowing actions
- **State Management**: MUST respect `canAccess` boolean

### PROHIBITED

- **NEVER** bypass authentication check for sensitive features
- **NEVER** show feature gate if user has access (confusing UX)
- **NEVER** execute action without checking all gates first
- **DO NOT** hardcode gate logic (use hook parameters)
- **NEVER** deduct credits without checking subscription status first

### CRITICAL SAFETY

- **ALWAYS** check gates in order: Auth → Subscription → Credits
- **ALWAYS** provide clear messaging about why access is denied
- **ALWAYS** preserve user intent through auth/purchase flows
- **NEVER** trust client-side gate for security (server-side validation required)
- **MUST** implement proper error boundaries around gated actions

## AI Agent Guidelines

### When Implementing Feature Gates

1. **Always** check gates in order: Auth → Subscription → Credits
2. **Always** provide clear, specific messaging for each gate
3. **Always** preserve user intent through auth/purchase flows
4. **Always** bypass credit check for premium users (if applicable)
5. **Never** trust client-side gates for security (server validation required)

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Implement `onShowAuthModal` with pending action preservation
- [ ] Implement `onShowPaywall` with context-aware messaging
- [ ] Check `canAccess` before showing feature
- [ ] Provide appropriate messaging for each gate state
- [ ] Respect premium status (bypass credit check if needed)
- [ ] Test all gate combinations (auth, subscription, credits)
- [ ] Test pending action execution after auth/purchase
- [ ] Implement error boundaries around gated actions

### Common Patterns to Implement

1. **Progressive Unlocking**: Show upgrade path for each gate
2. **Smart Paywalls**: Show subscription OR credits based on user state
3. **Intent Preservation**: Queue actions through auth/purchase flows
4. **Clear Messaging**: Tell users exactly what's required
5. **Premium Bypass**: Skip credit check for premium users
6. **Access Indicators**: Show lock/unlock status in UI
7. **Graceful Degradation**: Show limited version for free users
8. **Analytics Tracking**: Monitor gate triggers and conversions

## Related Documentation

- **useAuthGate**: Authentication gating only
- **useSubscriptionGate**: Subscription gating only
- **useCreditsGate**: Credits gating only
- **usePremiumGate**: Premium feature gating
- **useDeductCredit**: Credit deduction after gate passes
- **Feature Gating**: `../../../docs/FEATURE_GATING.md`
- **Access Control**: `../../../docs/ACCESS_PATTERNS.md`
