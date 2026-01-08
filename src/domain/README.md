# Domain Layer

Abonelik sisteminin temel domain logic'ini, entity'lerini ve value object'lerini içeren katman.

## Location

`src/domain/`

## Strategy

Temel iş kavramlarını, iş kurallarını ve domain logic'ini encapsulate eden katman. Framework-agnostic ve tamamen iş mantığına odaklı.

## Restrictions

### REQUIRED

- MUST be framework-agnostic (no React, React Native dependencies)
- MUST encapsulate business rules within entities
- MUST validate all invariants on entity creation
- MUST use immutable objects
- MUST implement type guards for type safety
- MUST define domain-specific error types

### PROHIBITED

- MUST NOT contain any framework or UI code
- MUST NOT have direct dependencies on infrastructure
- MUST NOT expose mutable state
- MUST NOT use generic error types

### CRITICAL

- Keep entities pure and framework-independent
- Validate all business rules on entity creation
- Make all objects immutable
- Encapsulate business logic within entities
- Use strong typing throughout

## AI Agent Guidelines

When working with domain layer:
1. Immutable Objects - entity'leri immutable olarak tasarlayın
2. Validation - entity creation'da validation yapın
3. Encapsulation - business logic'i entity içinde tutun
4. Type Safety - strong typing kullanın
5. Domain Events - önemli domain olaylarını event olarak yayınlayın
6. Error Handling - domain-specific hatalar tanımlayın

## Related Documentation

- [Domain Entities](./entities/README.md)
- [Value Objects](./value-objects/README.md)
- [Domain Errors](./errors/README.md)
- [Application Layer](../application/README.md)
