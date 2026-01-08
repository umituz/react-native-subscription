# Domain Errors

Domain-specific error types for subscription system.

## Location

`src/domain/errors/`

## Strategy

Domain errors provide typed, contextual error handling for business logic failures. They make error handling explicit and type-safe, enabling precise error management.

## Restrictions

### REQUIRED

- MUST use specific error types (not generic Error)
- MUST include contextual information
- MUST document all error codes
- MUST handle errors gracefully with user-friendly messages
- MUST log errors for debugging
- MUST use type guards for type-safe error handling

### PROHIBITED

- MUST NOT swallow errors without handling
- MUST NOT use generic Error class
- MUST NOT expose sensitive information in error messages
- MUST NOT ignore error conditions

### CRITICAL

- Always handle or rethrow errors
- Include relevant context in error objects
- Use type guards to enable type-safe error handling
- Show user-friendly messages while logging technical details

## AI Agent Guidelines

When working with domain errors:
1. Use specific error types - don't use generic Error
2. Include context - add relevant data to errors
3. Document error codes - list all possible errors
4. Handle gracefully - show user-friendly messages
5. Log errors - track for debugging
6. Don't swallow errors - always handle or rethrow
7. Use type guards - enable type-safe error handling

## Related Documentation

- [Domain Entities](../entities/README.md)
- [Value Objects](../value-objects/README.md)
- [Domain Layer](../README.md)
