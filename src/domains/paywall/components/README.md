# Paywall Components

## Location
UI components for displaying paywalls and upgrade prompts.

## Strategy
This directory contains React Native components for rendering paywall screens and upgrade prompts with clear value communication and smooth purchase flow.

## Restrictions

### REQUIRED
- Must communicate premium benefits clearly
- Must highlight recommended package
- Must allow dismissal when appropriate
- Must show appropriate loading indicators

### PROHIBITED
- DO NOT obscure purchase flow
- DO NOT hide pricing information
- DO NOT prevent appropriate dismissal
- DO NOT show technical errors to users

### CRITICAL SAFETY
- Pricing information MUST be clear and accurate
- Purchase flow MUST be simple and straightforward
- Loading states MUST be visible during operations
- Purchase failures MUST be handled gracefully

## AI Agent Guidelines
1. Communicate premium benefits clearly to users
2. Highlight recommended package with visual hierarchy
3. Show social proof (user counts, testimonials) when available
4. Allow users to dismiss paywall when appropriate
5. Make purchase flow simple and straightforward
6. Show loading indicators during async operations
7. Handle purchase failures with user-friendly messages

## Related Documentation
- [Paywall README](../README.md)
- [PaywallVisibility Hook](../../hooks/usePaywallVisibility.md)
- [Premium Components](../../components/details/README.md)
