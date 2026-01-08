# Infrastructure Services

Service implementations in the infrastructure layer.

## Location

- **Base Path**: `/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/infrastructure/services/`
- **Services**: `src/infrastructure/services/`

## Strategy

### Service Architecture

Business logic implementation for subscription operations.

- **SubscriptionService**: Main subscription management service
- **SubscriptionInitializer**: System initialization
- **Status Sync**: Automatic status synchronization
- **Error Handling**: Comprehensive error management

### Service Features

Core service capabilities.

- **Automatic Status Sync**: Real-time status updates
- **Error Handling**: Robust error management
- **Caching**: Performance optimization through caching
- **Event Handling**: Status change event callbacks

### Advanced Patterns

Enterprise-grade service patterns.

- **Retry Logic**: Automatic retry on failures
- **Circuit Breaker**: Fault tolerance patterns
- **Observability**: Event emission and tracking
- **Transaction Support**: Atomic operations

### Custom Services

Extensible service architecture.

- **Interface Implementation**: Custom service implementations
- **Dependency Injection**: Flexible dependency management
- **Testing Support**: Test-friendly design
- **Configuration**: Service-level configuration

## Restrictions

### REQUIRED

- **Dependency Injection**: Use constructor injection
- **Error Handling**: Handle all errors appropriately
- **Logging**: Log important operations
- **Validation**: Validate all inputs

### PROHIBITED

- **Direct Storage Access**: Access storage only through repositories
- **Missing Error Handling**: Never swallow errors
- **Hardcoded Values**: Use configuration
- **Circular Dependencies**: Avoid circular dependencies

### CRITICAL

- **Error Transformation**: Transform storage errors to domain errors
- **Performance**: Optimize with caching
- **Reliability**: Implement retry logic
- **Observability**: Track all operations

## AI Agent Guidelines

### When Modifying Services

1. **Interface Compliance**: Maintain interface contracts
2. **Error Handling**: Comprehensive error handling
3. **Logging**: Add logging for debugging
4. **Testing**: Write comprehensive tests

### When Creating Custom Services

1. **Interface Implementation**: Implement required interfaces
2. **Dependency Injection**: Inject dependencies via constructor
3. **Error Handling**: Transform errors appropriately
4. **Documentation**: Document behavior and contracts

### When Fixing Service Bugs

1. **Repository Integration**: Check repository calls
2. **Error Handling**: Verify error transformation
3. **Business Logic**: Check business rules
4. **Edge Cases**: Test boundary conditions

## Related Documentation

- [Infrastructure Repositories](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/infrastructure/repositories/README.md)
- [Application Layer](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/application/README.md)
- [Application Ports](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/application/ports/README.md)
- [Infrastructure Layer](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/infrastructure/README.md)
