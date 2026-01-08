# Paywall Components

UI components for displaying paywalls and upgrade prompts.

## Overview

This directory contains React Native components for rendering paywall screens and upgrade prompts.

## Components

### PaywallScreen
Main paywall screen with package selection.

```typescript
function PaywallScreen() {
  const { packages, isLoading } = useSubscriptionPackages();
  const { handlePurchase, handleRestore } = usePaywallOperations({
    userId: user?.uid,
    isAnonymous: !user,
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView>
      <PaywallHeader />

      {packages.map((pkg) => (
        <PackageCard
          key={pkg.identifier}
          package={pkg}
          onPress={() => handlePurchase(pkg)}
        />
      ))}

      <RestoreButton onPress={handleRestore} />
    </ScrollView>
  );
}
```

### PackageCard
Individual subscription package display card.

```typescript
interface PackageCardProps {
  package: PaywallPackage;
  selected?: boolean;
  onPress: () => void;
  popular?: boolean;
}
```

**Features:**
- Highlight popular packages
- Show price and period
- Display features list
- Show savings (for annual)
- Visual selection indicator

### PaywallModal
Modal-style paywall overlay.

```typescript
interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (pkg: Package) => void;
  configuration: PaywallConfig;
}
```

**Usage:**
```typescript
<PaywallModal
  visible={showPaywall}
  onClose={() => setShowPaywall(false)}
  onPurchase={handlePurchase}
  configuration={{
    title: 'Upgrade to Premium',
    features: ['Unlimited access', 'Ad-free'],
    packages: packages,
  }}
/>
```

### PremiumFeatureLock
Locked feature indicator that prompts upgrade.

```typescript
interface PremiumFeatureLockProps {
  feature: string;
  onPress: () => void;
  icon?: string;
  message?: string;
}
```

**Usage:**
```typescript
<PremiumFeatureLock
  feature="AI Generation"
  onPress={() => showPaywall({ type: 'premium_feature', feature: 'ai_generation' })}
  message="Upgrade to generate unlimited content"
  icon="lock"
/>
```

## Usage Patterns

### With Navigation
```typescript
function navigateToPaywall(trigger: PaywallTrigger) {
  navigation.navigate('Paywall', { trigger });
}

// In paywall screen
const { trigger } = route.params;
const config = getPaywallConfig(trigger.type);
```

### With Inline Paywall
```typescript
function InlinePaywall({ onUpgrade, onDismiss }) {
  return (
    <Card>
      <Image source={premiumIllustration} />
      <Title>Unlock Premium Features</Title>
      <FeaturesList features={premiumFeatures} />
      <Button onPress={onUpgrade}>Upgrade Now</Button>
      <Link onPress={onDismiss}>Maybe Later</Link>
    </Card>
  );
}
```

### With Context
```typescript
function ContextualPaywall({ feature, context }) {
  const { packages } = useSubscriptionPackages();

  return (
    <PaywallScreen
      title={`Unlock ${feature}`}
      subtitle={`You need Premium to use ${feature}`}
      highlightPackage={context.recommendedPackage}
      packages={packages}
    />
  );
}
```

## Styling

Components use design tokens for consistent styling:

```typescript
import { useAppDesignTokens } from '@umituz/react-native-design-system';

const tokens = useAppDesignTokens();

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
  },
});
```

## Best Practices

1. **Clear Value**: Communicate premium benefits clearly
2. **Visual Hierarchy**: Highlight recommended package
3. **Social Proof**: Show user counts or testimonials
4. **Easy Dismissal**: Allow users to close when appropriate
5. **Smooth Purchase**: Make purchase flow simple
6. **Loading States**: Show appropriate loading indicators
7. **Error Handling**: Handle purchase failures gracefully

## Related

- [Paywall README](../README.md)
- [PaywallVisibility Hook](../../hooks/usePaywallVisibility.md)
- [Premium Components](../../components/details/README.md)
