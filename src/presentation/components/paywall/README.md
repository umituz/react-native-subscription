# Paywall Components

UI components specifically designed for paywall and subscription upgrade screens.

## Overview

This directory contains specialized components for displaying paywalls, package selection, and subscription upgrade prompts.

## Components

### PaywallModal
Modal overlay for paywall display.

```typescript
interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (pkg: Package) => void;
  configuration: PaywallConfig;
  restorePurchases?: () => void;
}
```

**Features:**
- Modal overlay with backdrop dismissal
- Animated entry and exit
- Close button
- Responsive layout
- Loading states

### PackageCard
Individual subscription package display.

```typescript
interface PackageCardProps {
  package: Package;
  selected?: boolean;
  onSelect: () => void;
  displayMode?: 'card' | 'list' | 'minimal';
}
```

**Display Modes:**
- **card**: Full featured card with all details
- **list**: Compact list item
- **minimal**: Minimal version for tight spaces

### FeatureComparison
Comparison table showing features across packages.

```typescript
interface FeatureComparisonProps {
  packages: Package[];
  features: string[];
  highlightPackage?: string;
}
```

### SocialProofBar
Social proof element showing user count and ratings.

```typescript
interface SocialProofBarProps {
  userCount?: number;
  rating?: number;
  style?: 'compact' | 'expanded';
}
```

### CTAButton
Call-to-action button for purchase.

```typescript
interface CTAButtonProps {
  package: Package;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

## Usage Examples

### Basic Paywall

```typescript
import { PaywallModal } from './components/PaywallModal';

function PaywallFlow() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onPress={() => setVisible(true)}>Show Paywall</Button>

      <PaywallModal
        visible={visible}
        onClose={() => setVisible(false)}
        onPurchase={handlePurchase}
        configuration={paywallConfig}
      />
    </>
  );
}
```

### Package Selection

```typescript
import { PackageCard } from './components/PackageCard';

function PackageSelection() {
  const [selected, setSelected] = useState('premium_annual');

  return (
    <ScrollView horizontal>
      {packages.map(pkg => (
        <PackageCard
          key={pkg.identifier}
          package={pkg}
          selected={selected === pkg.identifier}
          onSelect={() => setSelected(pkg.identifier)}
        />
      ))}
    </ScrollView>
  );
}
```

### Feature Comparison

```typescript
import { FeatureComparison } from './components/FeatureComparison';

function PaywallComparison() {
  const features = [
    'Unlimited Access',
    'Ad-Free',
    'Priority Support',
    'AI Features',
  ];

  return (
    <FeatureComparison
      packages={packages}
      features={features}
      highlightPackage="premium_annual"
    />
  );
}
```

## Component Styling

Components use design tokens for consistent styling:

```typescript
import { useAppDesignTokens } from '@umituz/react-native-design-system';

const tokens = useAppDesignTokens();

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.xl,
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});
```

## Best Practices

1. **Visual Hierarchy**: Highlight recommended packages clearly
2. **Clear Pricing**: Show price, period, and per-month equivalent
3. **Feature Clarity**: Make features easy to understand
4. **Social Proof**: Include ratings, reviews, user counts
5. **Trust Signals**: Show guarantees, badges, certifications
6. **Mobile First**: Optimize for mobile screens
7. **Performance**: Lazy load images, avoid expensive animations
8. **Accessibility**: Support screen readers, proper touch targets

## Related

- [Paywall README](../../../domains/paywall/README.md)
- [usePaywallVisibility](../../hooks/usePaywallVisibility.md)
- [PaywallOperations](../../hooks/usePaywallOperations.md)
