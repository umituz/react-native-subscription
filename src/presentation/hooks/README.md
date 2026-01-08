# Subscription Hooks

Abonelik, premium ve kredi yönetimi için React Hooks koleksiyonu.

## İçindekiler

- [Subscription Hooks](#subscription-hooks)
- [Premium Hooks](#premium-hooks)
- [Credits Hooks](#credits-hooks)
- [Gate Hooks](#gate-hooks)
- [Auth Hooks](#auth-hooks)
- [Paywall Hooks](#paywall-hooks)

## Subscription Hooks

### useSubscription

Kullanıcının abonelik durumunu yönetmek için:

```typescript
import { useSubscription } from '@umituz/react-native-subscription';

function MyComponent() {
  const {
    isSubscribed,
    isActive,
    subscription,
    isLoading,
    error,
    checkSubscription,
  } = useSubscription();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Status: {isSubscribed ? 'Premium' : 'Free'}</Text>
      {subscription && (
        <Text>
          Expires: {new Date(subscription.expirationDate).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}
```

### useSubscriptionStatus

Detaylı abonelik durumu bilgileri için:

```typescript
import { useSubscriptionStatus } from '@umituz/react-native-subscription';

function SubscriptionBadge() {
  const {
    status,
    tier,
    isActive,
    willRenew,
    expirationDate,
    isLoading,
  } = useSubscriptionStatus();

  if (isLoading) return null;

  return (
    <View>
      <Badge
        color={isActive ? 'green' : 'gray'}
      >
        {tier.toUpperCase()}
      </Badge>
      {willRenew && <Text>Auto-renewal on</Text>}
      {expirationDate && (
        <Text>
          Expires: {new Date(expirationDate).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}
```

### useSubscriptionDetails

Abonelik detaylarını görüntülemek için:

```typescript
import { useSubscriptionDetails } from '@umituz/react-native-subscription';

function SubscriptionDetails() {
  const {
    subscription,
    package,
    period,
    price,
    features,
    isLoading,
    refetch,
  } = useSubscriptionDetails();

  if (isLoading) return <ActivityIndicator />;

  return (
    <Card>
      <Text>{package?.title}</Text>
      <Text>{price} / {period}</Text>
      <Text>Features:</Text>
      {features?.map((feature) => (
        <Text key={feature}>• {feature}</Text>
      ))}
      <Button onPress={refetch} title="Refresh" />
    </Card>
  );
}
```

## Premium Hooks

### usePremium

Premium durumunu kontrol etmek için:

```typescript
import { usePremium } from '@umituz/react-native-subscription';

function PremiumFeature() {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) return <ActivityIndicator />;

  if (!isPremium) {
    return <UpgradePrompt />;
  }

  return <PremiumContent />;
}
```

### usePremiumGate

Premium özelliklere erişimi kontrol etmek için:

```typescript
import { usePremiumGate } from '@umituz/react-native-subscription';

function ProtectedFeature() {
  const { isPremium, showPaywall, canAccess } = usePremiumGate({
    featureId: 'advanced_analytics',
    onUpgradeRequired: showPaywall,
  });

  const handleAction = () => {
    if (!canAccess) {
      showPaywall();
      return;
    }
    // Premium feature logic
  };

  return (
    <Button onPress={handleAction} title="Run Analytics" />
  );
}
```

### usePremiumWithCredits

Premium veya kredi ile kullanılabilen özellikler için:

```typescript
import { usePremiumWithCredits } from '@umituz/react-native-subscription';

function HybridFeature() {
  const {
    isPremium,
    hasCredits,
    credits,
    consumeCredit,
    isLoading,
  } = usePremiumWithCredits({
    creditCost: 1,
    featureId: 'ai_generation',
  });

  const handleGenerate = async () => {
    if (isPremium) {
      // Premium users have unlimited access
      await generateContent();
    } else if (hasCredits) {
      // Use credits
      const result = await consumeCredit();
      if (result.success) {
        await generateContent();
      }
    } else {
      // Show upgrade prompt
      showPaywall();
    }
  };

  return (
    <View>
      <Button onPress={handleGenerate} title="Generate" />
      {!isPremium && <Text>Credits: {credits}</Text>}
    </View>
  );
}
```

## Credits Hooks

### useCredits

Kredi bakiyesi yönetimi için:

```typescript
import { useCredits } from '@umituz/react-native-subscription';

function CreditsDisplay() {
  const {
    credits,
    balance,
    isLoading,
    refetch,
  } = useCredits();

  return (
    <View>
      <Text>Credits: {credits}</Text>
      <Text>Balance: ${balance}</Text>
      <Button onPress={refetch} title="Refresh" />
    </View>
  );
}
```

### useCreditsGate

Kredi gerektiren özellikler için:

```typescript
import { useCreditsGate } from '@umituz/react-native-subscription';

function CreditBasedFeature() {
  const {
    hasCredits,
    credits,
    consumeCredit,
    isLoading,
    showPurchasePrompt,
  } = useCreditsGate({
    creditCost: 5,
    featureId: 'export',
  });

  const handleExport = async () => {
    if (!hasCredits) {
      showPurchasePrompt();
      return;
    }

    const result = await consumeCredit();
    if (result.success) {
      await exportData();
    }
  };

  return (
    <Button onPress={handleExport} title="Export (5 credits)" />
  );
}
```

### useDeductCredit

Kredi düşme işlemi için:

```typescript
import { useDeductCredit } from '@umituz/react-native-subscription';

function PaidAction() {
  const { deductCredit, isLoading } = useDeductCredit();

  const handleAction = async () => {
    const result = await deductCredit({
      amount: 10,
      reason: 'feature_usage',
      metadata: { featureId: 'ai_analysis' },
    });

    if (result.success) {
      console.log('Credit deducted successfully');
      // Continue with action
    } else {
      Alert.alert('Error', result.error?.message);
    }
  };

  return <Button onPress={handleAction} title="Use Feature (10 credits)" />;
}
```

### useInitializeCredits

Kredi sistemini başlatmak için:

```typescript
import { useInitializeCredits } from '@umituz/react-native-subscription';

function App() {
  const { isInitialized, initialize, error } = useInitializeCredits();

  useEffect(() => {
    if (!isInitialized) {
      initialize({
        initialCredits: 100,
        creditPackages: [
          { id: 'small', amount: 100, price: 0.99 },
          { id: 'medium', amount: 500, price: 3.99 },
        ],
      });
    }
  }, []);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return <AppContent />;
}
```

## Gate Hooks

### useFeatureGate

Genel özellik erişim kontrolü için:

```typescript
import { useFeatureGate } from '@umituz/react-native-subscription';

function GatedFeature() {
  const { canAccess, gateState, showUpgradePrompt } = useFeatureGate({
    featureId: 'advanced_filters',
    requirements: {
      tier: 'premium',
      minCredits: 0,
    },
  });

  if (!canAccess) {
    return (
      <View>
        <Text>This feature requires Premium</Text>
        <Button onPress={showUpgradePrompt} title="Upgrade" />
      </View>
    );
  }

  return <FeatureContent />;
}
```

### useSubscriptionGate

Abonelik kontrolü için:

```typescript
import { useSubscriptionGate } from '@umituz/react-native-subscription';

function SubscriptionOnlyFeature() {
  const {
    isSubscribed,
    subscriptionType,
    canAccess,
    showPaywall,
  } = useSubscriptionGate({
    requiredTier: 'premium',
  });

  if (!canAccess) {
    return (
      <LockedScreen
        onUpgrade={showPaywall}
        message="Upgrade to Premium to access this feature"
      />
    );
  }

  return <FeatureContent />;
}
```

### useAuthGate

Auth + abonelik kontrolü için:

```typescript
import { useAuthGate } from '@umituz/react-native-subscription';

function ProtectedContent() {
  const {
    isAuthenticated,
    isAuthorized,
    user,
    signIn,
    signOut,
  } = useAuthGate({
    requireAuth: true,
    requireSubscription: true,
  });

  if (!isAuthenticated) {
    return <SignInPrompt onSignIn={signIn} />;
  }

  if (!isAuthorized) {
    return <UpgradePrompt />;
  }

  return <ProtectedData />;
}
```

## Auth Hooks

### useAuthAwarePurchase

Auth-aware satın alma için:

```typescript
import { useAuthAwarePurchase } from '@umituz/react-native-subscription';

function PurchaseButton() {
  const { purchase, isLoading, requiresAuth } = useAuthAwarePurchase({
    productId: 'premium_monthly',
  });

  const handlePurchase = async () => {
    const result = await purchase();

    if (result.requiresAuth) {
      // Show auth screen
      navigateToAuth();
    } else if (result.success) {
      // Purchase successful
      Alert.alert('Success', 'You are now Premium!');
    }
  };

  return (
    <Button
      onPress={handlePurchase}
      disabled={isLoading}
      title="Subscribe"
    />
  );
}
```

### useAuthSubscriptionSync

Auth ve abonelik senkronizasyonu için:

```typescript
import { useAuthSubscriptionSync } from '@umituz/react-native-subscription';

function AuthManager() {
  const { user } = useAuth();
  const { syncSubscription, clearSubscription } = useAuthSubscriptionSync();

  useEffect(() => {
    if (user) {
      // Sync subscription with auth user
      syncSubscription(user.uid);
    } else {
      // Clear subscription on logout
      clearSubscription();
    }
  }, [user?.uid]);

  return null;
}
```

## Paywall Hooks

### usePaywallOperations

Paywall işlemleri için:

```typescript
import { usePaywallOperations } from '@umituz/react-native-subscription';

function PaywallManager() {
  const {
    showPaywall,
    hidePaywall,
    isPaywallVisible,
    paywallState,
  } = usePaywallOperations();

  const handleUpgradeClick = () => {
    showPaywall({
      trigger: 'upgrade_button',
      featureId: 'advanced_features',
    });
  };

  return (
    <>
      <Button onPress={handleUpgradeClick} title="Upgrade" />
      <Paywall isVisible={isPaywallVisible} onClose={hidePaywall} />
    </>
  );
}
```

### usePaywallVisibility

Paywall görünürlük kontrolü için:

```typescript
import { usePaywallVisibility } from '@umituz/react-native-subscription';

function AutoPaywall() {
  const {
    shouldShowPaywall,
    showPaywall,
    dismissPaywall,
    hasSeenPaywall,
  } = usePaywallVisibility({
    trigger: 'feature_usage_limit',
    showAfter: 3, // Show after 3 actions
    frequency: 'once_per_session',
  });

  useEffect(() => {
    if (shouldShowPaywall) {
      showPaywall();
    }
  }, [shouldShowPaywall]);

  return <FeatureContent />;
}
```

### useUserTier

Kullanıcı tier yönetimi için:

```typescript
import { useUserTier } from '@umituz/react-native-subscription';

function TierAwareComponent() {
  const {
    tier,
    isGuest,
    isFree,
    isPremium,
    canUpgrade,
    isLoading,
  } = useUserTier();

  return (
    <View>
      <Badge>{tier?.toUpperCase()}</Badge>

      {isGuest && <Text>Sign in to save your progress</Text>}
      {isFree && <Button onPress={showUpgrade} title="Go Premium" />}
      {isPremium && <Text>Welcome, Premium user!</Text>}
    </View>
  );
}
```

## Helper Hooks

### useCreditChecker

Kredi kontrolü için basit hook:

```typescript
import { useCreditChecker } from '@umituz/react-native-subscription';

function FeatureWithCreditCheck() {
  const { hasEnoughCredits, credits, checkCredits } = useCreditChecker(10);

  const handleAction = () => {
    if (hasEnoughCredits) {
      // Execute action
    } else {
      Alert.alert('Insufficient credits', `You need 10 credits, have ${credits}`);
    }
  };

  return <Button onPress={handleAction} title="Execute" />;
}
```

### useDevTestCallbacks

Development ve test için callback hook'u:

```typescript
import { useDevTestCallbacks } from '@umituz/react-native-subscription';

function DevTestPanel() {
  const { setTestPremium, setTestCredits, resetTestState } = useDevTestCallbacks();

  if (!__DEV__) return null;

  return (
    <View>
      <Button onPress={() => setTestPremium(true)} title="Set Premium" />
      <Button onPress={() => setTestCredits(100)} title="Add 100 Credits" />
      <Button onPress={resetTestState} title="Reset" />
    </View>
  );
}
```

## Best Practices

1. **Loading States**: Her zaman loading durumunu kontrol edin
2. **Error Handling**: Hataları uygun şekilde yakalayın ve gösterin
3. **Gate Hooks**: Özellik erişimi için gate hooks kullanın
4. **User Experience**: Anlaşılır mesajlar ve smooth transitions sağlayın
5. **Cache**: Gereksiz re-render'lardan kaçınmak için veriyi cache'leyin
6. **Cleanup**: Component unmount olduğunda subscription'ları temizleyin

## Örnek Uygulama

```typescript
import React from 'react';
import { View, Text, Button } from 'react-native';
import {
  usePremiumGate,
  useCreditsGate,
  useUserTier,
} from '@umituz/react-native-subscription';

export default function FeatureExample() {
  const { tier, isPremium } = useUserTier();

  // Premium gate
  const { canAccess: canAccessPremium, showPaywall } = usePremiumGate({
    featureId: 'ai_tools',
  });

  // Credits gate
  const {
    hasCredits,
    credits,
    consumeCredit,
  } = useCreditsGate({
    creditCost: 5,
    featureId: 'ai_generation',
  });

  const handleAIAction = async () => {
    if (!canAccessPremium) {
      showPaywall();
      return;
    }

    if (isPremium) {
      // Premium users: unlimited access
      await performAIAction();
    } else if (hasCredits) {
      // Free users: use credits
      const result = await consumeCredit();
      if (result.success) {
        await performAIAction();
      }
    } else {
      // No credits: show purchase prompt
      showCreditPurchasePrompt();
    }
  };

  return (
    <View>
      <Text>Current Tier: {tier}</Text>
      {!isPremium && <Text>Credits: {credits}</Text>}

      <Button
        onPress={handleAIAction}
        title={isPremium ? "Generate (Unlimited)" : "Generate (5 credits)"}
      />
    </View>
  );
}
```

## Hook Reference

### Tüm Export Edilen Hooks

```typescript
// Auth & Sync
export { useAuthAwarePurchase } from './useAuthAwarePurchase';
export { useAuthGate } from './useAuthGate';
export { useAuthSubscriptionSync } from './useAuthSubscriptionSync';

// Credits
export { useCreditChecker } from './useCreditChecker';
export { useCredits } from './useCredits';
export { useCreditsGate } from './useCreditsGate';
export { useDeductCredit } from './useDeductCredit';
export { useInitializeCredits } from './useInitializeCredits';

// Features
export { useFeatureGate } from './useFeatureGate';

// Premium
export { usePremium } from './usePremium';
export { usePremiumGate } from './usePremiumGate';
export { usePremiumWithCredits } from './usePremiumWithCredits';

// Subscription
export { useSubscription } from './useSubscription';
export { useSubscriptionDetails } from './useSubscriptionDetails';
export { useSubscriptionGate } from './useSubscriptionGate';
export { useSubscriptionSettingsConfig } from './useSubscriptionSettingsConfig';
export { useSubscriptionStatus } from './useSubscriptionStatus';

// User Tier
export { useUserTier } from './useUserTier';
export { useUserTierWithRepository } from './useUserTierWithRepository';

// Paywall
export { usePaywallOperations } from './usePaywallOperations';
export { usePaywallVisibility } from './usePaywallVisibility';

// Feedback
export { usePaywallFeedback } from './feedback/usePaywallFeedback';

// Dev/Test
export { useDevTestCallbacks } from './useDevTestCallbacks';
```
