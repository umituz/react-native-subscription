# RevenueCat Infrastructure Config

RevenueCat SDK configuration and initialization.

## Location

`src/revenuecat/infrastructure/config/`

## Strategy

Configuration utilities and setup for the RevenueCat SDK, providing centralized configuration management for the subscription system.

## Restrictions

### REQUIRED

- MUST configure RevenueCat at app startup
- MUST use valid API keys from environment configuration
- MUST initialize before any purchase operations
- MUST handle configuration errors gracefully

### PROHIBITED

- MUST NOT expose API keys in source code
- MUST NOT hardcode configuration values
- MUST NOT initialize RevenueCat multiple times
- MUST NOT bypass configuration validation

### CRITICAL

- Always validate configuration before initialization
- Never expose sensitive API keys or tokens
- Handle all configuration errors gracefully
- Ensure configuration is loaded before any operations

## AI Agent Guidelines

When working with RevenueCat configuration:
1. Always validate configuration before use
2. Never hardcode API keys or secrets
3. Handle all configuration errors gracefully
4. Ensure proper initialization order
5. Test with both valid and invalid configurations

## Related Documentation

- [Managers](../managers/README.md)
- [Services](../services/README.md)
- [RevenueCat README](../../README.md)
