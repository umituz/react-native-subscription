# RevenueCat Infrastructure Handlers

## Location
Event handlers for RevenueCat lifecycle events.

## Strategy
This directory contains handler implementations for managing RevenueCat events including purchase callbacks, customer info changes, and error handling with proper data validation and recovery.

## Restrictions

### REQUIRED
- Must handle all events gracefully
- Must validate incoming data before processing
- Must log all events for debugging
- Must invoke callbacks appropriately

### PROHIBITED
- DO NOT mutate incoming event data
- DO NOT ignore event handling errors
- DO NOT skip callback invocation
- DO NOT process unvalidated data

### CRITICAL SAFETY
- All incoming data MUST be validated
- All events MUST be logged for debugging
- All callbacks MUST be invoked appropriately
- Recovery options MUST be provided when possible

## AI Agent Guidelines
1. Never mutate incoming event data
2. Handle all errors gracefully with proper boundaries
3. Log all events for debugging and monitoring
4. Invoke registered callbacks appropriately
5. Use async/await for asynchronous operations
6. Validate all incoming data before processing
7. Provide recovery options when possible

## Related Documentation
- [RevenueCat Infrastructure](../README.md)
- [RevenueCat Services](../services/README.md)
- [RevenueCat Errors](../../domain/errors/README.md)
