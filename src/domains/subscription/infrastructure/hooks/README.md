# RevenueCat Presentation Hooks

React hooks for accessing RevenueCat data and operations.

## Location

`src/revenuecat/presentation/hooks/`

## Strategy

React hooks that expose RevenueCat functionality to the presentation layer, providing access to customer info, subscription packages, and offerings.

## Restrictions

### REQUIRED

- MUST handle loading states appropriately
- MUST handle error states gracefully
- MUST cache responses when appropriate
- MUST subscribe to real-time updates when needed
- MUST validate all data before use

### PROHIBITED

- MUST NOT expose RevenueCat implementation details to components
- MUST NOT bypass error handling
- MUST NOT create infinite loops with subscriptions
- MUST NOT assume data is always available

### CRITICAL

- Always handle loading and error states
- Unsubscribe from all listeners on unmount
- Validate all data before using it in components
- Handle null/undefined states properly

## AI Agent Guidelines

When working with RevenueCat hooks:
1. Always handle loading and error states
2. Unsubscribe from listeners on unmount
3. Validate all data before use
4. Cache responses appropriately
5. Handle null/undefined states gracefully

## Related Documentation

- [Main Hooks](../../../presentation/hooks/README.md)
- [Domain](../../domain/README.md)
- [Services](../infrastructure/services/README.md)
