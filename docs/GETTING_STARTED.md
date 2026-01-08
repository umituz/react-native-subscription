# Getting Started Guide

Welcome to @umituz/react-native-subscription! This guide will help you get started with the package.

## Prerequisites

Before you begin, ensure you have:

- React Native >= 0.74.0
- Node.js >= 18.0.0
- A RevenueCat account (get free at [revenuecat.com](https://revenuecat.com))
- Firebase project (optional, for credits system)

## Installation

### Step 1: Install Package

```bash
npm install @umituz/react-native-subscription
# or
yarn add @umituz/react-native-subscription
```

### Step 2: Install Dependencies

```bash
# RevenueCat
npm install react-native-purchases@^7.0.0

# React Query (if not already installed)
npm install @tanstack/react-query@^5.0.0

# Expo dependencies (if using Expo)
npm install expo-constants expo-image expo-linear-gradient
```

### Step 3: RevenueCat Setup

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create a new project
3. Add your app (iOS/Android)
4. Get your API keys

### Step 4: Configure RevenueCat

**iOS Setup:**

Add to your `ios/YourApp/Info.plist`:

```xml
<key>RCPublicKey</key>
<string>YOUR_IOS_API_KEY</string>
```

**Android Setup:**

Add to your `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <meta-data
    android:name="com.revenuecat.purchases.GooglePlayPublicKey"
    android:value="YOUR_ANDROID_API_KEY" />
</application>
```

## Basic Setup

### 1. Initialize Subscription

Wrap your app with `SubscriptionProvider`:

```typescript
import React from 'react';
import { SubscriptionProvider } from '@umituz/react-native-subscription';

const config = {
  revenueCatApiKey: 'your_api_key',
  revenueCatEntitlementId: 'premium',
};

function App() {
  return (
    <SubscriptionProvider config={config}>
      <YourRootComponent />
    </SubscriptionProvider>
  );
}

export default App;
```

### 2. Check Subscription Status

```typescript
import { usePremium } from '@umituz/react-native-subscription';

function MyScreen() {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>
        {isPremium ? 'Premium User' : 'Free User'}
      </Text>
    </View>
  );
}
```

### 3. Gate Premium Features

```typescript
import { usePremiumGate } from '@umituz/react-native-subscription';

function PremiumFeature() {
  const { canAccess, showPaywall } = usePremiumGate({
    featureId: 'advanced_analytics',
  });

  const handleAction = () => {
    if (!canAccess) {
      showPaywall();
      return;
    }
    // Execute premium feature
  };

  return (
    <Button onPress={handleAction} title="Run Analytics" />
  );
}
```

## Configure Products

### In RevenueCat Dashboard

1. Go to Products
2. Add your products:
   - Monthly: `com.yourapp.premium.monthly`
   - Annual: `com.yourapp.premium.annual`
   - Lifetime: `com.yourapp.premium.lifetime`

### In App Store Connect

1. Create subscriptions in App Store Connect
2. Set prices for each subscription tier
3. Submit for review

### In Google Play Console

1. Create subscriptions in Google Play Console
2. Set base plans and offers
3. Activate subscriptions

## Credits System Setup (Optional)

### 1. Configure Firebase

```typescript
import { initializeApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  // ...
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

### 2. Configure Credits Repository

```typescript
import { configureCreditsRepository } from '@umituz/react-native-subscription';

configureCreditsRepository({
  firebase: { firestore: db },
  config: {
    initialCredits: 100,
    creditPackages: [
      {
        id: 'credits_small',
        productId: 'com.yourapp.credits.100',
        amount: 100,
        price: 0.99,
      },
    ],
    creditCosts: {
      ai_generation: 1,
      export: 5,
    },
  },
});
```

### 3. Use Credits

```typescript
import { useCredits } from '@umituz/react-native-subscription';

function MyFeature() {
  const { credits, consumeCredit } = useCredits();

  const handleAction = async () => {
    const result = await consumeCredit({
      amount: 10,
      reason: 'feature_usage',
    });

    if (result.success) {
      console.log('Credits remaining:', result.newBalance);
    }
  };

  return (
    <View>
      <Text>Credits: {credits}</Text>
      <Button onPress={handleAction} title="Use 10 Credits" />
    </View>
  );
}
```

## Testing

### Test Mode

Enable test mode in development:

```typescript
const config = {
  revenueCatApiKey: __DEV__
    ? 'your_test_api_key'
    : 'your_production_api_key',
  revenueCatEntitlementId: 'premium',
};
```

### Test Purchases

**iOS:**
1. Go to Settings > Sandbox > StoreKit
2. Add test accounts
3. Use sandbox accounts for testing

**Android:**
1. Add license testers in Google Play Console
2. Use test accounts for purchases
3. Refund test purchases

## Common Issues

### Issue: "RevenueCat not initialized"

**Solution:** Ensure you've wrapped your app with `SubscriptionProvider`

### Issue: "No products available"

**Solution:**
1. Check products are configured in RevenueCat
2. Verify products are active in App Store/Google Play
3. Ensure product IDs match

### Issue: "Credits not working"

**Solution:**
1. Check Firebase is configured
2. Verify `configureCreditsRepository` is called
3. Check Firestore rules allow read/write

## Next Steps

- Read [Advanced Usage Guide](./ADVANCED_USAGE.md)
- Check [API Reference](./API_REFERENCE.md)
- See [Examples](../examples/)
- Review [Migration Guide](./MIGRATION.md)

## Support

- 📖 [Documentation](../README.md)
- 💬 [GitHub Issues](https://github.com/umituz/react-native-subscription/issues)
- 📧 Email: umit@umituz.com
