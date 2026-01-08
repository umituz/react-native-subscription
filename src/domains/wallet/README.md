# Wallet Domain

Credit balance management, transaction history tracking, and product metadata management.

## Location

`src/domains/wallet/`

## Strategy

Implements layered architecture for credit management with domain layer (entities, value objects, errors), infrastructure layer (repositories, Firebase services, mappers), and presentation layer (hooks, components). Handles initialization, operations, and transaction history with real-time updates.

## Restrictions

### REQUIRED

- All operations require authenticated user
- Credit operations MUST be validated server-side
- All credit changes MUST be recorded in transaction history
- MUST handle insufficient credits gracefully

### PROHIBITED

- MUST NOT allow client-side credit modifications without server validation
- MUST NOT deduct credits without sufficient balance
- MUST NOT expose internal repository logic to UI
- MUST NOT store credit balance in AsyncStorage (use secure backend)

### CRITICAL

- Always validate credit amounts (must be positive)
- Always implement optimistic updates with rollback
- Never trust client-side credit balance for security decisions
- Must implement retry logic for failed operations
- Always sanitize transaction reasons to prevent injection attacks

## AI Agent Guidelines

When implementing credit operations:
1. Always check balance before deducting
2. Always provide transaction reason and metadata
3. Always handle insufficient credits gracefully
4. Always implement optimistic updates with rollback
5. Never trust client-side balance for security

## Related Documentation

- [Credits Repository](infrastructure/README.md)
- [useCredits Hook](../../presentation/hooks/README.md)
- [UserCredits Entity](domain/entities/README.md)
- [Transaction Errors](domain/errors/README.md)