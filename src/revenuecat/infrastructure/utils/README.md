# RevenueCat Infrastructure Utils

## Location
Utility functions for RevenueCat operations.

## Strategy
This directory contains utility functions for common RevenueCat operations including error mapping, data transformation, validation, and formatting with proper type safety.

## Restrictions

### REQUIRED
- Must use error mapping for user-facing messages
- Must ensure types are validated before use
- Must respect user locale for formatting
- Must check for null/undefined values

### PROHIBITED
- DO NOT show SDK errors directly to users
- DO NOT use data without type validation
- DO NOT ignore locale settings
- DO NOT skip null checks

### CRITICAL SAFETY
- All errors MUST be mapped to domain errors
- All types MUST be validated before use
- Locale MUST be respected for formatting
- Null checks MUST be performed consistently

## AI Agent Guidelines
1. Always map SDK errors to domain errors for user-facing messages
2. Ensure type safety by validating types before use
3. Respect user locale when formatting prices and periods
4. Always check for null/undefined values before processing
5. Use debug helpers in development for troubleshooting
6. Validate all data before processing
7. Test utility functions with edge cases

## Related Documentation
- [RevenueCat Infrastructure](../README.md)
- [RevenueCat Domain Types](../../domain/types/README.md)
- [RevenueCat Errors](../../domain/errors/README.md)
