# usePaywallOperations Hook

Complete paywall purchase operations with authentication handling.

## Import

```typescript
import { usePaywallOperations } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function usePaywallOperations(params: {
  userId: string | undefined;
  isAnonymous: boolean;
  onPaywallClose?: () => void;
  onPurchaseSuccess?: () => void;
  onAuthRequired?: () => void;
}): {
  pendingPackage: PurchasesPackage | null;
  handlePurchase: (pkg: PurchasesPackage) => Promise<boolean>;
  handleRestore: () => Promise<boolean>;
  handleInAppPurchase: (pkg: PurchasesPackage) => Promise<boolean>;
  handleInAppRestore: () => Promise<boolean>;
  completePendingPurchase: () => Promise<boolean>;
  clearPendingPackage: () => void;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | `string \| undefined` | **Required** | Current user ID |
| `isAnonymous` | `boolean` | **Required** | Whether user is anonymous/guest |
| `onPaywallClose` | `() => void` | `undefined` | Callback when paywall closes |
| `onPurchaseSuccess` | `() => void` | `undefined` | Callback after successful purchase |
| `onAuthRequired` | `() => void` | `undefined` | Callback when auth is required |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `pendingPackage` | `PurchasesPackage \| null` | Package waiting for auth |
| `handlePurchase` | `(pkg) => Promise<boolean>` | Handle purchase (post-auth) |
| `handleRestore` | `() => Promise<boolean>` | Handle restore (post-auth) |
| `handleInAppPurchase` | `(pkg) => Promise<boolean>` | Handle purchase (in-app) |
| `handleInAppRestore` | `() => Promise<boolean>` | Handle restore (in-app) |
| `completePendingPurchase` | `() => Promise<boolean>` | Complete purchase after auth |
| `clearPendingPackage` | `() => void` | Clear pending package |

## Basic Usage

```typescript
function PaywallScreen() {
  const { user } = useAuth();
  const { isAnonymous } = useAuth();

  const {
    handlePurchase,
    handleRestore,
  } = usePaywallOperations({
    userId: user?.uid,
    isAnonymous,
    onPurchaseSuccess: () => {
      navigation.goBack();
    },
    onAuthRequired: () => {
      showAuthModal();
    },
  });

  const onPackagePress = async (pkg: PurchasesPackage) => {
    const success = await handlePurchase(pkg);
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
      <PackageList onSelectPackage={onPackagePress} />
      <Button onPress={onRestorePress} title="Restore Purchases" />
    </View>
  );
}
```

## Advanced Usage

### With Pending Purchase Flow

```typescript
function PaywallWithPendingFlow() {
  const { user } = useAuth();
  const { isAnonymous } = useAuth();

  const {
    pendingPackage,
    handlePurchase,
    completePendingPurchase,
    clearPendingPackage,
  } = usePaywallOperations({
    userId: user?.uid,
    isAnonymous,
    onAuthRequired: () => {
      navigation.navigate('AuthModal', {
        purpose: 'purchase',
        onAuthSuccess: () => {
          // Complete purchase after auth
          completePendingPurchase();
        },
      });
    },
  });

  // Show pending package indicator
  useEffect(() => {
    if (pendingPackage && !user) {
      console.log('Package pending authentication:', pendingPackage.identifier);
    }
  }, [pendingPackage, user]);

  const handleCancelAuth = () => {
    clearPendingPackage();
    navigation.goBack();
  };

  return (
    <View>
      {pendingPackage && !user && (
        <Banner>
          <Text>Complete your purchase after signing in</Text>
          <Button onPress={handleCancelAuth} title="Cancel" />
        </Banner>
      )}

      <PackageList onSelectPackage={handlePurchase} />
    </View>
  );
}
```

### With In-App Purchases

```typescript
function InAppPaywall() {
  const { user } = useAuth();
  const { isAnonymous } = useAuth();

  const {
    handleInAppPurchase,
    handleInAppRestore,
  } = usePaywallOperations({
    userId: user?.uid,
    isAnonymous,
    onPaywallClose: () => {
      navigation.goBack();
    },
    onPurchaseSuccess: () => {
      navigation.goBack();
    },
    onAuthRequired: () => {
      showAuthModal();
    },
  });

  return (
    <Modal>
      <PaywallContent>
        <PackageList onSelectPackage={handleInAppPurchase} />
        <RestoreButton onPress={handleInAppRestore} />
        <CloseButton onPress={() => navigation.goBack()} />
      </PaywallContent>
    </Modal>
  );
}
```

### With Purchase Analytics

```typescript
function TrackedPaywall() {
  const { user } = useAuth();
  const { isAnonymous } = useAuth();

  const {
    handlePurchase,
    handleRestore,
    pendingPackage,
  } = usePaywallOperations({
    userId: user?.uid,
    isAnonymous,
    onPurchaseSuccess: () => {
      analytics.track('purchase_completed', {
        userId: user?.uid,
        packageIdentifier: pendingPackage?.identifier,
      });
    },
    onAuthRequired: () => {
      analytics.track('auth_required_for_purchase');
      showAuthModal();
    },
  });

  const onPackageSelect = async (pkg: PurchasesPackage) => {
    analytics.track('purchase_attempted', {
      packageIdentifier: pkg.identifier,
      price: pkg.product.price,
    });

    const success = await handlePurchase(pkg);

    if (!success) {
      analytics.track('purchase_failed', {
        packageIdentifier: pkg.identifier,
      });
    }
  };

  return <PackageList onSelectPackage={onPackageSelect} />;
}
```

### With Error Handling

```typescript
function RobustPaywall() {
  const { user } = useAuth();
  const { isAnonymous } = useAuth();

  const {
    handlePurchase,
    handleRestore,
    completePendingPurchase,
    clearPendingPackage,
  } = usePaywallOperations({
    userId: user?.uid,
    isAnonymous,
    onAuthRequired: () => {
      showAuthModal({
        onAuthSuccess: async () => {
          const success = await completePendingPurchase();
          if (!success) {
            Alert.alert('Error', 'Could not complete purchase');
            clearPendingPackage();
          }
        },
        onAuthCancelled: () => {
          clearPendingPackage();
        },
      });
    },
  });

  const handlePackagePress = async (pkg: PurchasesPackage) => {
    try {
      const success = await handlePurchase(pkg);

      if (!success) {
        if (!user) {
          // Auth required - handled by onAuthRequired
          return;
        }
        // Other failure
        Alert.alert('Purchase Failed', 'Could not complete purchase. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return <PackageList onSelectPackage={handlePackagePress} />;
}
```

## Examples

### Complete Paywall Implementation

```typescript
function PaywallScreen() {
  const { user } = useAuth();
  const { isAnonymous } = useAuth();
  const navigation = useNavigation();

  const {
    pendingPackage,
    handlePurchase,
    handleRestore,
    completePendingPurchase,
    clearPendingPackage,
  } = usePaywallOperations({
    userId: user?.uid,
    isAnonymous,
    onPaywallClose: () => {
      navigation.goBack();
    },
    onPurchaseSuccess: () => {
      // Refresh user data
      queryClient.invalidateQueries(['subscription']);
      navigation.goBack();
    },
    onAuthRequired: () => {
      // Show auth modal with pending purchase context
      navigation.push('AuthModal', {
        purpose: 'purchase',
        message: 'Sign in to complete your purchase',
        onAuthSuccess: async () => {
          const success = await completePendingPurchase();
          if (success) {
            navigation.goBack();
          }
        },
        onAuthCancelled: () => {
          clearPendingPackage();
        },
      });
    },
  });

  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  const onPackagePress = async (pkg: PurchasesPackage) => {
    setSelectedPackage(pkg);
    const success = await handlePurchase(pkg);
    setSelectedPackage(null);
  };

  const onRestorePress = async () => {
    const success = await handleRestore();
    Alert.alert(
      success ? 'Success' : 'No Purchases Found',
      success
        ? 'Your purchases have been restored'
        : 'No previous purchases found for this account'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <PaywallHeader />

      {pendingPackage && !user && (
        <Banner style={styles.pendingBanner}>
          <Text>Complete your purchase after signing in</Text>
        </Banner>
      )}

      <PackageList
        packages={packages}
        selectedPackage={selectedPackage}
        onSelectPackage={onPackagePress}
      />

      <View style={styles.restoreSection}>
        <Button
          onPress={onRestorePress}
          variant="outline"
          title="Restore Purchases"
        />
      </View>

      <TermsAndConditions />
    </ScrollView>
  );
}
```

### Post-Onboarding Purchase

```typescript
function PostOnboardingPaywall() {
  const { user } = useAuth();
  const { isAnonymous } = useAuth();

  const {
    handlePurchase,
    completePendingPurchase,
  } = usePaywallOperations({
    userId: user?.uid,
    isAnonymous,
    onPurchaseSuccess: () => {
      // Navigate to onboarding completion
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    },
    onAuthRequired: () => {
      navigation.navigate('Auth', {
        screen: 'SignUp',
        params: {
          onAuthSuccess: async () => {
            await completePendingPurchase();
          },
        },
      });
    },
  });

  return (
    <View>
      <OnboardingPaywallContent />
      <PackageList onSelectPackage={handlePurchase} />
    </View>
  );
}
```

## Purchase Flow

### Authenticated User

```typescript
user = { uid: 'user-123' }
isAnonymous = false

handlePurchase(package)
→ Purchase proceeds immediately ✅
→ onPurchaseSuccess() called ✅
```

### Anonymous User

```typescript
user = null
isAnonymous = true

handlePurchase(package)
→ Purchase blocked 🚫
→ pendingPackage = package 📦
→ onAuthRequired() called 🔐
→ User completes auth...
→ completePendingPurchase()
→ Purchase proceeds ✅
```

### Pending Package Management

```typescript
// User selects package while not authenticated
handlePurchase(monthlyPackage)
→ pendingPackage = monthlyPackage
→ onAuthRequired() triggered

// User cancels auth
clearPendingPackage()
→ pendingPackage = null

// Or user completes auth
completePendingPurchase()
→ Purchases monthlyPackage
→ pendingPackage = null
```

## Best Practices

1. **Handle auth flow** - Implement onAuthRequired callback
2. **Show pending state** - Display indicator when package is pending
3. **Clear pending** - Reset pending when user cancels auth
4. **Track events** - Monitor purchase attempts and completions
5. **Handle errors** - Show user-friendly error messages
6. **Test both flows** - Authenticated and anonymous users
7. **Provide restore** - Always offer restore purchases option

## Related Hooks

- **usePremium** - For purchase and restore operations
- **useAuthAwarePurchase** - For auth-gated purchases
- **usePaywallVisibility** - For paywall visibility control

## See Also

- [Paywall Screen](../screens/README.md)
- [Purchase Flow](../../../docs/PURCHASE_FLOW.md)
- [Auth Integration](./useAuthSubscriptionSync.md)
