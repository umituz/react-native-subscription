# RevenueCat Domain Types

## Location
Type definitions and type utilities for RevenueCat integration.

## Strategy
This directory contains TypeScript type definitions, type guards, and utility types used throughout the RevenueCat integration for type safety and compile-time checks.

## Restrictions

### REQUIRED
- Must use type guards for runtime checks
- Must provide utility types for common operations
- Must maintain type safety throughout
- Must use strict TypeScript types

### PROHIBITED
- DO NOT use `any` type
- DO NOT bypass type guards
- DO NOT ignore type safety
- DO NOT use loose type definitions

### CRITICAL SAFETY
- All type checks MUST use type guards
- All types MUST be strictly defined
- Type assertions MUST be safe
- Utility types MUST be used appropriately

## AI Agent Guidelines
1. Use type guards for runtime type checking
2. Define utility types for common operations
3. Maintain strict type safety throughout codebase
4. Provide clear type definitions for all RevenueCat concepts
5. Use type assertions only when safe
6. Test type guards thoroughly
7. Document complex types with comments

## Related Documentation
- [RevenueCat Domain](../README.md)
- [RevenueCat Entities](../entities/README.md)
- [RevenueCat Value Objects](../value-objects/README.md)
