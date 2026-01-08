# RevenueCat Infrastructure

## Location
Infrastructure layer for RevenueCat integration.

## Strategy
This directory contains concrete implementations of RevenueCat interfaces, handling communication with the RevenueCat SDK and external services with proper error handling and data transformation.

## Restrictions

### REQUIRED
- Must integrate directly with RevenueCat SDK
- Must convert SDK errors to domain errors
- Must map SDK types to domain types
- Must manage purchase and customer info events

### PROHIBITED
- DO NOT expose SDK errors directly to application
- DO NOT use SDK types in domain layer
- DO NOT skip error mapping
- DO NOT ignore lifecycle events

### CRITICAL SAFETY
- All SDK errors MUST be converted to domain errors
- All SDK types MUST be mapped to domain types
- All events MUST be handled appropriately
- Configuration MUST be set up correctly

## AI Agent Guidelines
1. Integrate directly with RevenueCat SDK
2. Convert all SDK errors to domain errors
3. Map all SDK types to domain types
4. Manage purchase and customer info events properly
5. Set up and configure RevenueCat correctly
6. Test SDK integration thoroughly
7. Handle all edge cases in SDK communication

## Related Documentation
- [RevenueCat Integration](../README.md)
- [RevenueCat Application](../application/README.md)
- [RevenueCat Domain](../domain/README.md)
