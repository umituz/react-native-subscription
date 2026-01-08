# Migration Guide

Guides for migrating from different versions or systems to @umituz/react-native-subscription.

## Table of Contents

- [Migrating from v1 to v2](#migrating-from-v1-to-v2)
- [Migrating from Direct RevenueCat](#migrating-from-direct-revenuecat)
- [Migrating from Other Solutions](#migrating-from-other-solutions)
- [Breaking Changes](#breaking-changes)

## Migrating from v1 to v2

### Overview

Version 2 introduces Domain-Driven Design (DDD) architecture and separates concerns into domains.

### Major Changes

#### 1. Import Paths Changed

**Before (v1):**
```typescript
import { usePremium, Paywall } from '@umituz/react-native-subscription';
```

**After (v2):**
```typescript
import {
  usePremium,
  PaywallModal,
} from '@umituz/react-native-subscription';

// Domain-specific imports
import {
  useWallet,
  useTransactionHistory,
} from '@umituz/react-native-subscription/wallet';
```

#### 2. Credits System Moved

**Before (v1):**
```typescript
import { useCredits, CreditsRepository } from '@umituz/react-native-subscription';
```

**After (v2):**
```typescript
import {
  useCredits,
  useTransactionHistory,
} from '@umituz/react-native-subscription';

import {
  configureCreditsRepository,
  getCreditsRepository,
} from '@umituz/react-native-subscription/wallet';
```

#### 3. Initialization Changed

**Before (v1):**
```typescript
import { SubscriptionManager } from '@umituz/react-native-subscription';

SubscriptionManager.initialize(config);
```

**After (v2):**
```typescript
import { SubscriptionProvider } from '@umituz/react-native-subscription';

function App() {
  return (
    <SubscriptionProvider config={config}>
      <YourApp />
    </SubscriptionProvider>
  );
}
```

#### 4. Configuration Changed

**Before (v1):**
```typescript
const config = {
  apiKey: 'your_key',
  products: ['product1', 'product2'],
};
```

**After (v2):**
```typescript
const config = {
  revenueCatApiKey: 'your_key',
  revenueCatEntitlementId: 'premium',
  creditPackages: [
    {
      id: 'credits_small',
      productId: 'com.app.credits.100',
      amount: 100,
      price: 0.99,
    },
  ],
};
```

### Step-by-Step Migration

#### Step 1: Update Dependencies

```bash
# Remove old version
npm uninstall @umituz/react-native-subscription

# Install new version
npm install @umituz/react-native-subscription@latest

# Update peer dependencies
npm install react-native-purchases@^7.0.0
npm install @tanstack/react-query@^5.0.0
```

#### Step 2: Update Initialization

**Old Code:**
```typescript
// App.tsx (v1)
import { SubscriptionManager } from '@umituz/react-native-subscription';

function App() {
  useEffect(() => {
    SubscriptionManager.initialize({
      apiKey: 'your_key',
    });
  }, []);

  return <YourApp />;
}
```

**New Code:**
```typescript
// App.tsx (v2)
import { SubscriptionProvider } from '@umituz/react-native-subscription';

const config = {
  revenueCatApiKey: 'your_key',
  revenueCatEntitlementId: 'premium',
};

function App() {
  return (
    <SubscriptionProvider config={config}>
      <YourApp />
    </SubscriptionProvider>
  );
}
```

#### Step 3: Update Hooks

**Old Code:**
```typescript
// v1
const { premium, status } = useSubscription();
const { credits, deduct } = useCredits();
```

**New Code:**
```typescript
// v2
const { isPremium, subscription } = usePremium();
const { credits, consumeCredit } = useCredits();
```

#### Step 4: Update Components

**Old Code:**
```typescript
// v1
<Paywall
  visible={showPaywall}
  onClose={() => setShowPaywall(false)}
/>
```

**New Code:**
```typescript
// v2
<PaywallModal
  isVisible={showPaywall}
  onClose={() => setShowPaywall(false)}
  config={{
    title: 'Unlock Premium',
    features: [
      { icon: 'star', text: 'Unlimited' },
    ],
  }}
/>
```

#### Step 5: Update Error Handling

**Old Code:**
```typescript
// v1
try {
  await purchase();
} catch (error) {
  console.error(error);
}
```

**New Code:**
```typescript
// v2
const result = await purchase();

if (!result.success) {
  console.error(result.error?.message);
  // Handle specific error types
  if (result.error?.code === 'USER_CANCELLED') {
    // User cancelled
  }
}
```

## Migrating from Direct RevenueCat

### Overview

Coming from direct RevenueCat implementation to our wrapper.

### Before: Direct RevenueCat

```typescript
import { Purchases } from 'react-native-purchases';

// Initialize
await Purchases.configure({ apiKey: 'your_key' });

// Get offerings
const offerings = await Purchases.getOfferings();

// Purchase
const result = await Purchases.purchasePackage(packageToPurchase);

// Check subscription
const customerInfo = await Purchases.getCustomerInfo();
const isPremium = !!customerInfo.entitlements.active.premium;
```

### After: Using This Package

```typescript
import {
  SubscriptionProvider,
  usePremium,
  usePaywallActions,
} from '@umituz/react-native-subscription';

// Wrap app
function App() {
  return (
    <SubscriptionProvider config={config}>
      <YourApp />
    </SubscriptionProvider>
  );
}

// Use hooks
function MyComponent() {
  const { isPremium } = usePremium();
  const { handlePurchase } = usePaywallActions();

  return (
    <Button onPress={handlePurchase} title="Subscribe" />
  );
}
```

### Migration Benefits

1. ✅ **React Hooks** - No more manual state management
2. ✅ **Type Safety** - Full TypeScript support
3. ✅ **Error Handling** - Built-in error handling
4. ✅ **UI Components** - Ready-to-use paywall components
5. ✅ **Credits System** - Built-in credits management
6. ✅ **Analytics** - Automatic event tracking

## Migrating from Other Solutions

### From react-native-iap

**Before:**
```typescript
import RNIap, {
  Product,
  ProductPurchase,
  SubscriptionPurchase,
  purchaseSubscription,
} from 'react-native-iap';

// Get products
const products = await RNIap.getSubscriptions([
  'com.app.premium.monthly',
]);

// Purchase
const purchase = await purchaseSubscription(
  'com.app.premium.monthly'
);
```

**After:**
```typescript
import {
  useSubscriptionPackages,
  usePaywallActions,
} from '@umituz/react-native-subscription';

function MyComponent() {
  const { packages } = useSubscriptionPackages();
  const { handlePurchase } = usePaywallActions();

  return packages.map(pkg => (
    <Button
      key={pkg.identifier}
      onPress={() => handlePurchase(pkg)}
      title={pkg.product.priceString}
    />
  ));
}
```

### From expo-in-app-purchases

**Before:**
```typescript
import * as InAppPurchases from 'expo-in-app-purchases';

// Get products
const { response } = await InAppPurchases.getProductsAsync([
  'com.app.premium.monthly',
]);

// Purchase
InAppPurchases.purchaseItemAsync('com.app.premium.monthly');
```

**After:**
```typescript
import { PaywallModal } from '@umituz/react-native-subscription';

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <Button onPress={() => setShowPaywall(true)} title="Upgrade" />
      <PaywallModal
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </>
  );
}
```

## Breaking Changes

### Version 2.0.0

#### Credits System

**Removed:**
```typescript
// Removed direct export
import { CreditsRepository } from '@umituz/react-native-subscription';
```

**Use Instead:**
```typescript
import {
  configureCreditsRepository,
  getCreditsRepository,
} from '@umituz/react-native-subscription';
```

#### Subscription Status

**Changed:**
```typescript
// v1
interface SubscriptionStatus {
  active: boolean;
  premium: boolean;
}

// v2
interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  type: 'unknown' | 'guest' | 'free' | 'premium';
}
```

#### Hooks

**Renamed:**
```typescript
// v1 -> v2
useSubscriptionStatus() -> useSubscription()
useSubscriptionInfo() -> useSubscriptionDetails()
```

#### Components

**Renamed:**
```typescript
// v1 -> v2
<Paywall /> -> <PaywallModal />
<SubscriptionCard /> -> <PremiumDetailsCard />
```

### Version 2.14.0

#### Domain Separation

**New Import Paths:**
```typescript
// Wallet domain
import { useWallet } from '@umituz/react-native-subscription/wallet';

// Paywall domain
import { usePaywall } from '@umituz/react-native-subscription/paywall';

// Config domain
import { Plan } from '@umituz/react-native-subscription/config';
```

#### Credits Repository

**Changed:**
```typescript
// v2.13.x
const repository = new CreditsRepository(config);

// v2.14.0
configureCreditsRepository(config);
const repository = getCreditsRepository();
```

## Testing Your Migration

### 1. Unit Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { usePremium } from '@umituz/react-native-subscription';

describe('Migration Test', () => {
  it('should work with new API', () => {
    const { result } = renderHook(() => usePremium());
    expect(result.current.isPremium).toBeDefined();
  });
});
```

### 2. Integration Tests

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { PaywallModal } from '@umituz/react-native-subscription';

test('Paywall renders correctly', () => {
  const { getByText } = render(
    <PaywallModal
      isVisible={true}
      onClose={jest.fn()}
    />
  );

  expect(getByText('Unlock Premium')).toBeTruthy();
});
```

### 3. Manual Testing Checklist

- [ ] App initializes without errors
- [ ] Can check subscription status
- [ ] Can view paywall
- [ ] Can make test purchase
- [ ] Can restore purchase
- [ ] Credits system works
- [ ] Premium features unlock correctly
- [ ] Free features remain locked
- [ ] Analytics events fire

## Rollback Plan

If migration fails:

### 1. Revert Code

```bash
git checkout <commit-before-migration>
```

### 2. Reinstall Old Version

```bash
npm install @umituz/react-native-subscription@1.x.x
```

### 3. Test Old Version

Ensure old version works before retrying migration.

## Support

Need help with migration?

- 📖 [Documentation](../README.md)
- 💬 [GitHub Discussions](https://github.com/umituz/react-native-subscription/discussions)
- 🐛 [Report Issues](https://github.com/umituz/react-native-subscription/issues)
- 📧 Email: umit@umituz.com

## Summary

| Change | v1 | v2 |
|--------|----|----|
| Architecture | Monolithic | DDD |
| Credits | Integrated | Separate Domain |
| Initialization | Manual | Provider |
| Hooks | Basic | Advanced |
| Components | Limited | Extensive |
| Type Safety | Partial | Full |
| Documentation | Basic | Comprehensive |
