# Config Domain

## Location
Domain layer for configuration management.

## Strategy
This directory contains the business logic and domain models for subscription and feature configuration.

## Restrictions

### REQUIRED
- Must use entities for domain models
- Must validate in constructor
- Must keep entities immutable

### PROHIBITED
- DO NOT bypass entity validation
- DO NOT mutate entities after creation
- DO NOT leak domain logic to application layer

### CRITICAL SAFETY
- All business rules MUST be enforced in entities
- Validation failures MUST fail fast
- Type safety MUST be maintained at compile time

## AI Agent Guidelines
1. When creating new configurations, use existing entities
2. Always validate configuration data through entity constructors
3. Encapsulate business logic within domain entities
4. Implement proper equality methods for value objects
5. Provide formatting methods for display purposes
6. Maintain strict type safety with TypeScript

## Related Documentation
- [Config Domain](../../README.md)
- [Config Entities](./entities/README.md)
- [Config Value Objects](./value-objects/README.md)
