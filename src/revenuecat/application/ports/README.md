# RevenueCat Application Ports

## Location
Interface definitions for RevenueCat service layer.

## Strategy
This directory defines the ports (interfaces) that the RevenueCat infrastructure must implement, following the Dependency Inversion Principle for testability and flexibility.

## Restrictions

### REQUIRED
- Must define clear interfaces for all operations
- Must support mocking for testing
- Must enable implementation swapping
- Must maintain contracts between layers

### PROHIBITED
- DO NOT depend on concrete implementations
- DO NOT create interfaces without clear purpose
- DO NOT break interface contracts
- DO NOT couple application to infrastructure

### CRITICAL SAFETY
- All dependencies MUST be inverted
- Interfaces MUST be clearly defined
- Implementations MUST be swappable
- Contracts MUST be maintained

## AI Agent Guidelines
1. Define clear interfaces for all RevenueCat operations
2. Design interfaces for easy mocking in tests
3. Enable implementation swapping when needed
4. Keep application layer decoupled from infrastructure
5. Maintain clear contracts between layers
6. Document interface behavior thoroughly
7. Test with mock implementations

## Related Documentation
- [RevenueCat Application Layer](../README.md)
- [RevenueCat Infrastructure](../infrastructure/README.md)
- [RevenueCat Domain](../domain/README.md)
