# useInitializeCredits Hook

TanStack Query mutation hook for initializing credits after purchase.

## Import

```typescript
import { useInitializeCredits } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useInitializeCredits(params: {
  userId: string | undefined;
}): {
  initializeCredits: (options?: {
    purchaseId?: string;
    productId?: string;
  }) => Promise<boolean>;
  isInitializing: boolean;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | `string \| undefined` | **Required** | User ID for credit initialization |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `initializeCredits` | `(options?) => Promise<boolean>` | Initialize credits function |
| `isInitializing` | `boolean` | Mutation is in progress |

## Options

| Property | Type | Default | Description |
|-----------|------|---------|-------------|
| `purchaseId` | `string` | `undefined` | Optional purchase/renewal ID |
| `productId` | `string` | `undefined` | Optional product ID |

## Basic Usage

```typescript
function CreditsInitializer() {
  const { user } = useAuth();

  const { initializeCredits, isInitializing } = useInitializeCredits({
    userId: user?.uid,
  });

  const handleInitialize = async () => {
    const success = await initializeCredits();

    if (success) {
      Alert.alert('Success', 'Credits initialized successfully');
    } else {
      Alert.alert('Error', 'Failed to initialize credits');
    }
  };

  return (
    <Button
      onPress={handleInitialize}
      disabled={isInitializing}
      title={isInitializing ? 'Initializing...' : 'Initialize Credits'}
    />
  );
}
```

## Advanced Usage

### With Purchase ID

```typescript
function PurchaseCompletion() {
  const { user } = useAuth();

  const { initializeCredits, isInitializing } = useInitializeCredits({
    userId: user?.uid,
  });

  const handlePurchaseComplete = async (transaction: PurchaseTransaction) => {
    const success = await initializeCredits({
      purchaseId: transaction.transactionId,
      productId: transaction.productId,
    });

    if (success) {
      analytics.track('credits_initialized', {
        userId: user?.uid,
        purchaseId: transaction.transactionId,
      });
    }

    return success;
  };

  return <PurchaseFlow onComplete={handlePurchaseComplete} />;
}
```

### With Auto-Initialize for Premium

```typescript
function PremiumUserSetup() {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { credits } = useCredits();

  const { initializeCredits, isInitializing } = useInitializeCredits({
    userId: user?.uid,
  });

  useEffect(() => {
    // Auto-initialize credits for premium users who don't have them yet
    if (isPremium && !credits && !isInitializing) {
      const init = async () => {
        const success = await initializeCredits();
        if (success) {
          console.log('Credits initialized for premium user');
        }
      };
      init();
    }
  }, [isPremium, credits]);

  return <YourAppContent />;
}
```

### With Product-Specific Allocations

```typescript
function ProductBasedAllocation() {
  const { user } = useAuth();

  const { initializeCredits } = useInitializeCredits({
    userId: user?.uid,
  });

  const handlePurchase = async (productId: string) => {
    // Different products provide different credit amounts
    const productConfig = {
      'premium_monthly': { credits: 100 },
      'premium_yearly': { credits: 1200 },
      'credits_small': { credits: 50 },
      'credits_large': { credits: 500 },
    };

    const config = productConfig[productId];
    if (!config) {
      Alert.alert('Error', 'Unknown product');
      return;
    }

    const success = await initializeCredits({
      purchaseId: `purchase_${Date.now()}`,
      productId,
    });

    if (success) {
      Alert.alert('Success', `You received ${config.credits} credits!`);
    }
  };

  return <PackageList onSelectPackage={handlePurchase} />;
}
```

### With Error Handling

```typescript
function RobustInitialization() {
  const { user } = useAuth();

  const {
    initializeCredits,
    isInitializing,
  } = useInitializeCredits({
    userId: user?.uid,
  });

  const handleInitialize = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const success = await initializeCredits({
        purchaseId: `init_${Date.now()}`,
        productId: 'premium_subscription',
      });

      if (success) {
        Alert.alert('Success', 'Credits initialized');
      } else {
        Alert.alert('Failed', 'Could not initialize credits');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert(
        'Error',
        'Failed to initialize credits. Please try again.'
      );
    }
  };

  return (
    <Button
      onPress={handleInitialize}
      disabled={isInitializing}
      title="Initialize Credits"
    />
  );
}
```

### With Retry Logic

```typescript
function InitializationWithRetry() {
  const { user } = useAuth();

  const { initializeCredits, isInitializing } = useInitializeCredits({
    userId: user?.uid,
  });

  const handleInitializeWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      const success = await initializeCredits();

      if (success) {
        Alert.alert('Success', 'Credits initialized');
        return true;
      }

      // Wait before retry
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    Alert.alert('Failed', 'Could not initialize credits after retries');
    return false;
  };

  return (
    <Button
      onPress={() => handleInitializeWithRetry()}
      disabled={isInitializing}
      title="Initialize (with retry)"
    />
  );
}
```

## Examples

### Post-Purchase Flow

```typescript
function PostPurchaseFlow() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const { initializeCredits, isInitializing } = useInitializeCredits({
    userId: user?.uid,
  });

  useEffect(() => {
    const handlePurchase = async (purchase: any) => {
      console.log('Purchase completed:', purchase);

      const success = await initializeCredits({
        purchaseId: purchase.transactionId,
        productId: purchase.productId,
      });

      if (success) {
        // Navigate to success screen
        navigation.replace('PurchaseSuccess', {
          credits: purchase.credits,
        });
      } else {
        // Show error
        Alert.alert(
          'Setup Required',
          'Could not initialize credits. Please contact support.'
        );
      }
    };

    const subscription = purchasesEmitter.on('purchase_complete', handlePurchase);

    return () => subscription.remove();
  }, []);

  if (isInitializing) {
    return (
      <View>
        <ActivityIndicator size="large" />
        <Text>Setting up your credits...</Text>
      </View>
    );
  }

  return <YourAppContent />;
}
```

### Subscription Renewal Handler

```typescript
function RenewalHandler() {
  const { user } = useAuth();

  const { initializeCredits } = useInitializeCredits({
    userId: user?.uid,
  });

  useEffect(() => {
    const handleRenewal = async (renewalInfo: RenewalEvent) => {
      console.log('Subscription renewed:', renewalInfo);

      const success = await initializeCredits({
        purchaseId: renewalInfo.renewalId,
        productId: renewalInfo.productId,
      });

      if (success) {
        analytics.track('subscription_renewed', {
          userId: user?.uid,
          renewalId: renewalInfo.renewalId,
        });

        // Notify user
        showNotification('Credits Added!', 'Your subscription has renewed');
      }
    };

    const subscription = subscriptionEmitter.on('renewal', handleRenewal);

    return () => subscription.remove();
  }, []);

  return null;
}
```

### Manual Admin Initialization

```typescript
function AdminCreditInitializer() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const { initializeCredits, isInitializing } = useInitializeCredits({
    userId: targetUserId, // Admin can initialize for other users
  });

  const handleAdminInit = async () => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Admin access required');
      return;
    }

    Alert.alert(
      'Confirm Initialization',
      'Initialize credits for this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Initialize',
          onPress: async () => {
            const success = await initializeCredits({
              purchaseId: `admin_init_${Date.now()}`,
              productId: 'admin_grant',
            });

            Alert.alert(
              success ? 'Success' : 'Failed',
              success ? 'Credits initialized' : 'Could not initialize credits'
            );
          },
        },
      ]
    );
  };

  if (!isAdmin) return null;

  return (
    <Button
      onPress={handleAdminInit}
      disabled={isInitializing}
      title="Initialize Credits (Admin)"
    />
  );
}
```

## Development Logging

In development mode, the hook logs useful information:

```typescript
// Initialization starts
[useInitializeCredits] Initializing: { userId: 'user-123', purchaseId: 'purchase-456', productId: 'premium_monthly' }

