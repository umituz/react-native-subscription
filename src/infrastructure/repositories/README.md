# Infrastructure Repositories

Repository implementations for data persistence.

## Location

- **Base Path**: `/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/infrastructure/repositories/`
- **Repositories**: `src/infrastructure/repositories/`

## Strategy

### Repository Pattern

Data access abstraction layer.

- **CreditsRepository**: Credits data management
- **TransactionRepository**: Transaction history
- **SubscriptionRepository**: Subscription status management
- **Custom Repositories**: Extensible repository architecture

### Data Access Patterns

Structured data access implementations.

- **Active Record**: Entity-based data management
- **Data Mapper**: Separation of entities and data
- **Repository with Caching**: Performance optimization
- **Transaction Support**: Atomic operations

### Storage Implementations

Multiple storage backend support.

- **Firestore**: Cloud Firestore implementation
- **In-Memory**: Testing and development
- **HTTP**: REST API integration
- **Redis**: Redis cache implementation

### Advanced Features

Enterprise-level repository capabilities.

- **Real-Time Updates**: Firestore real-time listeners
- **Transaction Support**: Multi-document transactions
- **Caching**: Performance optimization
- **Mocking**: Testing support

## Restrictions

### REQUIRED

- **Interface Implementation**: Implement required interfaces
- **Error Handling**: Transform storage errors to domain errors
- **Validation**: Validate data before saving
- **Logging**: Log repository operations

### PROHIBITED

- **Business Logic**: Keep business logic in services
- **Direct Exposure**: Never expose storage-specific types
- **Missing Validation**: Never save invalid data
- **Swallowed Errors**: Always handle or propagate errors

### CRITICAL

- **Error Transformation**: Transform storage errors appropriately
- **Data Integrity**: Maintain data integrity
- **Performance**: Optimize with caching and batching
- **Testing**: Support mock implementations

## AI Agent Guidelines

### When Modifying Repositories

1. **Interface Compliance**: Maintain interface contracts
2. **Error Handling**: Transform errors appropriately
3. **Validation**: Validate all data
4. **Logging**: Log operations for debugging

### When Creating Custom Repositories

1. **Interface Implementation**: Implement required interfaces
2. **Error Transformation**: Transform storage errors
3. **Validation**: Add data validation
4. **Testing**: Create mock implementations

### When Fixing Repository Bugs

1. **Data Access**: Check data access logic
2. **Error Handling**: Verify error transformation
3. **Validation**: Check validation rules
4. **Edge Cases**: Test with null/undefined values

## Related Documentation

- [Infrastructure Services](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/infrastructure/services/README.md)
- [Infrastructure Layer](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/infrastructure/README.md)
- [Application Ports](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/application/ports/README.md)
- [Domain Layer](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domain/README.md)
