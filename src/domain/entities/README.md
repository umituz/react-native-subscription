# Domain Entities

Core domain entities for subscription management.

## Location

`src/domain/entities/`

## Strategy

Domain entities represent the core business concepts and rules of the subscription system. They are framework-agnostic and contain only business logic, ensuring pure domain modeling.

## Restrictions

### REQUIRED

- MUST validate themselves on creation
- MUST remain immutable after creation
- MUST encapsulate business logic internally
- MUST use value objects for complex attributes
- MUST be framework-agnostic

### PROHIBITED

- MUST NOT have framework dependencies
- MUST NOT expose internal state directly
- MUST NOT allow direct state modification
- MUST NOT contain infrastructure concerns

### CRITICAL

- Always validate invariants to ensure valid state
- Prevent direct state modification through immutability
- Keep business rules encapsulated within entities
- Maintain purity - no external dependencies

## AI Agent Guidelines

When working with domain entities:
1. Keep entities pure - no framework dependencies
2. Validate invariants - ensure valid state
3. Use value objects - for complex attributes
4. Encapsulate logic - keep business rules inside entities
5. Make immutable - prevent direct state modification

## Related Documentation

- [Value Objects](../value-objects/README.md)
- [Domain Errors](../errors/README.md)
- [Domain Layer](../README.md)
