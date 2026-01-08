# useSubscriptionSettingsConfig Hook

Returns ready-to-use configuration for subscription settings screens.

## Import

```typescript
import {
  useSubscriptionSettingsConfig,
  type SubscriptionSettingsConfig
} from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useSubscriptionSettingsConfig(
  params: UseSubscriptionSettingsConfigParams
): SubscriptionSettingsConfig

interface UseSubscriptionSettingsConfigParams {
  userId: string | undefined;
  translations: SubscriptionSettingsTranslations;
  creditLimit?: number;
  upgradePrompt?: UpgradePromptConfig;
}

interface SubscriptionSettingsConfig {
  enabled: boolean;
  settingsItem: SettingsItemConfig;
  sectionConfig: SectionConfig;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | `string \| undefined` | **Required** | User ID |
| `translations` | `SubscriptionSettingsTranslations` | **Required** | Localized strings |
| `creditLimit` | `number` | `undefined` | Max credits to display |
| `upgradePrompt` | `UpgradePromptConfig` | `undefined` | Upgrade prompt configuration |

## Translations

```typescript
interface SubscriptionSettingsTranslations {
  title: string;                    // e.g., "Subscription"
  description: string;              // e.g., "Manage your subscription"
  statusLabel: string;              // e.g., "Status"
  statusActive: string;             // e.g., "Active"
  statusExpired: string;            // e.g., "Expired"
  statusFree: string;               // e.g., "Free"
  statusCanceled: string;           // e.g., "Canceled"
  expiresLabel: string;            // e.g., "Expires on"
  purchasedLabel: string;          // e.g., "Purchased on"
  lifetimeLabel: string;           // e.g., "Lifetime"
  creditsTitle: string;            // e.g., "Credits"
  remainingLabel: string;          // e.g., "remaining"
  manageButton: string;            // e.g., "Manage Subscription"
  upgradeButton: string;           // e.g., "Upgrade to Premium"
}
```

## Basic Usage

```typescript
function SubscriptionSettings() {
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
      expiresLabel: 'Expires on',
      purchasedLabel: 'Purchased on',
      lifetimeLabel: 'Lifetime',
      creditsTitle: 'Credits',
      remainingLabel: 'remaining',
      manageButton: 'Manage Subscription',
      upgradeButton: 'Upgrade to Premium',
    },
  });

  if (!config.enabled) return null;

  return (
    <SettingsSection>
      <SettingsItem
        title={config.settingsItem.title}
        description={config.settingsItem.description}
        onPress={config.settingsItem.onPress}
        icon={config.settingsItem.icon}
      />
    </SettingsSection>
  );
}
```

## Advanced Usage

### With Custom Translations

```typescript
function LocalizedSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const config = useSubscriptionSettingsConfig({
    userId: user?.uid,
    translations: {
      title: t('subscription.title'),
      description: t('subscription.description'),
      statusLabel: t('subscription.status_label'),
      statusActive: t('subscription.status_active'),
      statusExpired: t('subscription.status_expired'),
      statusFree: t('subscription.status_free'),
      statusCanceled: t('subscription.status_canceled'),
      expiresLabel: t('subscription.expires_label'),
      purchasedLabel: t('subscription.purchased_label'),
      lifetimeLabel: t('subscription.lifetime_label'),
      creditsTitle: t('subscription.credits_title'),
      remainingLabel: t('subscription.remaining_label'),
      manageButton: t('subscription.manage_button'),
      upgradeButton: t('subscription.upgrade_button'),
    },
  });

  return <SubscriptionConfigView config={config} />;
}
```

### With Credit Limit

```typescript
function SettingsWithCreditLimit() {
  const { user } = useAuth();

  const config = useSubscriptionSettingsConfig({
    userId: user?.uid,
    translations: englishTranslations,
    creditLimit: 10, // Only show up to 10 credit items
  });

  return (
    <ScrollView>
      <SubscriptionSection config={config} />
    </ScrollView>
  );
}
```

### With Upgrade Prompt

```typescript
function SettingsWithUpgradePrompt() {
  const { user } = useAuth();

  const config = useSubscriptionSettingsConfig({
    userId: user?.uid,
    translations: englishTranslations,
    upgradePrompt: {
      showPrompt: true,
      highlightBenefits: [
        'Unlimited access',
        'Priority support',
        'Ad-free experience',
      ],
      discountOffer: 'Save 50% with annual plan',
    },
  });

  return (
    <View>
      <SubscriptionSection config={config} />
      {!config.sectionConfig.isPremium && config.sectionConfig.upgradePrompt && (
        <UpgradePromptCard prompt={config.sectionConfig.upgradePrompt} />
      )}
    </View>
  );
}
```

### Complete Subscription Settings Screen

```typescript
function SubscriptionSettingsScreen() {
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
      expiresLabel: 'Expires on',
      purchasedLabel: 'Purchased on',
      lifetimeLabel: 'Lifetime',
      creditsTitle: 'Credits',
      remainingLabel: 'remaining',
      manageButton: 'Manage Subscription',
      upgradeButton: 'Upgrade to Premium',
    },
    creditLimit: 8,
    upgradePrompt: {
      showPrompt: true,
      highlightBenefits: [
        'Unlimited access to all features',
        'Priority customer support',
        'Ad-free experience',
      ],
    },
  });

  if (!config.enabled) return null;

  const { settingsItem, sectionConfig } = config;

  return (
    <ScrollView style={styles.container}>
      {/* Settings List Item */}
      <SettingsList>
        <SettingsListItem
          title={settingsItem.title}
          description={settingsItem.description}
          icon={settingsItem.icon}
          onPress={settingsItem.onPress}
          badge={settingsItem.statusLabel}
        />
      </SettingsList>

      {/* Detailed Section */}
      <Card style={styles.card}>
        <Card.Title>{sectionConfig.translations.title}</Card.Title>

        <View style={styles.section}>
          <DetailRow
            label={sectionConfig.translations.statusLabel}
            value={sectionConfig.statusType === 'active'
              ? sectionConfig.translations.statusActive
              : sectionConfig.statusType === 'expired'
              ? sectionConfig.translations.statusExpired
              : sectionConfig.translations.statusFree}
          />

          {sectionConfig.expirationDate && (
            <DetailRow
              label={sectionConfig.translations.expiresLabel}
              value={sectionConfig.expirationDate}
            />
          )}

          {sectionConfig.purchaseDate && (
            <DetailRow
              label={sectionConfig.translations.purchasedLabel}
              value={sectionConfig.purchaseDate}
            />
          )}

          {sectionConfig.isLifetime && (
            <DetailRow
              label=""
              value={sectionConfig.translations.lifetimeLabel}
            />
          )}
        </View>

        {/* Credits Section */}
        {sectionConfig.credits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.creditsTitle}>
              {sectionConfig.translations.creditsTitle}
            </Text>
            {sectionConfig.credits.map((credit, index) => (
              <View key={index} style={styles.creditItem}>
                <Icon name="coin" size={16} />
                <Text>{credit.amount}</Text>
                <Text>{sectionConfig.translations.remainingLabel}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {sectionConfig.onUpgrade && !sectionConfig.isPremium && (
            <Button
              onPress={sectionConfig.onUpgrade}
              title={sectionConfig.translations.upgradeButton}
            />
          )}

          {sectionConfig.isPremium && (
            <Button
              onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
              title={sectionConfig.translations.manageButton}
              variant="outline"
            />
          )}
        </View>
      </Card>
    </ScrollView>
  );
}
```

## Configuration Object

### settingsItem

Quick access item for settings list:

```typescript
interface SettingsItemConfig {
  title: string;           // "Subscription"
  description: string;     // "Manage your subscription"
  isPremium: boolean;      // Premium status
  statusLabel: string;     // "Active" or "Free"
  icon: string;           // "diamond"
  onPress: () => void;    // Open paywall
}
```

### sectionConfig

Detailed section configuration:

```typescript
interface SectionConfig {
  statusType: 'active' | 'expired' | 'free' | 'canceled';
  isPremium: boolean;
  expirationDate: string | null;      // "January 15, 2024"
  purchaseDate: string | null;        // "January 15, 2023"
  isLifetime: boolean;
  daysRemaining: number | null;       // 30
  willRenew: boolean;
  credits: CreditItem[];
  translations: SubscriptionSettingsTranslations;
  onUpgrade: () => void;
  upgradePrompt?: UpgradePromptConfig;
}
```

## Best Practices

1. **Provide all translations** - Ensure all strings are localized
2. **Handle null values** - Dates may be null for lifetime subs
3. **Use credit limit** - Limit credit items for better UX
4. **Customize upgrade prompt** - Tailor to your app's benefits
5. **Test all states** - Active, expired, free, lifetime
6. **Handle navigation** - Implement onPress handlers
7. **Format dates** - Use locale-appropriate formatting

## Related Hooks

- **useSubscriptionStatus** - For subscription status details
- **useCredits** - For credits information
- **useSubscriptionDetails** - For package and pricing info

## See Also

- [Settings Screen](../screens/README.md#settings)
- [Subscription Utilities](../utils/subscriptionDateUtils.md)
- [Config Types](../types/SubscriptionSettingsTypes.md)
