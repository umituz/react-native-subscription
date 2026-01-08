# Config Domain Entities

## Location
Domain entities for configuration management.

## Strategy
This directory contains entity classes representing configuration concepts like packages, features, and paywalls with strict validation and immutability.

## Restrictions

### REQUIRED
- Must validate all configuration in constructor
- Must treat entities as immutable
- Must provide clear error messages
- Must use TypeScript strict mode

### PROHIBITED
- DO NOT modify entities after creation
- DO NOT bypass validation logic
- DO NOT expose mutable internal state
- DO NOT allow invalid configuration

### CRITICAL SAFETY
- All validation MUST happen in constructor
- Entities MUST fail fast on invalid input
- Error messages MUST be descriptive
- Factory functions MUST provide valid defaults

## AI Agent Guidelines
1. Always validate configuration data in entity constructors
2. Treat all entities as immutable values
3. Keep business logic encapsulated within entities
4. Provide factory functions for common configurations
5. Test validation logic thoroughly
6. Use TypeScript strict types for all properties
7. Return descriptive error messages for validation failures

## Related Documentation
- [Config Domain](../README.md)
- [Config Value Objects](../value-objects/README.md)
- [Config Utils](../../utils/README.md)
