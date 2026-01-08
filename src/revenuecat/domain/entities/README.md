# RevenueCat Domain Entities

## Location
Core domain entities for RevenueCat integration.

## Strategy
This directory contains TypeScript type definitions and entities representing RevenueCat concepts like customer info, entitlements, offerings, and packages with proper type safety.

## Restrictions

### REQUIRED
- Must use TypeScript types for all entities
- Must maintain type safety
- Must validate entity data
- Must provide clear type definitions

### PROHIBITED
- DO NOT use `any` type for entities
- DO NOT bypass type checking
- DO NOT create invalid entity states
- DO NOT use loose type definitions

### CRITICAL SAFETY
- All entities MUST be type-safe
- Entity data MUST be validated
- Type definitions MUST be clear and specific
- Entity states MUST be valid

## AI Agent Guidelines
1. Define clear TypeScript types for all RevenueCat concepts
2. Maintain strict type safety for all entities
3. Validate entity data before use
4. Provide comprehensive type definitions
5. Document entity properties and relationships
6. Use type guards for runtime validation
7. Test entity creation and validation thoroughly

## Related Documentation
- [RevenueCat Domain](../README.md)
- [RevenueCat Value Objects](../value-objects/README.md)
- [RevenueCat Errors](../errors/README.md)
- [RevenueCat Types](../types/README.md)
