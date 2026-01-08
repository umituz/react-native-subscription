# Wallet Domain

Wallet domain containing credits and transaction management logic.

## Overview

The wallet domain manages user credits, transactions, and credit allocation strategies. It handles credit initialization after purchase, credit deduction, and transaction history.

## Structure

```
wallet/
├── domain/
│   ├── entities/      # Credit and transaction entities
│   ├── errors/        # Wallet-specific errors
│   ├── types/         # Wallet type definitions
│   └── mappers/       # Data transformation mappers
├── infrastructure/
│   ├── repositories/  # Credits persistence
│   └── services/      # Credit operations
├── presentation/
│   ├── hooks/         # React hooks for credits
│   ├── components/    # Credit UI components
│   └── screens/       # Credit management screens
```

## Core Concepts

### Credits
User credits balance that can be consumed for premium features.

```typescript
interface UserCredits {
  credits: number;
  purchasedAt: Date;
  lastUpdatedAt: Date;
}
```

### Transactions
Record of credit transactions (additions and deductions).

```typescript
interface Transaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: Date;
  type: 'purchase' | 'deduction' | 'bonus' | 'renewal';
}
```

### Allocation Modes

**ACCUMULATE**: Add credits to existing balance (renewals)
```typescript
// Renewal: 100 + 100 = 200 credits
```

**REPLACE**: Replace existing credits (new purchase)
```typescript
// New purchase: Old balance replaced with new amount
```

## Key Features

- **Duplicate Protection**: Prevent duplicate credit allocations
- **Transactional Operations**: Atomic credit updates
- **Optimistic Updates**: Immediate UI with rollback
- **Transaction History**: Complete audit trail
- **Monthly Reset**: Credits reset on subscription renewal

## Usage

```typescript
// In hooks or components
import { useCredits } from './presentation/hooks/useCredits';
import { useDeductCredit } from './presentation/hooks/useDeductCredit';

function Feature() {
  const { credits } = useCredits({ userId: user?.uid });
  const { deductCredit } = useDeductCredit({
    userId: user?.uid,
    onCreditsExhausted: () => showPaywall(),
  });

  const handleUseFeature = async () => {
    const success = await deductCredit(5);
    if (success) {
      await executeFeature();
    }
  };
}
```

## Best Practices

1. **Check Balance First**: Verify credits before operations
2. **Handle Exhaustion**: Provide upgrade path when credits low
3. **Track Usage**: Log all credit transactions
4. **Reset Credits**: Clear credits on subscription renewal
5. **Test Edge Cases**: Zero credits, max credits, duplicates

## Related

- [Credits README](./README.md)
- [Credits Entity](./domain/entities/Credits.md)
- [useCredits Hook](../../presentation/hooks/useCredits.md)
