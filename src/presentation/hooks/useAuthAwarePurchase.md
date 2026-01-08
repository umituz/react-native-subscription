# useAuthAwarePurchase Hook

Security-focused purchase hook that requires authentication before any transaction.

## Import

```typescript
import {
  useAuthAwarePurchase,
  configureAuthProvider
} from '@umituz/react-native-subscription';
```

## Configuration

**IMPORTANT**: You must configure the auth provider once at app initialization:

```typescript
import { configureAuthProvider } from '@umituz/react-native-subscription';

// Configure once at app startup
configureAuthProvider({
  isAuthenticated: () => {
    // Return true if user is authenticated
    return auth.currentUser != null;
  },
  showAuthModal: () => {
    // Show your authentication modal/screen
    navigation.navigate('Auth');
  },
});
```

## Signature

```typescript
function useAuthAwarePurchase(): {
  handlePurchase: (pkg: PurchasesPackage) => Promise<boolean>;
  handleRestore: () => Promise<boolean>;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `handlePurchase` | `(pkg) => Promise<boolean>` | Purchase with auth check |
| `handleRestore` | `() => Promise<boolean>` | Restore with auth check |

## Basic Usage

```typescript
function PaywallScreen() {
  const { handlePurchase, handleRestore } = useAuthAwarePurchase();

  const onPurchasePress = async (package: PurchasesPackage) => {
    const success = await handlePurchase(package);
    if (success) {
      console.log('Purchase successful');
    }
  };

  const onRestorePress = async () => {
    const success = await handleRestore();
    if (success) {
      console.log('Restore successful');
    }
  };

  return (
    <View>
      <PackageList onSelectPackage={onPurchasePress} />
      <Button onPress={onRestorePress} title="Restore Purchases" />
    </View>
  );
}
```

## Advanced Usage

### With Auth Provider Setup

```typescript
// App.tsx - Configure at app start
import { configureAuthProvider } from '@umituz/react-native-subscription';
import { auth } from './firebase/config';

export default function App() {
  useEffect(() => {
    configureAuthProvider({
      isAuthenticated: () => {
        return auth.currentUser !== null;
      },
      showAuthModal: () => {
        // Navigate to auth screen or show modal
        navigationRef.current?.navigate('AuthModal', {
          onAuthSuccess: () => {
            // Paywall will be shown again after auth
          },
        });
      },
    });
  }, []);

  return <YourAppNavigation />;
}
```

### With Custom Auth Logic

```typescript
// With your auth library
import { configureAuthProvider } from '@umituz/react-native-subscription';
import { useAuth } from '@umituz/react-native-auth';

