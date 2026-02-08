# RevenueCat Infrastructure Managers

## Location
Manager classes for coordinating RevenueCat operations.

## Strategy
This directory contains high-level manager classes that coordinate between different RevenueCat services and handle complex operations like SDK configuration and entitlement access.

## Restrictions

### REQUIRED
- Must coordinate between services properly
- Must manage SDK configuration correctly
- Must provide access to entitlement IDs
- Must handle complex operations safely

### PROHIBITED
- DO NOT bypass service coordination
- DO NOT misconfigure SDK
- DO NOT expose invalid entitlement IDs
- DO NOT oversimplify complex operations

### CRITICAL SAFETY
- Service coordination MUST be correct
- SDK configuration MUST be valid
- Entitlement access MUST be safe
- Complex operations MUST be handled properly

## AI Agent Guidelines
1. Coordinate properly between RevenueCat services
2. Manage SDK configuration with correct parameters
3. Provide safe access to entitlement IDs
4. Handle complex operations with proper error handling
5. Test coordination logic thoroughly
6. Document manager responsibilities clearly
7. Maintain separation of concerns

## Related Documentation
- [Services](../services/README.md)
- [Config](../config/README.md)
- [Domain](../../domain/README.md)
