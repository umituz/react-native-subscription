# Wallet Infrastructure

## Location
Infrastructure layer for wallet and credits functionality.

## Strategy
This directory contains implementations for credit persistence, transactions, and credit operations with duplicate protection and optimistic updates.

## Restrictions

### REQUIRED
- Must check credit balance before deducting
- Must handle errors appropriately
- Must use transactions for data consistency
- Must log all credit operations

### PROHIBITED
- DO NOT deduct credits without balance check
- DO NOT allow duplicate credit allocations
- DO NOT skip transaction boundaries
- DO NOT ignore credit operation errors

### CRITICAL SAFETY
- Duplicate allocations MUST be prevented based on purchaseId
- Credit operations MUST be atomic
- All operations MUST be logged for debugging
- Input validation MUST be performed

## AI Agent Guidelines
1. Always verify credit balance before deduction operations
2. Implement comprehensive error handling for credit operations
3. Use transactions to ensure data consistency
4. Track all credit operations with detailed logging
5. Test edge cases: zero credits, max credits, duplicates
6. Validate all input parameters before processing
7. Implement duplicate protection based on purchaseId

## Related Documentation
- [Wallet Domain](../domain/README.md)
- [Credits Entity](../domain/entities/README.md)
- [useCredits Hook](../../presentation/hooks/useCredits.md)
