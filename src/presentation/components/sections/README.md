# Sections Components

Abonelik ile ilgili section ve kart bileşenleri.

## Bileşenler

- [SubscriptionSection](#subscriptionsection) - Abonelik bölümü

## SubscriptionSection

Abonelik durumunu gösteren ve yönetim işlemlerini sağlayan section bileşeni.

### Kullanım

```typescript
import { SubscriptionSection } from '@umituz/react-native-subscription';

<SubscriptionSection
  title="Subscription"
  subscription={{
    type: 'premium',
    isActive: true,
    expirationDate: '2025-12-31T23:59:59Z',
    productId: 'com.app.premium.annual',
  }}
  onPress={() => navigation.navigate('SubscriptionDetail')}
  translations={{
    title: 'Subscription',
    status: 'Active',
    manage: 'Manage Subscription',
    upgrade: 'Upgrade to Premium',
    expires: 'Expires on',
  }}
/>
```

### Props

```typescript
interface SubscriptionSectionProps {
  title?: string;
  subscription: SubscriptionStatus | null;
  onPress?: () => void;
  onUpgradePress?: () => void;
  onManagePress?: () => void;
  style?: ViewStyle;
  translations?: SubscriptionSectionTranslations;
  showStatus?: boolean;
  showExpiration?: boolean;
  showManageButton?: boolean;
}
```

### Özellikler

- Abonelik durumunu gösterir
- Son kullanma tarihini görüntüler
- Yönetim butonu sağlar
- Upgrade butonu (free kullanıcılar için)
- Özelleştirilebilir çeviri desteği
- Press action ile detay sayfasına navigasyon

### Detaylı Kullanım

```typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { SubscriptionSection } from '@umituz/react-native-subscription';

function SettingsScreen() {
  const { subscription, isPremium } = useSubscription();

  return (
    <ScrollView>
      {/* Abonelik Section */}
      <SubscriptionSection
        title="My Subscription"
        subscription={subscription}
        showStatus={true}
        showExpiration={true}
        showManageButton={isPremium}
        onPress={() => {
          navigation.navigate('SubscriptionDetail');
        }}
        onUpgradePress={() => {
          // Paywall göster
          showPaywall();
        }}
        onManagePress={() => {
          // Subscription yönetimi (Apple/Google subscription management)
          if (Platform.OS === 'ios') {
            Linking.openURL('https://apps.apple.com/account/subscriptions');
          } else {
            Linking.openURL('https://play.google.com/store/account/subscriptions');
          }
        }}
        translations={{
          title: 'Subscription',
          active: 'Active',
          inactive: 'Inactive',
          expires: 'Expires on',
          renews: 'Renews on',
          manage: 'Manage Subscription',
          upgrade: 'Upgrade to Premium',
          lifetime: 'Lifetime Access',
        }}
      />

      {/* Diğer settingler */}
      {/* ... */}
    </ScrollView>
  );
}
```

## Özelleştirme

### Custom Styling

```typescript
import { StyleSheet } from 'react-native';
import { SubscriptionSection } from '@umituz/react-native-subscription';

const customStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  status: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

<SubscriptionSection
  subscription={subscription}
  onPress={handlePress}
  style={customStyles.container}
  titleStyle={customStyles.title}
  statusStyle={customStyles.status}
/>
```

### Custom Actions

```typescript
import { SubscriptionSection } from '@umituz/react-native-subscription';

function CustomSubscriptionSection() {
  const { subscription } = useSubscription();

  const handlePress = () => {
    if (subscription?.isPremium) {
      // Premium kullanıcı: Detayları göster
      navigation.navigate('SubscriptionDetail');
    } else {
      // Free kullanıcı: Paywall göster
      navigation.navigate('Paywall');
    }
  };

  const handleLongPress = () => {
    // Long press ile hızlı yönetim
    if (subscription?.isPremium) {
      showManageOptions();
    }
  };

  return (
    <SubscriptionSection
      subscription={subscription}
      onPress={handlePress}
      onLongPress={handleLongPress}
      translations={{
        title: 'My Plan',
        status: subscription?.isActive ? 'Active' : 'Inactive',
        manage: 'Manage',
        upgrade: 'Upgrade',
      }}
    />
  );
}
```

## Durum Bazlı Gösterim

Farklı durumlar için farklı görünümler:

```typescript
import { SubscriptionSection } from '@umituz/react-native-subscription';

function StatusBasedSections() {
  const { subscription } = useSubscription();

  if (!subscription) {
    // Loading state
    return <SubscriptionSection.Loading />;
  }

  if (subscription.isPremium) {
    // Premium kullanıcı
    return (
      <SubscriptionSection
        subscription={subscription}
        showStatus={true}
        showExpiration={true}
        showManageButton={true}
        onPress={() => navigation.navigate('PremiumDetail')}
        translations={{
          title: 'Premium Plan',
          active: 'Active',
          manage: 'Manage Subscription',
        }}
      />
    );
  }

  // Free kullanıcı
  return (
    <SubscriptionSection
      subscription={subscription}
      showStatus={false}
      onUpgradePress={() => navigation.navigate('Paywall')}
      translations={{
        title: 'Free Plan',
        upgrade: 'Upgrade to Premium',
      }}
    />
  );
}
```

## Birden Fazla Section

Farklı abonelik türleri için:

```typescript
import { SubscriptionSection } from '@umituz/react-native-subscription';

function MultipleSections() {
  const { subscription } = useSubscription();

  return (
    <ScrollView>
      {/* Ana Abonelik */}
      <SubscriptionSection
        title="Main Subscription"
        subscription={subscription}
        onPress={() => navigation.navigate('MainSubscription')}
      />

      {/* Kredi Paketi */}
      <SubscriptionSection
        title="Credits Balance"
        subscription={{
          type: 'credits',
          isActive: true,
          credits: 150,
        }}
        onPress={() => navigation.navigate('Credits')}
        translations={{
          title: 'Credits',
          status: '150 credits available',
        }}
      />

      {/* Lifetime Plan */}
      {subscription?.type === 'lifetime' && (
        <SubscriptionSection
          title="Lifetime Access"
          subscription={subscription}
          showExpiration={false}
          translations={{
            title: 'Lifetime',
            status: 'Owned forever',
          }}
        />
      )}
    </ScrollView>
  );
}
```

## Refresh Support

Pull-to-refresh desteği:

```typescript
import React, { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { SubscriptionSection } from '@umituz/react-native-subscription';

function RefreshableSection() {
  const { subscription, refetch, isLoading } = useSubscription();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isLoading}
          onRefresh={handleRefresh}
        />
      }
    >
      <SubscriptionSection
        subscription={subscription}
        onPress={() => navigation.navigate('SubscriptionDetail')}
      />
    </ScrollView>
  );
}
```

## Best Practices

1. **Clear Status**: Durumun açık ve net olduğundan emin olun
2. **Action Buttons**: Uygun aksiyon butonları sağlayın
3. **Loading States**: Yüklenme durumlarını gösterin
4. **Error Handling**: Hata durumlarını graceful şekilde handle edin
5. **Accessibility**: Accessibility özelliklerini ekleyin
6. **Consistent Design**: Tüm section'larda tutarlı tasarım kullanın
7. **Deep Links**: Yönetim sayfalarına deep link ekleyin

## Örnek: Complete Implementation

```typescript
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import {
  SubscriptionSection,
  useSubscription,
} from '@umituz/react-native-subscription';

export default function SettingsScreen() {
  const { subscription, isLoading, refetch } = useSubscription();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleManageSubscription = () => {
    const url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/account/subscriptions'
        : 'https://play.google.com/store/account/subscriptions';

    Linking.openURL(url).catch((err) =>
      console.error('Cannot open URL:', err)
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Subscription Section */}
      <SubscriptionSection
        title="Subscription"
        subscription={subscription}
        showStatus={true}
        showExpiration={true}
        showManageButton={subscription?.isPremium}
        onPress={() => navigation.navigate('SubscriptionDetail')}
        onManagePress={handleManageSubscription}
        onUpgradePress={() => navigation.navigate('Paywall')}
        translations={{
          title: 'Subscription',
          active: 'Active',
          inactive: 'Inactive',
          expires: 'Expires on',
          renews: 'Renews on',
          manage: 'Manage Subscription',
          upgrade: 'Upgrade to Premium',
          lifetime: 'Lifetime Access',
        }}
      />

      {/* Diğer ayarlar */}
      {/* ... */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});
```

## Translations

Çoklu dil desteği:

```typescript
const translations = {
  'en': {
    title: 'Subscription',
    active: 'Active',
    inactive: 'Inactive',
    expires: 'Expires on',
    manage: 'Manage',
    upgrade: 'Upgrade',
  },
  'tr': {
    title: 'Abonelik',
    active: 'Aktif',
    inactive: 'Aktif değil',
    expires: 'Son kullanma',
    manage: 'Yönet',
    upgrade: 'Yükselt',
  },
};

<SubscriptionSection
  subscription={subscription}
  translations={translations[userLanguage]}
/>
```
