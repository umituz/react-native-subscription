# Wallet Domain Entities

Core entities for credits and transaction management.

## Overview

This directory contains domain entities representing credits, transactions, and wallet-related business concepts.

## Entities

### UserCredits
Represents user's credit balance and metadata.

```typescript
interface UserCredits {
  credits: number;           // Current credit balance
  purchasedAt: Date;         // When credits were purchased
  lastUpdatedAt: Date;      // Last update timestamp
}

interface CreditsResult {
  success: boolean;
  data?: UserCredits;
  error?: {
    code: string;
    message: string;
  };
  duplicate?: boolean;       // If this was a duplicate operation
}
```

**Usage:**
```typescript
const credits: UserCredits = {
  credits: 100,
  purchasedAt: new Date('2024-01-01'),
  lastUpdatedAt: new Date('2024-01-15'),
};
```

### Transaction
Represents a credit transaction record.

```typescript
interface Transaction {
  id: string;
  amount: number;           // Positive for additions, negative for deductions
  reason: string;           // Description of transaction
  timestamp: Date;          // When transaction occurred
  type: TransactionType;    // Transaction category
}

type TransactionType =
  | 'purchase'      // Initial purchase
  | 'deduction'     // Feature usage
  | 'bonus'         // Bonus credits
  | 'renewal'       // Subscription renewal
  | 'adjustment';   // Manual adjustment
```

**Usage:**
```typescript
const transaction: Transaction = {
  id: 'tx_123',
  amount: -5,
  reason: 'ai_generation',
  timestamp: new Date(),
  type: 'deduction',
};
```

### CreditPackage
Represents a credit package for purchase.

```typescript
interface CreditPackage {
  id: string;
  amount: number;           // Number of credits
  price: number;            // Price in currency units
  currency: string;         // Currency code (USD, EUR, etc.)
  description?: string;
}
```

## Key Operations

### Check Balance
```typescript
function hasEnoughCredits(credits: UserCredits, required: number): boolean {
  return credits.credits >= required;
}
```

### Calculate Remaining
```typescript
function calculateRemaining(credits: UserCredits, spent: number): number {
  return Math.max(0, credits.credits - spent);
}
```

### Validate Credits
```typescript
function validateCredits(amount: number): void {
  if (amount < 0) {
    throw new Error('Credits cannot be negative');
  }
}
```

## Best Practices

1. **Immutability**: Treat entities as immutable values
2. **Validation**: Validate in entity methods
3. **Type Safety**: Use strict TypeScript types
4. **Business Rules**: Keep business logic in entities
5. **Serialization**: Handle date serialization properly

## Related

- [Wallet Domain](../README.md)
- [Credits Repository](../../infrastructure/repositories/README.md)
- [useCredits Hook](../../../../presentation/hooks/useCredits.md)
