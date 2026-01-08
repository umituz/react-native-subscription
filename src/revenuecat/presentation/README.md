# RevenueCat Presentation

## Location
Presentation layer for RevenueCat integration.

## Strategy
This directory contains React hooks, components, and utilities for integrating RevenueCat functionality into the UI layer with proper loading states, error handling, and caching.

## Restrictions

### REQUIRED
- Must show loading states during async operations
- Must handle and display errors appropriately
- Must cache customer info and offerings
- Must re-render on entitlement changes

### PROHIBITED
- DO NOT skip loading states
- DO NOT show technical errors to users
- DO NOT ignore cache invalidation
- DO NOT prevent re-renders on state changes

### CRITICAL SAFETY
- All async operations MUST show loading states
- All errors MUST be handled and displayed appropriately
- Data MUST be cached appropriately
- UI MUST re-render on entitlement changes

## AI Agent Guidelines
1. Always show loading states during async operations
2. Handle and display errors appropriately to users
3. Update UI optimistically where possible
4. Cache customer info and offerings appropriately
5. Re-render on entitlement changes
6. Provide clear feedback during purchases
7. Validate data before displaying to users

## Related Documentation
- [RevenueCat Integration](../README.md)
- [RevenueCat Application](../application/README.md)
- [RevenueCat Infrastructure](../infrastructure/README.md)
- [RevenueCat Domain](../domain/README.md)
