# Domain Errors

Domain-specific error types for subscription system.

## Purpose

Domain errors provide typed, contextual error handling for business logic failures. They make error handling explicit and type-safe.

## Error Hierarchy

```
Error (JavaScript)
└── SubscriptionError (Domain base)
    ├── SubscriptionValidationError
    ├── SubscriptionRepositoryError
    ├── SubscriptionOperationError
    └── InsufficientCreditsError
```

## Error Types

### SubscriptionError

Base error for all subscription-related errors.

```typescript
class SubscriptionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }
}
```

### SubscriptionValidationError

Thrown when validation fails.

```typescript
throw new SubscriptionValidationError('Invalid user ID');
```

### SubscriptionRepositoryError

Thrown when repository operations fail.

```typescript
throw new SubscriptionRepositoryError('Database connection failed');
```

### InsufficientCreditsError

Thrown when user doesn't have enough credits.

```typescript
throw new InsufficientCreditsError(
  'Not enough credits',
  {
    required: 10,
    available: 5,
    featureId: 'export',
  }
);
```

## Usage

### Throwing Errors

```typescript
function deductCredits(amount: number) {
  if (amount <= 0) {
    throw new SubscriptionValidationError(
      'Amount must be positive',
      'INVALID_AMOUNT',
      { amount }
    );
  }

  if (currentBalance < amount) {
    throw new InsufficientCreditsError(
      'Insufficient credits',
      {
        required: amount,
        available: currentBalance,
      }
    );
  }
}
```

### Catching Errors

```typescript
try {
  await purchasePackage(packageToPurchase);
} catch (error) {
  if (error instanceof InsufficientCreditsError) {
    console.log(`Need ${error.context.required} credits`);
    showPaywall();
  } else if (error instanceof SubscriptionValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof SubscriptionError) {
    console.error('Subscription error:', error.code, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Type Guards

```typescript
function isSubscriptionError(error: unknown): error is SubscriptionError {
  return error instanceof SubscriptionError;
}

function isInsufficientCreditsError(error: unknown): error is InsufficientCreditsError {
  return error instanceof InsufficientCreditsError;
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_USER_ID` | User ID is invalid or missing |
| `INVALID_PRODUCT_ID` | Product ID is not recognized |
| `INVALID_AMOUNT` | Amount is invalid (e.g., negative) |
| `INSUFFICIENT_CREDITS` | User doesn't have enough credits |
| `SUBSCRIPTION_EXPIRED` | Subscription has expired |
| `SUBSCRIPTION_NOT_FOUND` | Subscription doesn't exist |
| `REPOSITORY_ERROR` | Database/repository error |
| `NETWORK_ERROR` | Network connectivity issue |
| `PURCHASE_CANCELLED` | User cancelled purchase |
| `PURCHASE_FAILED` | Purchase operation failed |

## Error Context

Errors can include contextual information:

```typescript
interface InsufficientCreditsContext {
  required: number;
  available: number;
  featureId?: string;
  currency?: string;
}

throw new InsufficientCreditsError(
  'Insufficient credits',
  {
    required: 10,
    available: 5,
    featureId: 'export',
    currency: 'credits',
  }
);
```

## Custom Errors

Create your own domain errors:

```typescript
class FeatureAccessError extends SubscriptionError {
  constructor(
    featureId: string,
    public readonly requiredTier: UserTier,
    public readonly currentTier: UserTier
  ) {
    super(
      `Feature "${featureId}" requires ${requiredTier} tier`,
      'FEATURE_ACCESS_DENIED',
      { featureId, requiredTier, currentTier }
    );
    this.name = 'FeatureAccessError';
  }
}

// Usage
if (!canAccessFeature('advanced_analytics')) {
  throw new FeatureAccessError(
    'advanced_analytics',
    'premium',
    userTier
  );
}
```

## Error Handling Patterns

### 1. Try-Catch with Type Guards

```typescript
try {
  await executeOperation();
} catch (error) {
  if (error instanceof InsufficientCreditsError) {
    handleInsufficientCredits(error);
  } else if (error instanceof SubscriptionError) {
    handleSubscriptionError(error);
  } else {
    handleUnexpectedError(error);
  }
}
```

### 2. Result Type

```typescript
type Result<T, E extends Error = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function deductCredits(
  amount: number
): Promise<Result<number, InsufficientCreditsError>> {
  if (currentBalance < amount) {
    return {
      success: false,
      error: new InsufficientCreditsError('...', {...}),
    };
  }

  return { success: true, data: newBalance };
}

// Usage
const result = await deductCredits(10);
if (result.success) {
  console.log('New balance:', result.data);
} else {
  console.error('Error:', result.error.message);
}
```

### 3. Error Boundary

```typescript
class SubscriptionErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    if (error instanceof SubscriptionError) {
      analytics().logEvent('subscription_error', {
        code: error.code,
        message: error.message,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## Best Practices

1. **Use specific error types** - Don't use generic Error
2. **Include context** - Add relevant data to errors
3. **Document error codes** - List all possible errors
4. **Handle gracefully** - Show user-friendly messages
5. **Log errors** - Track for debugging
6. **Don't swallow errors** - Always handle or rethrow
7. **Use type guards** - Enable type-safe error handling

## Testing

```typescript
describe('InsufficientCreditsError', () => {
  it('should create error with context', () => {
    const error = new InsufficientCreditsError('Not enough credits', {
      required: 10,
      available: 5,
    });

    expect(error.context.required).toBe(10);
    expect(error.context.available).toBe(5);
  });

  it('should be instance of SubscriptionError', () => {
    const error = new InsufficientCreditsError('...', {...});

    expect(error).toBeInstanceOf(SubscriptionError);
  });
});
```

## Related

- [Domain Entities](../entities/README.md)
- [Value Objects](../value-objects/README.md)
- [Domain Layer](../../README.md)
