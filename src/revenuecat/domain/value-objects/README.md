# RevenueCat Domain Value Objects

## Location
Value objects for RevenueCat integration.

## Strategy
This directory contains value objects - immutable types that represent concepts in the RevenueCat domain with no identity, defined by their attributes rather than identity.

## Restrictions

### REQUIRED
- Must validate in constructor
- Must keep value objects immutable
- Must implement proper equality based on values
- Must provide locale-aware formatting

### PROHIBITED
- DO NOT modify value objects after creation
- DO NOT bypass validation in constructor
- DO NOT use identity-based equality
- DO NOT ignore locale in formatting

### CRITICAL SAFETY
- All value objects MUST be immutable
- Validation MUST happen in constructor
- Equality MUST be based on values, not identity
- Formatting MUST be locale-aware

## AI Agent Guidelines
1. Never modify value objects after creation
2. Validate all inputs in constructor with fail-fast
3. Implement proper equality based on values
4. Provide locale-aware formatting methods
5. Return new instances for all operations
6. Use TypeScript for compile-time type safety
7. Provide toString/JSON methods if needed for serialization

## Related Documentation
- [RevenueCat Domain](../README.md)
- [RevenueCat Entities](../entities/README.md)
- [RevenueCat Types](../types/README.md)
