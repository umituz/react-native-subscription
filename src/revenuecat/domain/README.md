# RevenueCat Domain

Domain entities and types for RevenueCat integration.

## Location

`src/revenuecat/domain/`

## Strategy

Domain-specific entities representing RevenueCat concepts like entitlements, offerings, and packages, with proper type mapping and validation.

## Restrictions

### REQUIRED

- MUST map RevenueCat types to domain types
- MUST handle optional properties safely (null safety)
- MUST validate RevenueCat data
- MUST format prices and dates consistently
- MUST use constants for identifiers

### PROHIBITED

- MUST NOT expose RevenueCat implementation details to other layers
- MUST NOT leak RevenueCat SDK types outside this module
- MUST NOT assume all properties are present (null safety)

### CRITICAL

- Always validate RevenueCat data before use
- Handle all optional properties safely
- Use constants for all identifiers
- Maintain consistent formatting for prices and dates

## AI Agent Guidelines

When working with RevenueCat domain:
1. Type Mapping - map RevenueCat types to domain types
2. Null Safety - handle optional properties safely
3. Validation - validate RevenueCat data
4. Formatting - format prices and dates consistently
5. Constants - use constants for identifiers

## Related Documentation

- [RevenueCat README](../README.md)
- [Subscription Manager](../../infrastructure/managers/README.md)
