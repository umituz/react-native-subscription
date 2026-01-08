# Paywall Components

UI components specifically designed for paywall and subscription upgrade screens.

## Location

`src/presentation/components/paywall/`

## Strategy

Specialized components for displaying paywalls, package selection, and subscription upgrade prompts. These components handle the visual presentation of subscription offers and user purchase flows.

## Restrictions

### REQUIRED

- Must use design tokens for consistent styling
- Must support multiple display modes (card, list, minimal)
- Must include loading states
- Must handle accessibility requirements
- Must support screen readers
- Must provide proper touch targets

### PROHIBITED

- MUST NOT hardcode pricing or product information
- MUST NOT bypass payment validation
- MUST NOT expose RevenueCat implementation details
- MUST NOT create custom payment flows outside approved patterns

### CRITICAL

- All purchase flows MUST go through RevenueCat
- Never log or transmit sensitive payment information
- Always handle errors gracefully with user-friendly messages
- Must support cancellation and refund flows

## AI Agent Guidelines

When modifying paywall components:
1. Maintain visual hierarchy for recommended packages
2. Ensure clear pricing display (price, period, per-month equivalent)
3. Keep features easy to understand
4. Include social proof elements (ratings, reviews, user counts)
5. Add trust signals (guarantees, badges, certifications)
6. Optimize for mobile screens
7. Lazy load images and avoid expensive animations
8. Always support accessibility standards

## Related Documentation

- [Paywall Domain](../../../domains/paywall/README.md)
- [Paywall Hooks](../../hooks/README.md)
- [RevenueCat Integration](../../../revenuecat/README.md)
