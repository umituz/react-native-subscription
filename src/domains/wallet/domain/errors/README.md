# Wallet Domain Errors

## Location
Domain-specific errors for wallet and credit operations.

## Strategy
This directory contains custom error classes representing wallet-related error conditions with specific error types and recovery strategies.

## Restrictions

### REQUIRED
- Must use specific error types for different scenarios
- Must include relevant context in error properties
- Must handle errors gracefully at boundaries
- Must log errors for debugging

### PROHIBITED
- DO NOT use generic error types
- DO NOT throw errors without context
- DO NOT ignore error conditions
- DO NOT expose technical errors to users

### CRITICAL SAFETY
- All errors MUST be handled appropriately
- Error context MUST be sufficient for recovery
- Technical errors MUST be converted to user-friendly messages
- Error codes MUST be actionable

## AI Agent Guidelines
1. Use specific error types for different scenarios (CreditsExhaustedError, DuplicatePurchaseError, etc.)
2. Include relevant data in error properties for recovery
3. Handle errors gracefully at layer boundaries
4. Log all errors with sufficient context for debugging
5. Convert technical errors to user-friendly messages
6. Follow error code reference for recovery strategies
7. Test error handling paths thoroughly

## Related Documentation
- [Wallet Entities](../entities/README.md)
- [Credits Repository](../../infrastructure/repositories/README.md)
