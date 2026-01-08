# Config Domain

Central configuration system for subscription plans, product configurations, and package management.

## Location

- **Base Path**: `/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domains/config/`
- **Domain**: `src/domains/config/domain/`
- **Entities**: `src/domains/config/domain/entities/`

## Strategy

### Plan Management

Comprehensive subscription plan configuration system.

- **Plan Types**: Monthly, annual, and lifetime plan configurations
- **Product Metadata**: RevenueCat product metadata management
- **Validation**: Configuration validation and type safety
- **Helper Functions**: Plan comparison and filtering utilities

### Configuration Objects

Structured configuration for different aspects of the system.

- **SubscriptionConfig**: Main subscription configuration
- **WalletConfig**: Credit system configuration
- **Plan Entities**: Individual plan definitions
- **Validation Rules**: Configuration validation schemas

### Helper Utilities

Plan comparison and manipulation functions.

- **Plan Comparison**: Value comparison between plans
- **Price Formatting**: Currency-aware price formatting
- **Discount Calculation**: Savings and discount calculations
- **Package Filtering**: Type-based package filtering

### Validation System

Comprehensive configuration validation.

- **Plan Validation**: Plan entity validation rules
- **Config Validation**: Complete configuration validation
- **Type Safety**: TypeScript type definitions
- **Error Messages**: Detailed validation error reporting

## Restrictions

### REQUIRED

- **Type Safety**: Always use TypeScript type definitions
- **Validation**: Validate configurations before runtime use
- **Default Values**: Provide meaningful default values
- **Immutable Updates**: Create new copies instead of modifying

### PROHIBITED

- **Invalid Prices**: Negative or zero prices not allowed
- **Missing IDs**: All plans must have valid IDs
- **Duplicate Plans**: No duplicate plan IDs allowed
- **Hardcoded Values**: Use configuration system

### CRITICAL

- **Configuration Integrity**: All configurations must be valid
- **Plan Consistency**: Related plans must be consistent
- **Currency Handling**: Proper currency code usage
- **Feature Lists**: Accurate feature mapping

## AI Agent Guidelines

### When Modifying Configuration System

1. **Type Definitions**: Update TypeScript types for new config
2. **Validation Rules**: Add validation for new fields
3. **Default Values**: Provide sensible defaults
4. **Documentation**: Document configuration options

### When Adding New Plan Types

1. **Entity Pattern**: Follow existing entity patterns
2. **Validation**: Add validation rules
3. **Helper Functions**: Create helper functions
4. **Testing**: Test with various configurations

### When Fixing Configuration Bugs

1. **Validation Logic**: Check validation rules
2. **Type Definitions**: Verify type correctness
3. **Default Values**: Ensure proper defaults
4. **Edge Cases**: Test boundary conditions

## Related Documentation

- [Paywall Domain](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domains/paywall/README.md)
- [Wallet Domain](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domains/wallet/README.md)
- [RevenueCat Integration](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/revenuecat/README.md)
- [Domain Layer](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domain/README.md)
