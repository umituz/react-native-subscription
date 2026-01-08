# Wallet Presentation Hooks

## Location
React hooks for wallet and credit functionality.

## Strategy
This directory contains React hooks specifically for credit management and wallet operations with optimistic updates and proper error handling.

## Restrictions

### REQUIRED
- Must check balance before deducting
- Must handle loading states appropriately
- Must handle deduction failures gracefully
- Must log all credit operations

### PROHIBITED
- DO NOT deduct credits without balance check
- DO NOT skip error handling
- DO NOT ignore loading states
- DO NOT perform operations without tracking

### CRITICAL SAFETY
- Balance checks MUST precede all deductions
- Deduction failures MUST be handled gracefully
- Optimistic updates MUST support rollback
- All operations MUST be logged

## AI Agent Guidelines
1. Always check credit balance before deducting
2. Show appropriate loading states during operations
3. Handle deduction failures with graceful recovery
4. Use optimistic updates for better user experience
5. Log all credit operations for debugging
6. Initialize credits automatically after premium purchase
7. Test edge cases: zero credits, max credits, failures

## Related Documentation
- [useCredits Hook Documentation](../../../presentation/hooks/useCredits.md)
- [useDeductCredit Hook Documentation](../../../presentation/hooks/useDeductCredit.md)
- [Credits Entity](../../domain/entities/README.md)
