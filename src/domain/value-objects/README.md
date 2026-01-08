# Domain Value Objects

Value objects for the subscription domain.

## Location

`src/domain/value-objects/`

## Strategy

Value objects are immutable objects that represent concepts by their attributes rather than identity. They ensure validity and prevent primitive obsession by providing type-safe, validated representations.

## Restrictions

### REQUIRED

- MUST be immutable (all properties readonly)
- MUST validate on creation (fail fast)
- MUST override equality (compare by value, not reference)
- MUST use for complex attributes (not simple primitives)
- MUST be small and focused

### PROHIBITED

- MUST NOT allow mutation after creation
- MUST NOT use reference equality for comparison
- MUST NOT contain invalid states
- MUST NOT have identity-based equality

### CRITICAL

- Always validate on creation
- Implement value-based equality comparison
- Keep value objects small and focused
- Use only for complex attributes, not simple primitives

## AI Agent Guidelines

When working with value objects:
1. Make immutable - all properties readonly
2. Validate on creation - fail fast
3. Override equality - compare by value, not reference
4. Use for complex attributes - don't use for simple primitives
5. Keep small - value objects should be focused

## Related Documentation

- [Domain Entities](../entities/README.md)
- [Domain Errors](../errors/README.md)
- [Domain Layer](../README.md)
