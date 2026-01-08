# Wallet Domain Errors

Domain-specific errors for wallet and credit operations.

## Overview

This directory contains custom error classes representing wallet-related error conditions.

## Error Types

### CreditsExhaustedError
Thrown when user doesn't have enough credits for an operation.

```typescript
class CreditsExhaustedError extends Error {
  constructor(
    public currentBalance: number,
    public required: number
  ) {
    super(
      `Insufficient credits: ${currentBalance}/${required} required`,
      'CREDITS_EXHAUSTED'
    );
    this.name = 'CreditsExhaustedError';
  }
}
```

**Usage:**
```typescript
import { CreditsExhaustedError } from './errors/CreditsExhaustedError';

function deductCredits(credits: UserCredits, amount: number) {
  if (credits.credits < amount) {
    throw new CreditsExhaustedError(credits.credits, amount);
  }
  // Proceed with deduction
}
```

### DuplicatePurchaseError
Thrown when attempting to add credits for a duplicate purchase ID.

```typescript
class DuplicatePurchaseError extends Error {
  constructor(
    public purchaseId: string,
    public existingCredits: UserCredits
  ) {
    super(
      `Duplicate purchase ID: ${purchaseId}`,
      'DUPLICATE_PURCHASE'
    );
    this.name = 'DuplicatePurchaseError';
  }
}
```

**Usage:**
```typescript
try {
  await repository.initializeCredits(userId, purchaseId);
} catch (error) {
  if (error instanceof DuplicatePurchaseError) {
    console.log('Credits already added for this purchase');
  }
}
```

### CreditsValidationError
Thrown when credit validation fails.

```typescript
class CreditsValidationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message, code);
    this.name = 'CreditsValidationError';
  }
}
```

**Usage:**
```typescript
function validateCreditAmount(amount: number) {
  if (amount < 0) {
    throw new CreditsValidationError(
      'Credit amount cannot be negative',
      'INVALID_AMOUNT'
    );
  }
  if (amount > 10000) {
    throw new CreditsValidationError(
      'Credit amount exceeds maximum',
      'EXCEEDS_MAXIMUM'
    );
  }
}
```

## Error Handling Pattern

```typescript
import {
  CreditsExhaustedError,
  DuplicatePurchaseError,
  CreditsValidationError
} from './errors';

async function handleCreditOperation(userId: string, cost: number) {
  try {
    const result = await repository.deductCredit(userId, cost);
    return result;
  } catch (error) {
    if (error instanceof CreditsExhaustedError) {
      // Show paywall or upgrade prompt
      showPaywall({ required: cost, current: error.currentBalance });
    } else if (error instanceof DuplicatePurchaseError) {
      // Log and continue (not a critical error)
      console.warn('Duplicate purchase detected');
    } else if (error instanceof CreditsValidationError) {
      // Log validation error
      console.error('Validation failed:', error.message);
    } else {
      // Unexpected error
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
```

## Error Codes Reference

| Code | Description | Recovery |
|------|-------------|----------|
| `CREDITS_EXHAUSTED` | Not enough credits | Show paywall/upgrade |
| `DUPLICATE_PURCHASE` | Duplicate purchase ID | Ignore (idempotent) |
| `INVALID_AMOUNT` | Invalid credit amount | Validate input |
| `EXCEEDS_MAXIMUM` | Amount too large | Cap at maximum |
| `USER_NOT_FOUND` | User doesn't exist | Create user record |
| `INITIALIZATION_FAILED` | Credit init failed | Retry operation |

## Best Practices

1. **Specific Errors**: Use specific error types for different scenarios
2. **Error Context**: Include relevant data in error properties
3. **Graceful Handling**: Handle errors appropriately at boundaries
4. **Logging**: Log errors for debugging
5. **User Feedback**: Convert errors to user-friendly messages

## Related

- [Wallet Entities](../entities/README.md)
- [Credits Repository](../../infrastructure/repositories/README.md)
