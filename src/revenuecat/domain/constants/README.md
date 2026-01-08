# RevenueCat Domain Constants

## Location
Constants used throughout the RevenueCat integration.

## Strategy
This directory contains constant definitions for RevenueCat-specific values including entitlement IDs, error codes, and configuration defaults for maintainability and consistency.

## Restrictions

### REQUIRED
- Must use constants for all RevenueCat-specific values
- Must provide clear constant names
- Must maintain consistency across codebase
- Must document constant purposes

### PROHIBITED
- DO NOT use magic strings or numbers
- DO NOT duplicate constant definitions
- DO NOT use hardcoded values
- DO NOT create ambiguous constants

### CRITICAL SAFETY
- All RevenueCat-specific values MUST use constants
- Constants MUST be clearly named and documented
- Constant values MUST be consistent
- Entitlement IDs MUST match RevenueCat dashboard

## AI Agent Guidelines
1. Use constants for all RevenueCat-specific values
2. Provide clear, descriptive constant names
3. Maintain consistency across the codebase
4. Document the purpose of each constant
5. Organize constants by category (entitlements, offerings, errors)
6. Validate constants match RevenueCat dashboard configuration
7. Avoid magic strings and numbers throughout code

## Related Documentation
- [RevenueCat Domain](../README.md)
- [RevenueCat Errors](../errors/README.md)
- [RevenueCat Entities](../entities/README.md)
