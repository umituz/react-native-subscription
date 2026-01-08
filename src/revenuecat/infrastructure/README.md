# RevenueCat Infrastructure

Infrastructure layer for RevenueCat integration.

## Overview

This directory contains concrete implementations of RevenueCat interfaces, handling communication with the RevenueCat SDK and external services.

## Structure

```
infrastructure/
├── handlers/     # Event handlers and callbacks
├── services/     # Service implementations
└── utils/        # Utility functions
```

## Components

### Handlers

Event handlers for RevenueCat lifecycle events.

**See**: [Handlers README](./handlers/README.md)

### Services

Service implementations for RevenueCat operations.

**See**: [Services README](./services/README.md)

### Utils

Utility functions for common operations.

**See**: [Utils README](./utils/README.md)

## Key Responsibilities

1. **SDK Integration**: Direct integration with RevenueCat SDK
2. **Error Handling**: Converting SDK errors to domain errors
3. **Data Transformation**: Mapping SDK types to domain types
4. **Event Handling**: Managing purchase and customer info events
5. **Configuration**: Setting up and configuring RevenueCat

## Related

- [RevenueCat Integration](../README.md)
- [RevenueCat Application](../application/README.md)
- [RevenueCat Domain](../domain/README.md)
