# RevenueCat Application Layer

## Location
Application layer for RevenueCat integration, containing use cases and orchestration logic.

## Strategy
This directory contains use cases and application-level operations for managing RevenueCat subscriptions and purchases with proper error handling and state synchronization.

## Restrictions

### REQUIRED
- Must handle RevenueCat errors gracefully
- Must provide user ID when available
- Must use entitlements instead of product IDs
- Must keep local state synchronized

### PROHIBITED
- DO NOT ignore RevenueCat errors
- DO NOT skip user ID provision
- DO NOT use product IDs directly
- DO NOT allow state desynchronization

### CRITICAL SAFETY
- All errors MUST be handled gracefully
- User IDs MUST be provided when available
- Entitlements MUST be used for flexibility
- Local state MUST stay synchronized

## AI Agent Guidelines
1. Always handle RevenueCat errors with proper recovery
2. Provide user ID when available for better tracking
3. Use entitlements instead of product IDs for flexibility
4. Check if offerings are available before purchasing
5. Validate customer info after purchases
6. Keep local state synchronized with RevenueCat
7. Handle network timeouts appropriately
8. Log all RevenueCat operations for debugging

## Related Documentation
- [RevenueCat Integration](../README.md)
- [RevenueCat Domain](../domain/README.md)
- [RevenueCat Infrastructure](../infrastructure/README.md)
- [Application Ports](./ports/README.md)
