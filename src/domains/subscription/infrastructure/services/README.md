# RevenueCat Infrastructure Services

## Location
Service implementations for RevenueCat operations.

## Strategy
This directory contains concrete implementations of RevenueCat interfaces, providing the actual integration with the RevenueCat SDK using singleton pattern with proper error handling and caching.

## Restrictions

### REQUIRED
- Must use singleton pattern for service instance
- Must wrap all service calls in try-catch
- Must use TypeScript types for all operations
- Must log all RevenueCat operations

### PROHIBITED
- DO NOT create multiple service instances
- DO NOT skip error handling
- DO NOT bypass type safety
- DO NOT skip logging operations

### CRITICAL SAFETY
- Service MUST be configured only once
- All calls MUST be wrapped in error handling
- All operations MUST be type-safe
- All operations MUST be logged

## AI Agent Guidelines
1. Use singleton pattern for service instance
2. Wrap all service calls in try-catch blocks
3. Use TypeScript types for all operations
4. Log all RevenueCat operations for debugging
5. Cache customer info and offerings appropriately
6. Validate parameters before calling SDK
7. Configure service only once at startup
8. Use mock implementations for testing

## Related Documentation
- [RevenueCat Infrastructure](../README.md)
- [RevenueCat Handlers](../handlers/README.md)
- [RevenueCat Application Ports](../../application/ports/README.md)
