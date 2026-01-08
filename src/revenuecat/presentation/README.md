# RevenueCat Presentation

Presentation layer for RevenueCat integration.

## Overview

This directory contains React hooks, components, and utilities for integrating RevenueCat functionality into the UI layer.

## Components

This directory may contain:

### Hooks

Custom React hooks for RevenueCat operations.

**Potential Hooks:**
- `useRevenueCatCustomerInfo` - Fetch and monitor customer info
- `useRevenueCatOfferings` - Fetch available offerings
- `useRevenueCatPurchase` - Handle purchase flow
- `useRevenueCatEntitlement` - Check entitlement status

**Example:**
```typescript
function useRevenueCatOfferings() {
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const service = getRevenueCatService();
      const result = await service.getOfferings();
      setOfferings(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { offerings, loading, error, refetch: loadOfferings };
}
```

### Components

React components for displaying RevenueCat data.

**Potential Components:**
- `PackageList` - Display available packages
- `PackageCard` - Display individual package
- `EntitlementBadge` - Show entitlement status
- `SubscriptionStatus` - Display subscription status

**Example:**
```typescript
function PackageCard({
  package,
  onPress,
  highlight = false,
}: {
  package: Package;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, highlight && styles.highlight]}
    >
      <Text style={styles.title}>
        {package.product.title}
      </Text>
      <Text style={styles.price}>
        {package.localizedPriceString}
      </Text>
      {package.product.description && (
        <Text style={styles.description}>
          {package.product.description}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

## Usage Patterns

### Displaying Offerings

```typescript
import { useRevenueCatOfferings } from './hooks/useRevenueCatOfferings';
import { PackageCard } from './components/PackageCard';

function PremiumPackages() {
  const { offerings, loading, error } = useRevenueCatOfferings();

  if (loading) return <LoadingSpinner />;
  if (error) return <Error message={error.message} />;
  if (!offerings?.current) return <EmptyState />;

  return (
    <ScrollView horizontal>
      {offerings.current.availablePackages.map(pkg => (
        <PackageCard
          key={pkg.identifier}
          package={pkg}
          onPress={() => handlePurchase(pkg)}
          highlight={pkg.packageType === 'annual'}
        />
      ))}
    </ScrollView>
  );
}
```

### Checking Entitlements

```typescript
import { useRevenueCatCustomerInfo } from './hooks/useRevenueCatCustomerInfo';

function PremiumContent() {
  const { customerInfo, loading } = useRevenueCatCustomerInfo();

  if (loading) return <LoadingSpinner />;

  const hasPremium = customerInfo?.entitlements.premium?.isActive ?? false;

  if (!hasPremium) {
    return <UpgradePrompt />;
  }

  return <PremiumFeatures />;
}
```

### Purchase Flow

```typescript
import { useRevenueCatPurchase } from './hooks/useRevenueCatPurchase';

function PurchaseButton({ package }: { package: Package }) {
  const { purchase, purchasing } = useRevenueCatPurchase();

  const handlePurchase = async () => {
    const result = await purchase(package);

    if (result.error) {
      Alert.alert('Purchase Failed', result.error.message);
    } else {
      Alert.alert('Success', 'Purchase completed!');
    }
  };

  return (
    <Button onPress={handlePurchase} disabled={purchasing}>
      {purchasing ? 'Purchasing...' : 'Subscribe'}
    </Button>
  );
}
```

## Best Practices

1. **Loading States**: Always show loading states during async operations
2. **Error Handling**: Handle and display errors appropriately
3. **Optimistic Updates**: Update UI optimistically where possible
4. **Caching**: Cache customer info and offerings
5. **Reactivity**: Re-render on entitlement changes
6. **User Feedback**: Provide clear feedback during purchases
7. **Validation**: Validate data before displaying

## Related

- [RevenueCat Integration](../README.md)
- [RevenueCat Application](../application/README.md)
- [RevenueCat Infrastructure](../infrastructure/README.md)
- [RevenueCat Domain](../domain/README.md)
