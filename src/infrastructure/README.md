# Infrastructure Layer

Abonelik sisteminin dış dünya ile iletişimini sağlayan implementations ve repositories içeren katman.

## Location

`src/infrastructure/`

## Strategy

Dış servis entegrasyonlarını (Firebase, RevenueCat), veri erişim implementasyonlarını ve karmaşık operasyon yöneticilerini içeren katman. Dependency injection ve test edilebilirlik sağlar.

## Restrictions

### REQUIRED

- MUST implement all port interfaces from application layer
- MUST handle all errors gracefully and propagate appropriately
- MUST validate all inputs before processing
- MUST implement caching for frequently accessed data
- MUST support logging for debugging and monitoring
- MUST be testable with mock implementations

### PROHIBITED

- MUST NOT contain business logic (belongs in domain/application)
- MUST NOT bypass error handling
- MUST NOT expose implementation details to other layers
- MUST NOT create tight coupling with external services

### CRITICAL

- Always validate inputs before processing
- Implement proper error handling for all external calls
- Use dependency injection for all external dependencies
- Ensure all implementations are mockable for testing
- Implement retry logic for network operations

## AI Agent Guidelines

When working with infrastructure layer:
1. Dependency Injection - repository'leri constructor'da alın
2. Error Handling - tüm hataları yakalayın ve uygun şekilde handle edin
3. Caching - sık kullanılan verileri cache'leyin
4. Validation - girdileri validate edin
5. Logging - önemli operasyonları log'layın
6. Testing - mock implementasyonlarla test edilebilir yapın
7. Retry Logic - network hataları için retry logic ekleyin

## Related Documentation

- [Application Layer](../application/README.md)
- [Domain Layer](../domain/README.md)
- [Repositories](./repositories/README.md)
- [Services](./services/README.md)