// Success
[useInitializeCredits] Success: { credits: 100, purchasedAt: '2024-01-15T10:30:00Z' }

// Error
[useInitializeCredits] Error: Some error message
```

## Best Practices

1. **Validate userId** - Always check user is authenticated
2. **Provide purchase info** - Include purchaseId and productId when possible
3. **Handle loading** - Show loading state during initialization
4. **Track success** - Log successful initializations
5. **Retry on failure** - Implement retry logic for reliability
6. **Use duplicate protection** - Repository handles duplicate purchase IDs
7. **Test scenarios** - Test new purchase, renewal, admin init

## Duplicate Protection

The repository prevents duplicate initialization with the same purchase ID:

```typescript
// First call
await initializeCredits({ purchaseId: 'renewal_123', productId: 'premium' });
// Returns: success, credits: 100 ✅

// Second call with same purchaseId
await initializeCredits({ purchaseId: 'renewal_123', productId: 'premium' });
// Returns: success, credits: 100 (same as before, not added again) ✅
```

## Related Hooks

- **useCredits** - For accessing credits balance
- **useDeductCredit** - For deducting credits
- **usePremiumWithCredits** - For premium + credits integration
- **useDevTestCallbacks** - For testing credit initialization

## See Also

- [Credits Repository](../../infrastructure/repositories/CreditsRepository.md)
- [Credits Entity](../../../domains/wallet/domain/entities/Credits.md)
- [Credits README](../../../domains/wallet/README.md)
