# Paywall Entities

## Location
Domain entities for paywall configuration and state management.

## Strategy
This directory contains entities representing paywall configuration, triggers, and display logic with rich context for analytics.

## Restrictions

### REQUIRED
- Must include context in triggers for analytics
- Must validate configurations before use
- Must treat entities as immutable values
- Must use strict TypeScript types

### PROHIBITED
- DO NOT create triggers without context
- DO NOT use unvalidated configurations
- DO NOT mutate entities after creation
- DO NOT bypass type safety

### CRITICAL SAFETY
- All triggers MUST include analytics context
- All configurations MUST be validated before use
- All entities MUST be immutable
- Type safety MUST be maintained

## AI Agent Guidelines
1. Include rich context in triggers for analytics tracking
2. Validate all configurations before using them
3. Treat all entities as immutable values
4. Use strict TypeScript types for all properties
5. Track all paywall events and triggers
6. Provide clear validation error messages
7. Test entity creation and validation thoroughly

## Related Documentation
- [Paywall README](../README.md)
- [PaywallVisibility Hook](../../presentation/hooks/usePaywallVisibility.md)
