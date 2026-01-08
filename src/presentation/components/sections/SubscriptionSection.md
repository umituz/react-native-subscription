# SubscriptionSection Component

Generic section component that renders subscription/premium details in settings screens.

## Import

```typescript
import { SubscriptionSection } from '@umituz/react-native-subscription';
```

## Signature

```typescript
interface SubscriptionSectionConfig {
  statusType: 'active' | 'expired' | 'none' | 'canceled';
  isPremium: boolean;
  expirationDate?: string | null;
  purchaseDate?: string | null;
  isLifetime?: boolean;
  daysRemaining?: number | null;
  credits?: CreditInfo[];
  translations: PremiumDetailsTranslations;
  onManageSubscription?: () => void;
  onUpgrade?: () => void;
  onPress?: () => void;
}

interface SubscriptionSectionProps {
  config: SubscriptionSectionConfig;
  containerStyle?: StyleProp<ViewStyle>;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `SubscriptionSectionConfig` | **Required** | Subscription configuration |
| `containerStyle` | `StyleProp<ViewStyle>` | `undefined` | Optional container style |

## Basic Usage

```typescript
function SettingsScreen() {
  const config = useSubscriptionSettingsConfig({
    userId: user?.uid,
    translations: englishTranslations,
  });

  return (
    <ScrollView>
      <SubscriptionSection config={config.sectionConfig} />
    </ScrollView>
  );
}
```

## Advanced Usage

### With Navigation

```typescript
function SettingsScreen() {
  const config = useSubscriptionSettingsConfig({
    userId: user?.uid,
    translations: englishTranslations,
  });

  return (
    <SubscriptionSection
      config={config.sectionConfig}
      onPress={() => navigation.navigate('SubscriptionDetails')}
    />
  );
}
```

### With Custom Styling

```typescript
function StyledSettings() {
  const config = useSubscriptionSettingsConfig({
    userId: user?.uid,
    translations: englishTranslations,
  });

  return (
    <SubscriptionSection
      config={config.sectionConfig}
      containerStyle={{
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    />
  );
}
```

### Complete Configuration

```typescript
function CompleteSubscriptionSection() {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { credits } = useCredits();

  const config = {
    statusType: isPremium ? 'active' : 'none',
    isPremium,
    expirationDate: isPremium ? 'January 15, 2025' : null,
    purchaseDate: isPremium ? 'January 15, 2024' : null,
    isLifetime: false,
    daysRemaining: isPremium ? 30 : null,
    credits: [
      {
        id: 'monthly',
        label: 'Monthly Credits',
        current: credits,
        total: 100,
      },
    ],
    translations: {
      title: 'Subscription',
      statusLabel: 'Status',
      statusActive: 'Active',
      statusExpired: 'Expired',
      statusFree: 'Free',
      statusCanceled: 'Canceled',
      expiresLabel: 'Expires on',
      purchasedLabel: 'Purchased on',
      lifetimeLabel: 'Lifetime Access',
      creditsTitle: 'Credits',
      remainingLabel: 'remaining',
      manageButton: 'Manage Subscription',
      upgradeButton: 'Upgrade to Premium',
      freeDescription: 'Upgrade to access all features',
    },
    onManageSubscription: () => {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    },
    onUpgrade: () => {
      navigation.navigate('Paywall');
    },
    onPress: () => {
      navigation.navigate('SubscriptionDetails');
    },
  };

  return <SubscriptionSection config={config} />;
}
```

## Examples

### Settings Integration

```typescript
function AppSettings() {
  const { user } = useAuth();

  const config = useSubscriptionSettingsConfig({
    userId: user?.uid,
    translations: {
      title: 'Subscription',
      description: 'Manage your subscription',
      statusLabel: 'Status',
      statusActive: 'Active',
      statusExpired: 'Expired',
      statusFree: 'Free',
      statusCanceled: 'Canceled',
      expiresLabel: 'Expires',
      purchasedLabel: 'Purchased',
      lifetimeLabel: 'Lifetime',
      creditsTitle: 'Credits',
      remainingLabel: 'remaining',
      manageButton: 'Manage',
      upgradeButton: 'Upgrade',
      freeDescription: 'Upgrade for premium features',
    },
  });

  return (
    <ScrollView>
      <Section title="Account">
        <SettingsItem label="Email" value={user?.email} />
        <SettingsItem label="Subscription" value={config.settingsItem.statusLabel} />
      </Section>

      <SubscriptionSection
        config={config.sectionConfig}
        onPress={() => navigation.navigate('SubscriptionDetails')}
      />
    </ScrollView>
  );
}
```

### With Conditional Display

```typescript
function ConditionalSubscriptionSection() {
  const { user } = useAuth();
  const { isPremium } = usePremium();

  const config = useSubscriptionSettingsConfig({
    userId: user?.uid,
    translations: englishTranslations,
  });

  // Only show if user is authenticated
  if (!user) return null;

  return (
    <SubscriptionSection
      config={config.sectionConfig}
      containerStyle={{
        backgroundColor: isPremium ? '#FFF8E1' : '#F5F5F5',
      }}
    />
  );
}
```

## Best Practices

1. **Use hook** - Get config from `useSubscriptionSettingsConfig`
2. **Provide translations** - Ensure all strings are localized
3. **Handle navigation** - Implement onPress for detail screen
4. **Test states** - Active, expired, free, lifetime
5. **Style consistently** - Match app design system
6. **Handle actions** - Implement manage and upgrade handlers

## Related Components

- **PremiumDetailsCard** - The card component rendered inside
- **PremiumStatusBadge** - Status badge component
- **DetailRow** - Row component for details
- **CreditRow** - Row component for credits

## See Also

- [useSubscriptionSettingsConfig](../../hooks/useSubscriptionSettingsConfig.md)
- [Settings Screen](../../screens/README.md)
- [Config Types](../../types/SubscriptionSettingsTypes.md)