export default function App() {
  const { user, showAuthModal } = useAuth();

  useEffect(() => {
    configureAuthProvider({
      isAuthenticated: () => !!user,
      showAuthModal: () => {
        showAuthModal({
          purpose: 'purchase',
          message: 'Sign in to complete your purchase',
        });
      },
    });
  }, [user, showAuthModal]);

  return <YourApp />;
}
```

### With Pending Purchase After Auth

```typescript
function PaywallWithPendingPurchase() {
  const { handlePurchase } = useAuthAwarePurchase();
  const [pendingPackage, setPendingPackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    // If user was not authenticated, purchase is intercepted
    // After authentication, you can retry the purchase
    if (user && pendingPackage) {
      handlePurchase(pendingPackage).then((success) => {
        if (success) {
          setPendingPackage(null);
        }
      });
    }
  }, [user, pendingPackage]);

  const onPurchasePress = async (pkg: PurchasesPackage) => {
    const success = await handlePurchase(pkg);
    if (!success && !user) {
      // User needs to authenticate first
      setPendingPackage(pkg);
    }
  };

  return <PackageList onSelectPackage={onPurchasePress} />;
}
```

### With Error Handling

```typescript
function SecurePaywall() {
  const { handlePurchase, handleRestore } = useAuthAwarePurchase();

  const onPurchasePress = async (pkg: PurchasesPackage) => {
    try {
      const success = await handlePurchase(pkg);

      if (!success) {
        // Check if auth was the issue
        if (!auth.currentUser) {
          console.log('Purchase blocked - user not authenticated');
        } else {
          console.log('Purchase failed for other reasons');
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to complete purchase');
    }
  };

  return (
    <PaywallModal>
      <PackageList onSelectPackage={onPurchasePress} />
    </PaywallModal>
  );
}
```

## Security Features

### Auth Provider Required

The hook will **block all purchases** if auth provider is not configured:

```typescript
// Development mode error
[useAuthAwarePurchase] CRITICAL: Auth provider not configured.
Call configureAuthProvider() at app start. Purchase blocked for security.
```

### Anonymous User Blocking

Purchases are automatically blocked for anonymous/guest users:

```typescript
// Development mode log
[useAuthAwarePurchase] User not authenticated, opening auth modal
```

### Automatic Auth Flow

When an unauthenticated user tries to purchase:

1. Purchase is blocked
2. Auth modal is shown
3. User can authenticate
4. After auth, purchase can be retried

## Examples

### Complete Paywall Implementation

```typescript
function PaywallScreen() {
  const { handlePurchase, handleRestore } = useAuthAwarePurchase();
  const { packages } = useSubscriptionPackages();

  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePackageSelect = async (pkg: PurchasesPackage) => {
    setSelectedPackage(pkg);
    setIsPurchasing(true);

    try {
      const success = await handlePurchase(pkg);

      if (success) {
        Alert.alert('Success', 'You are now a Premium member!');
      }
    } catch (error) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
      setSelectedPackage(null);
    }
  };

  const handleRestorePress = async () => {
    const success = await handleRestore();
    Alert.alert(
      success ? 'Success' : 'Failed',
      success ? 'Purchases restored' : 'No purchases found'
    );
  };

  return (
    <ScrollView>
      <PaywallHeader />

      {packages.map((pkg) => (
        <PackageCard
          key={pkg.identifier}
          package={pkg}
          onSelect={handlePackageSelect}
          disabled={isPurchasing}
          selected={selectedPackage?.identifier === pkg.identifier}
        />
      ))}

      <Button onPress={handleRestorePress} title="Restore Purchases" />

      <TermsAndConditions />
    </ScrollView>
  );
}
```

### In-App Purchase Button

```typescript
function InAppPurchaseButton({ productIdentifier }) {
  const { handlePurchase } = useAuthAwarePurchase();
  const { packages } = useSubscriptionPackages();

  const pkg = packages.find((p) => p.identifier === productIdentifier);

  const onPress = async () => {
    if (!pkg) return;

    const success = await handlePurchase(pkg);

    if (success) {
      onPurchaseSuccess?.();
    }
  };

  return (
    <Button
      onPress={onPress}
      title="Get Premium"
      disabled={!pkg}
    />
  );
}
```

## Best Practices

1. **Configure early** - Set up auth provider at app initialization
2. **Test auth flow** - Verify purchases work for authenticated users
3. **Test guest flow** - Verify guests are prompted to sign in
4. **Handle failures** - Show user-friendly error messages
5. **Clear pending** - Reset pending purchase state after completion
6. **Security first** - Never bypass auth checks
7. **Development testing** - Use dev logs to verify auth checks work

## Security Considerations

### Why Auth Provider is Required

This hook implements a security-first approach to prevent:

1. **Anonymous purchases** - Guest users cannot make purchases
2. **Unauthorized transactions** - Only authenticated users can buy
3. **Payment fraud** - Reduces risk of fraudulent purchases
4. **Compliance** - Meets app store requirements for user identification

### Configuration Checklist

- [ ] Call `configureAuthProvider()` once at app startup
- [ ] Provide `isAuthenticated()` function
- [ ] Provide `showAuthModal()` function
- [ ] Test purchase flow with authenticated user
- [ ] Test purchase flow with unauthenticated user
- [ ] Verify development logs show auth checks
- [ ] Verify purchases are blocked without auth provider

## Related Hooks

- **usePremium** - For purchase and restore operations
- **usePaywallOperations** - For complete paywall purchase handling
- **useAuthGate** - For authentication gating
- **useAuthSubscriptionSync** - For syncing auth with subscription

## See Also

- [Auth Integration](../../hooks/useAuthSubscriptionSync.md)
- [Paywall Screen](../screens/README.md)
- [Security Best Practices](../../../docs/SECURITY.md)
