# Wallet Domain Entities

## Location
Core entities for credits and transaction management.

## Strategy
This directory contains domain entities representing credits, transactions, and wallet-related business concepts with strict immutability and validation.

## Restrictions

### REQUIRED
- Must treat entities as immutable values
- Must validate in entity methods
- Must use strict TypeScript types
- Must keep business logic in entities

### PROHIBITED
- DO NOT mutate entities after creation
- DO NOT bypass validation methods
- DO NOT leak entity internals
- DO NOT allow invalid state

### CRITICAL SAFETY
- All entities MUST be immutable
- Validation MUST be performed in entity methods
- Date serialization MUST be handled properly
- Business rules MUST be enforced in entities

## AI Agent Guidelines
1. Treat all entities as immutable values
2. Perform validation within entity methods
3. Use strict TypeScript types for all properties
4. Keep business logic encapsulated in entities
5. Handle date serialization properly for transactions
6. Implement proper equality methods
7. Provide clear validation error messages

## Related Documentation
- [Wallet Domain](../README.md)
- [Credits Repository](../../infrastructure/repositories/README.md)
- [useCredits Hook](../../../../presentation/hooks/useCredits.md)
