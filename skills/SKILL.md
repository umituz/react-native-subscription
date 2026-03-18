---
name: setup-react-native-subscription
description: Sets up RevenueCat subscriptions for React Native apps with paywall UI, premium gating, and credit management. Triggers on: Setup subscription, install subscription package, RevenueCat, premium features, paywall, useSubscriptionStatus, usePremium, in-app purchases.
---

# Setup React Native Subscription

Comprehensive setup for `@umituz/react-native-subscription` - RevenueCat integration with paywall UI and premium features.

## Overview

This skill handles everything needed to integrate subscriptions into your React Native or Expo app:
- Package installation and updates
- RevenueCat SDK setup
- API key configuration
- Paywall UI components
- Premium gating hooks
- Credit system
- Subscription management

## Quick Start

Just say: **"Setup subscriptions in my app"** and this skill will handle everything.

**Features Included:**
- RevenueCat integration
- Paywall screens
- Premium feature gating
- Credit/coin system
- Subscription status tracking
- Entitlement management

## When to Use

Invoke this skill when you need to:
- Install @umituz/react-native-subscription
- Set up RevenueCat
- Add paywall UI
- Gate premium features
- Implement subscription checks
- Add credit/coin system

## Step 1: Analyze the Project

```bash
cat package.json | grep "@umituz/react-native-subscription"
npm list @umituz/react-native-subscription
```

## Step 2: Install Package

```bash
npm install @umituz/react-native-subscription@latest
```

### Install Dependencies

```bash
# RevenueCat
npm install react-native-purchases

# State & storage
npm install zustand @tanstack/react-query
npm install @react-native-async-storage/async-storage

# Design system
npm install @umituz/react-native-design-system
```

## Step 3: Configure RevenueCat API Keys

### Get API Keys

1. Go to https://app.revenuecat.com/
2. Create project
3. Get API keys for Apple and Google

### Add to .env

```bash
cat > .env.example << 'EOF'
# RevenueCat Configuration
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=your_apple_key_here
EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=your_google_key_here
EOF

echo "EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_xxxxxxxxx" >> .env
echo "EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=googl_xxxxxxxxx" >> .env
```

## Step 4: Initialize Provider

```typescript
import { SubscriptionFlowProvider, initializeSubscription } from '@umituz/react-native-subscription';

export default function RootLayout() {
  useEffect(() => {
    initializeSubscription({
      apiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY!,
      // Or use Google key for Android
    });
  }, []);

  return (
    <SubscriptionFlowProvider>
      <Stack>{/* your screens */}</Stack>
    </SubscriptionFlowProvider>
  );
}
```

## Step 5: Use Premium Gating

```typescript
import { usePremium, useFeatureGate } from '@umituz/react-native-subscription';

export function PremiumFeature() {
  const { isPremium, isLoading } = usePremium();

  const canAccessAdvancedFeature = useFeatureGate('advanced_feature');

  if (isLoading) return <ActivityIndicator />;

  if (!isPremium) {
    return <PaywallScreen />;
  }

  return <AdvancedFeatureScreen />;
}
```

## Step 6: Add Paywall

```typescript
import { PaywallContainer } from '@umituz/react-native-subscription';

export function PaywallScreen() {
  return (
    <PaywallContainer
      title="Upgrade to Premium"
      features={[
        "Unlimited access",
        "No ads",
        "Exclusive content",
        "Priority support",
      ]}
      onPurchase={() => {}}
      onClose={() => {}}
    />
  );
}
```

## Step 7: Credit System

```typescript
import { useCredits, useDeductCredit } from '@umituz/react-native-subscription';

export function CreditWallet() {
  const { credits, isLoading } = useCredits();
  const { deductCredit } = useDeductCredit();

  const handlePurchase = async () => {
    const success = await deductCredit(100); // Cost: 100 credits
    if (success) {
      Alert.alert('Success', 'Item purchased!');
    }
  };

  return (
    <View>
      <Text>Credits: {credits}</Text>
      <Button title="Buy Item (100 credits)" onPress={handlePurchase} />
    </View>
  );
}
```

## Verification Checklist

- ✅ Package installed
- ✅ RevenueCat configured
- ✅ API keys in .env
- ✅ Provider wraps app
- ✅ Paywall renders
- ✅ Premium features gate correctly

## Summary

After setup, provide:

1. ✅ Package version
2. ✅ RevenueCat configured
3. ✅ API keys location
4. ✅ Paywall working
5. ✅ Premium gating working
6. ✅ Verification status

---

**Compatible with:** @umituz/react-native-subscription@latest
**Platforms:** React Native (Expo & Bare)
**Backend:** RevenueCat
# Test change
