# Application Layer

Abonelik uygulamasının iş mantığını ve servis kontratlarını içeren katman.

## Location

`src/application/`

## Strategy

Ortak kullanım durumlarını gerçekleştiren, servis kontratlarını tanımlayan ve uygulama kurallarını yöneten katman. Dependency injection ve test edilebilirlik sağlar.

## Restrictions

### REQUIRED

- MUST use dependency injection pattern
- MUST define service contracts through interfaces
- MUST implement error handling and propagation
- MUST ensure type safety for all operations
- MUST support dependency inversion principle

### PROHIBITED

- MUST NOT contain direct infrastructure dependencies
- MUST NOT bypass repository interfaces
- MUST NOT leak implementation details
- MUST NOT mix business logic with presentation

### CRITICAL

- Keep interfaces small and focused (Interface Segregation)
- Maintain single responsibility for each service
- Always handle errors appropriately and propagate upward
- Ensure all operations are type-safe

## AI Agent Guidelines

When working with application layer:
1. Interface Segregation - küçük, odaklanmış interface'ler tanımlayın
2. Dependency Inversion - high-level modüller low-level modüllere bağımlı olmamalı
3. Single Responsibility - her service/repository tek bir sorumluluğa sahip olmalı
4. Error Handling - hataları uygun şekilde handle edin ve yukarı propagation edin
5. Testing - interface'ler mock ile kolay test edilebilir

## Related Documentation

- [Domain Layer](../domain/README.md)
- [Infrastructure Layer](../infrastructure/README.md)
- [Ports](./ports/README.md)
