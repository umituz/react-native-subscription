# Wallet Domain

## Location
Wallet domain containing credits and transaction management logic.

## Strategy
The wallet domain manages user credits, transactions, and credit allocation strategies with duplicate protection, transactional operations, and complete audit trail.

## Restrictions

### REQUIRED
- Must check credit balance before operations
- Must handle credit exhaustion gracefully
- Must track all credit transactions
- Must reset credits on subscription renewal

### PROHIBITED
- DO NOT perform operations without balance check
- DO NOT allow duplicate credit allocations
- DO NOT skip transaction logging
- DO NOT bypass credit exhaustion handling

### CRITICAL SAFETY
- Credit allocations MUST be protected against duplicates
- All credit operations MUST be transactional
- Transaction history MUST be complete and accurate
- Credit exhaustion MUST trigger upgrade flow

## AI Agent Guidelines
1. Always verify credit balance before performing operations
2. Handle credit exhaustion with clear upgrade path
3. Log all credit transactions for audit trail
4. Implement monthly credit reset on subscription renewal
5. Test edge cases: zero credits, max credits, duplicates
6. Use ACCUMULATE mode for renewals, REPLACE for new purchases
7. Provide optimistic updates with rollback capability

## Related Documentation
- [Credits README](./README.md)
- [Credits Entity](./domain/entities/Credits.md)
- [useCredits Hook](../../presentation/hooks/useCredits.md)
