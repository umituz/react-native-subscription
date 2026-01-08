# Domains

Specialized domain modules implementing specific business logic and features.

## Location

`src/domains/`

## Strategy

Implements Domain-Driven Design (DDD) principles with self-contained domains. Each domain includes domain layer (business logic, entities, value objects), infrastructure layer (external integrations, repositories), and presentation layer (domain-specific hooks and components).

## Restrictions

### REQUIRED

- Domains MUST NOT directly depend on each other
- MUST use well-defined interfaces between layers
- MUST depend on abstractions, not concretions (Dependency Inversion)
- All domains MUST be testable in isolation

### PROHIBITED

- MUST NOT share domain logic between domains (use shared kernel if needed)
- MUST NOT create circular dependencies between domains
- MUST NOT bypass domain layer from presentation
- MUST NOT expose infrastructure details to other domains

### CRITICAL

- Always validate invariants at domain boundaries
- Always implement domain errors for business rule violations
- Never allow inconsistent domain state
- Must implement proper transaction boundaries
- Always sanitize inputs from external sources

## AI Agent Guidelines

When working with domains:
1. Always respect domain boundaries
2. Always use dependency inversion
3. Always implement domain-specific errors
4. Always validate invariants at boundaries
5. Never create circular dependencies

## Related Documentation

- [Wallet Domain](wallet/README.md)
- [Paywall Domain](paywall/README.md)
- [Config Domain](config/README.md)
- [Domain Layer](../domain/README.md)
- [Infrastructure](../infrastructure/README.md)