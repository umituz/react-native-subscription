# RevenueCat Presentation Hooks

React hooks for accessing RevenueCat data and operations.

## Overview

This directory contains React hooks that expose RevenueCat functionality to the presentation layer.

## Contents

- **useCustomerInfo.ts** - Hook for accessing RevenueCat customer info
- **useSubscriptionPackages.ts** - Hook for accessing subscription packages/offering

## Key Hooks

### useCustomerInfo

Access RevenueCat customer information including entitlements.

```typescript
function useCustomerInfo() {
  const { customerInfo, isLoading } = useCustomerInfo();

  return (
    <View>
      <Text>Entitlements: {Object.keys(customerInfo.entitlements.active).join(', ')}</Text>
    </View>
  );
}
```

### useSubscriptionPackages

Access available subscription packages from current offering.

```typescript
function PackageList() {
  const { packages, isLoading } = useSubscriptionPackages();

  if (isLoading) return <Loading />;

  return (
    <View>
      {packages.map(pkg => (
        <PackageCard key={pkg.identifier} package={pkg} />
      ))}
    </View>
  );
}
```

## Related

- [Main Hooks](../../../presentation/hooks/README.md)
- [Domain](../../domain/README.md)
- [Services](../infrastructure/services/README.md)
