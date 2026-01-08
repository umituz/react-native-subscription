# RevenueCat Domain Errors

Domain-specific errors for RevenueCat operations.

## Location

`src/revenuecat/domain/errors/`

## Strategy

Custom error classes for RevenueCat-specific error conditions, providing typed error handling for purchase, entitlement, configuration, and offering failures.

## Restrictions

### REQUIRED

- MUST use specific error types (not generic errors)
- MUST include machine-readable error codes
- MUST include relevant contextual data
- MUST implement recovery strategies
- MUST convert errors to user-friendly messages
- MUST log errors for debugging
- MUST track errors for analytics

### PROHIBITED

- MUST NOT expose sensitive RevenueCat API keys or tokens
- MUST NOT leak raw RevenueCat errors to users
- MUST NOT ignore error conditions

### CRITICAL

- Always implement specific error types
- Include machine-readable codes for programmatic handling
- Provide recovery strategies where applicable
- Convert technical errors to user-friendly messages
- Log all errors for debugging and monitoring

## AI Agent Guidelines

When working with RevenueCat errors:
1. Specific Errors - use specific error types
2. Error Codes - include machine-readable codes
3. Context - include relevant data in error
4. Recovery - implement recovery strategies
5. User Feedback - convert errors to user-friendly messages
6. Logging - log errors for debugging
7. Analytics - track errors for monitoring

## Related Documentation

- [RevenueCat Domain](../README.md)
- [RevenueCat Services](../../infrastructure/services/README.md)
