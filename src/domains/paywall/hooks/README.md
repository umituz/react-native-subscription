# Paywall Hooks

React hooks for paywall management and subscription upgrades.

## Overview

This directory contains React hooks specifically for paywall functionality.

## Hooks

### usePaywallVisibility
Manages paywall visibility state.

```typescript
function usePaywallVisibility(): {
  showPaywall: boolean;
  setShowPaywall: (visible: boolean) => void;
  openPaywall: () => void;
  closePaywall: () => void;
}
```

**Usage:**
```typescript
function PaywallWrapper() {
  const { showPaywall, closePaywall } = usePaywallVisibility();

  return (
    <>
      <YourApp />
      <Modal visible={showPaywall} onRequestClose={closePaywall}>
        <PaywallScreen onClose={closePaywall} />
      </Modal>
    </>
  );
}
```

### usePaywallOperations
Handles paywall purchase operations.

```typescript
function usePaywallOperations(config: {
  userId: string | undefined;
  isAnonymous: boolean;
  onPaywallClose?: () => void;
  onPurchaseSuccess?: () => void;
  onAuthRequired?: () => void;
}): {
  handlePurchase: (pkg: Package) => Promise<boolean>;
  handleRestore: () => Promise<boolean>;
  pendingPackage: Package | null;
}
```

**Usage:**
```typescript
function Paywall() {
  const { handlePurchase, handleRestore } = usePaywallOperations({
    userId: user?.uid,
    isAnonymous: !user,
    onPurchaseSuccess: () => navigation.goBack(),
    onAuthRequired: () => showAuthModal(),
  });

  return (
    <View>
      <PackageList onSelectPackage={handlePurchase} />
      <Button onPress={handleRestore}>Restore</Button>
    </View>
  );
}
```

## Usage Patterns

### Feature Gating
```typescript
function useFeatureGate(feature: string) {
  const { openPaywall } = usePaywallVisibility();
  const { isPremium } = usePremium();

  const gateFeature = useCallback(() => {
    if (!isPremium) {
      analytics.track('paywall_triggered', { feature });
      openPaywall();
      return false;
    }
    return true;
  }, [isPremium, openPaywall]);

  return gateFeature;
}
```

### Trigger-Based Paywall
```typescript
function useTriggeredPaywall() {
  const { openPaywall } = usePaywallVisibility();

  const showPaywallForFeature = (feature: string, context?: any) => {
    openPaywall();
    // Store trigger context for analytics
    PaywallTracker.record({
      type: 'premium_feature',
      feature,
      context,
      timestamp: Date.now(),
    });
  };

  return { showPaywallForFeature };
}
```

## Best Practices

1. **Centralized State**: Use global paywall visibility
2. **Auth Integration**: Handle authentication before purchase
3. **Pending Actions**: Store pending actions for post-purchase
4. **Analytics**: Track all paywall interactions
5. **Error Handling**: Handle purchase failures gracefully
6. **User Context**: Show relevant paywall based on context

## Related

- [usePaywallVisibility](../../presentation/hooks/usePaywallVisibility.md)
- [usePaywallOperations](../../presentation/hooks/usePaywallOperations.md)
- [PremiumGate Hook](../../presentation/hooks/usePremiumGate.md)
