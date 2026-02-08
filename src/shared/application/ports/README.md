# Application Ports

Interfaces defining contracts between application layer and external dependencies.

## Location

`src/application/ports/`

## Strategy

Port interfaces define how the application layer interacts with external services and repositories, enabling dependency inversion and testability through clear contracts.

## Restrictions

### REQUIRED

- MUST use interface segregation (keep interfaces focused)
- MUST document behavior thoroughly
- MUST use domain entities in return types
- MUST make all I/O operations async
- MUST define clear contracts between layers

### PROHIBITED

- MUST NOT couple interfaces to specific implementations
- MUST NOT include infrastructure concerns in port definitions
- MUST NOT leak implementation details through interfaces

### CRITICAL

- Keep interfaces focused and segregated
- Document all behavior thoroughly
- Use domain entities in return types
- Ensure all I/O operations are async

## AI Agent Guidelines

When working with application ports:
1. Interface Segregation - keep interfaces focused
2. Clear Contracts - document behavior thoroughly
3. Return Types - use domain entities in return types
4. Async Operations - all I/O operations should be async

## Related Documentation

- [Application Layer](../README.md)
- [Infrastructure Services](../../infrastructure/services/README.md)
- [Infrastructure Repositories](../../infrastructure/repositories/README.md)
