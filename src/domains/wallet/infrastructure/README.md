# Wallet Infrastructure

Infrastructure layer for wallet and credits functionality.

## Overview

This directory contains implementations for credit persistence, transactions, and credit operations.

## Structure

```
infrastructure/
├── repositories/    # Data persistence implementations
│   └── CreditsRepository.ts
└── services/         # External service integrations
    └── CreditsService.ts
```

## Credits Repository

Handles credit data persistence with duplicate protection.

### Key Features

- **Duplicate Protection**: Prevents duplicate credit allocations
- **Optimistic Updates**: Immediate UI updates with rollback
- **Transactional**: Atomic credit operations
- **ACCUMULATE Mode**: Adds credits on renewal

### Core Methods

```typescript
class CreditsRepository implements ICreditsRepository {
  async getCredits(userId: string): Promise<UserCredits | null>;
  async initializeCredits(
    userId: string,
    purchaseId?: string,
    productId?: string
  ): Promise<CreditsResult>;
  async deductCredit(userId: string, amount: number): Promise<CreditsResult>;
  async addCredits(userId: string, amount: number): Promise<CreditsResult>;
}
```

### Usage

```typescript
import { CreditsRepository } from './repositories/CreditsRepository';
import { getCreditsRepository } from './repositories/CreditsRepositoryProvider';

const repository = getCreditsRepository();

// Initialize credits
const result = await repository.initializeCredits('user-123', 'purchase-456', 'premium_monthly');
if (result.success) {
  console.log('Credits:', result.data.credits);
}

// Deduct credits
const deductResult = await repository.deductCredit('user-123', 5);
if (deductResult.success) {
  console.log('Credits deducted successfully');
} else if (deductResult.error?.code === 'CREDITS_EXHAUSTED') {
  console.log('Not enough credits');
}
```

## Duplicate Protection

The repository prevents duplicate credit allocations based on `purchaseId`:

```typescript
// First call
await repository.initializeCredits(userId, 'renewal-123', 'premium');
// Returns: { success: true, data: { credits: 100 } }

// Second call with same purchaseId
await repository.initializeCredits(userId, 'renewal-123', 'premium');
// Returns: { success: true, duplicate: true, data: { credits: 100 } }
// Credits not added again
```

## Best Practices

1. **Check Before Deduct**: Always verify credit balance
2. **Handle Errors**: Catch and handle credit errors appropriately
3. **Use Transactions**: Ensure data consistency
4. **Log Operations**: Track credit operations for debugging
5. **Test Edge Cases**: Zero credits, max credits, duplicates
6. **Validate Input**: Validate all input parameters

## Related

- [Wallet Domain](../domain/README.md)
- [Credits Entity](../domain/entities/README.md)
- [useCredits Hook](../../presentation/hooks/useCredits.md)
