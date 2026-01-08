# Paywall Hooks

## Location
React hooks for paywall management and subscription upgrades.

## Strategy
This directory contains React hooks specifically for paywall functionality with centralized state management and proper analytics tracking.

## Restrictions

### REQUIRED
- Must use centralized paywall visibility state
- Must handle authentication before purchase
- Must store pending actions for post-purchase
- Must track all paywall interactions

### PROHIBITED
- DO NOT use local paywall state
- DO NOT skip authentication checks
- DO NOT lose pending actions
- DO NOT skip analytics tracking

### CRITICAL SAFETY
- Authentication MUST be checked before purchase
- Pending actions MUST be preserved through purchase flow
- All interactions MUST be tracked for analytics
- Purchase failures MUST be handled gracefully

## AI Agent Guidelines
1. Use global state for paywall visibility management
2. Handle authentication before initiating purchase
3. Store pending actions for execution after purchase
4. Track all paywall interactions for analytics
5. Handle purchase failures with graceful recovery
6. Show relevant paywall based on user context
7. Test all paywall state transitions thoroughly

## Related Documentation
- [usePaywallVisibility](../../presentation/hooks/usePaywallVisibility.md)
- [usePaywallOperations](../../presentation/hooks/usePaywallOperations.md)
- [PremiumGate Hook](../../presentation/hooks/usePremiumGate.md)
