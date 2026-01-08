# Presentation Components

React Native UI components for subscription and paywall features.

## Overview

This directory contains reusable UI components built with `@umituz/react-native-design-system`. All components are generic and app-agnostic, requiring configuration props for app-specific behavior.

## Component Structure

```
presentation/components/
├── details/           # Subscription detail components
│   ├── PremiumDetailsCard.md
│   ├── PremiumStatusBadge.md
│   ├── DetailRow.md
│   └── CreditRow.md
├── sections/          # Section components for settings
│   └── SubscriptionSection.md
└── feedback/          # User feedback components
    └── PaywallFeedbackModal.md
```

## Components

### Detail Components

#### [PremiumDetailsCard](./details/PremiumDetailsCard.md)
Complete card displaying subscription details, status, and credits.

```typescript
<PremiumDetailsCard
  statusType="active"
  isPremium={true}
  expirationDate="January 15, 2025"
  purchaseDate="January 15, 2024"
  credits={[{ id: 'monthly', label: 'Credits', current: 50, total: 100 }]}
  translations={translations}
  onManageSubscription={handleManage}
  onUpgrade={handleUpgrade}
/>
```

#### [PremiumStatusBadge](./details/PremiumStatusBadge.md)
Colored badge showing subscription status.

```typescript
<PremiumStatusBadge
  status="active"
  activeLabel="Active"
  expiredLabel="Expired"
  noneLabel="Free"
  canceledLabel="Canceled"
/>
```

#### [DetailRow](./details/DetailRow.md)
Simple label-value row for displaying subscription details.

```typescript
<DetailRow
  label="Expires"
  value="January 15, 2025"
  highlight={true}
/>
```

#### [CreditRow](./details/CreditRow.md)
Credit display with progress bar and color-coded thresholds.

```typescript
<CreditRow
  label="Monthly Credits"
  current={50}
  total={100}
  remainingLabel="credits remaining"
/>
```

### Section Components

#### [SubscriptionSection](./sections/SubscriptionSection.md)
Settings section component with subscription details.

```typescript
<SubscriptionSection
  config={subscriptionConfig}
  onPress={() => navigation.navigate('SubscriptionDetails')}
/>
```

### Feedback Components

#### [PaywallFeedbackModal](./feedback/PaywallFeedbackModal.md)
Modal for collecting user feedback on paywall decline.

```typescript
<PaywallFeedbackModal
  visible={showFeedback}
  onClose={() => setShowFeedback(false)}
  onSubmit={(reason) => trackFeedback(reason)}
/>
```

## Usage Patterns

### In Settings Screen

```typescript
function SettingsScreen() {
  const config = useSubscriptionSettingsConfig({
    userId: user?.uid,
    translations: englishTranslations,
  });

  return (
    <ScrollView>
      <SubscriptionSection
        config={config.sectionConfig}
        onPress={() => navigation.navigate('SubscriptionDetails')}
      />
    </ScrollView>
  );
}
```

### In Paywall Screen

```typescript
function PaywallScreen() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <View>
      <PaywallContent onClose={() => setShowFeedback(true)} />

      <PaywallFeedbackModal
        visible={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleSubmitFeedback}
      />
    </View>
  );
}
```

## Design System Integration

All components use `@umituz/react-native-design-system` for:

- **Tokens**: `useAppDesignTokens()` for colors, spacing, radius
- **Typography**: `AtomicText` for consistent text styling
- **Theming**: Automatic dark mode support via design tokens

## Styling Customization

Components accept style overrides:

```typescript
<PremiumDetailsCard
  translations={translations}
  containerStyle={{
    marginHorizontal: 16,
    borderRadius: 12,
  }}
/>
```

## Best Practices

1. **Use design tokens** - Leverage `useAppDesignTokens()` for consistency
2. **Provide translations** - Ensure all text is localized
3. **Handle all states** - Test premium, free, expired, canceled states
4. **Test edge cases** - Zero credits, max credits, long text
5. **Match design system** - Follow app's design language
6. **Accessibility** - Ensure proper contrast and touch targets
7. **Performance** - Memoize where appropriate

## Related

- [Hooks](../hooks/README.md)
- [Screens](../screens/README.md)
- [Design System](https://github.com/umituz/react-native-design-system)
