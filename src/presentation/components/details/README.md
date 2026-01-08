# Details Components

Abonelik ve premium detaylarını göstermek için UI bileşenleri.

## Bileşenler

- [PremiumDetailsCard](#premiumdetailscard) - Premium detay kartı
- [PremiumStatusBadge](#premiumstatusbadge) - Durum badge'i
- [DetailRow](#detailrow) - Detay satırı
- [CreditRow](#creditrow) - Kredi satırı

## PremiumDetailsCard

Premium abonelik detaylarını gösteren kart bileşeni.

### Kullanım

```typescript
import { PremiumDetailsCard } from '@umituz/react-native-subscription';

<PremiumDetailsCard
  status={{
    type: 'premium',
    isActive: true,
    isPremium: true,
    expirationDate: '2025-12-31T23:59:59Z',
    willRenew: true,
    productId: 'com.app.premium.annual',
  }}
  onUpgradePress={() => console.log('Upgrade pressed')}
  onManagePress={() => console.log('Manage pressed')}
  translations={{
    title: 'Premium',
    status: 'Active',
    expires: 'Expires on',
    renews: 'Renews on',
    manage: 'Manage Subscription',
    upgrade: 'Upgrade to Premium',
  }}
/>
```

### Props

```typescript
interface PremiumDetailsCardProps {
  status: SubscriptionStatus;
  onUpgradePress?: () => void;
  onManagePress?: () => void;
  style?: ViewStyle;
  translations?: PremiumDetailsCardTranslations;
}
```

### Özellikler

- Abonelik durumunu gösterir (Active, Expired, vb.)
- Son kullanma tarihini görüntüler
- Yenileme durumunu gösterir
- Upgrade ve Manage butonları
- Özelleştirilebilir çeviri desteği

## PremiumStatusBadge

Kullanıcının premium durumunu gösteren badge bileşeni.

### Kullanım

```typescript
import { PremiumStatusBadge } from '@umituz/react-native-subscription';

<PremiumStatusBadge
  status="premium"
  size="medium"
  showIcon={true}
/>

<PremiumStatusBadge
  status="free"
  size="small"
  showIcon={false}
/>
```

### Props

```typescript
interface PremiumStatusBadgeProps {
  status: SubscriptionStatusType;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: ViewStyle;
}
```

### Özellikler

- Farklı boyut seçenekleri
- İkon gösterimi/hiding
- Durum bazlı renkler
- Responsive tasarım

## DetailRow

Detay gösterimi için satır bileşeni.

### Kullanım

```typescript
import { DetailRow } from '@umituz/react-native-subscription';

<DetailRow
  label="Subscription Type"
  value="Annual Premium"
/>

<DetailRow
  label="Price"
  value="$79.99/year"
/>

<DetailRow
  label="Status"
  value="Active"
  valueColor="green"
/>
```

### Props

```typescript
interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
  style?: ViewStyle;
}
```

## CreditRow

Kredi bakiyesi gösterimi için satır bileşeni.

### Kullanım

```typescript
import { CreditRow } from '@umituz/react-native-subscription';

<CreditRow
  credits={150}
  currency="USD"
  showBalance={true}
/>

<CreditRow
  credits={50}
  currency="USD"
  showBalance={false}
  translations={{
    credits: 'Credits',
    balance: 'Balance',
  }}
/>
```

### Props

```typescript
interface CreditRowProps {
  credits: number;
  currency?: string;
  showBalance?: boolean;
  translations?: {
    credits?: string;
    balance?: string;
  };
  style?: ViewStyle;
}
```

## Birlikte Kullanım

```typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import {
  PremiumDetailsCard,
  PremiumStatusBadge,
  DetailRow,
  CreditRow,
} from '@umituz/react-native-subscription';

function SubscriptionDetailsScreen() {
  const { subscription, credits } = useSubscription();

  return (
    <ScrollView>
      {/* Durum Badge */}
      <View style={styles.header}>
        <PremiumStatusBadge
          status={subscription?.type}
          size="large"
          showIcon={true}
        />
      </View>

      {/* Detay Kartı */}
      <PremiumDetailsCard
        status={subscription}
        onManagePress={handleManage}
      />

      {/* Ek Detaylar */}
      <View style={styles.section}>
        <DetailRow label="Plan" value="Annual Premium" />
        <DetailRow label="Price" value="$79.99/year" />
        <DetailRow
          label="Status"
          value={subscription?.isActive ? 'Active' : 'Inactive'}
          valueColor={subscription?.isActive ? 'green' : 'red'}
        />
      </View>

      {/* Kredi Bakiyesi */}
      <View style={styles.section}>
        <CreditRow
          credits={credits}
          currency="USD"
          showBalance={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    alignItems: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
});
```

## Styling

Bileşen stilleri özelleştirilebilir:

```typescript
import { premiumDetailsCardStyles } from '@umituz/react-native-subscription';

// Kendi stilınızı kullanın
const customStyles = StyleSheet.create({
  container: {
    backgroundColor: 'custom-background',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
});

<PremiumDetailsCard
  style={customStyles.container}
  status={status}
/>
```

## Translations

Tüm bileşenler çeviri desteği sunar:

```typescript
const translations = {
  // PremiumDetailsCard
  title: 'Premium',
  active: 'Active',
  inactive: 'Inactive',
  expires: 'Expires on',
  renews: 'Renews on',
  manage: 'Manage Subscription',
  upgrade: 'Upgrade to Premium',
  lifetime: 'Lifetime Access',

  // PremiumStatusBadge
  guest: 'Guest',
  free: 'Free',
  premium: 'Premium',

  // DetailRow & CreditRow
  credits: 'Credits',
  balance: 'Balance',
  plan: 'Plan',
  status: 'Status',
};

<PremiumDetailsCard
  translations={translations}
  status={status}
/>

<PremiumStatusBadge
  status="premium"
  translations={translations}
/>
```

## Best Practices

1. **Consistent Styling**: Tüm detay bileşenlerinde tutarlı stil kullanın
2. **Loading States**: Veri yüklenirken loading gösterin
3. **Error States**: Hata durumlarını kullanıcı dostu gösterin
4. **Accessibility**: Accessibility özelliklerini ekleyin
5. **Responsive**: Farklı ekran boyutlarında test edin
6. **Performance**: Gereksiz re-render'lardan kaçının
7. **Translations**: Her zaman çeviri desteği sağlayın

## Örnek Implementasyon

```typescript
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  PremiumDetailsCard,
  PremiumStatusBadge,
  DetailRow,
  CreditRow,
  useSubscription,
  useCredits,
} from '@umituz/react-native-subscription';

export default function MySubscriptionScreen() {
  const { subscription, isLoading, refetch } = useSubscription();
  const { credits } = useCredits();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <PremiumStatusBadge
          status={subscription?.type || 'guest'}
          size="large"
          showIcon={true}
        />
      </View>

      {/* Premium Details */}
      <PremiumDetailsCard
        status={subscription}
        onManagePress={() => console.log('Manage')}
        onUpgradePress={() => console.log('Upgrade')}
        style={styles.card}
      />

      {/* Additional Details */}
      <View style={styles.section}>
        <DetailRow
          label="Plan"
          value={subscription?.productId || 'Free Plan'}
        />
        <DetailRow
          label="Status"
          value={subscription?.isActive ? 'Active' : 'Inactive'}
          valueColor={subscription?.isActive ? '#4CAF50' : '#F44336'}
        />
        {subscription?.expirationDate && (
          <DetailRow
            label="Expires"
            value={new Date(subscription.expirationDate).toLocaleDateString()}
          />
        )}
      </View>

      {/* Credits */}
      <View style={styles.section}>
        <CreditRow
          credits={credits}
          currency="USD"
          showBalance={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  card: {
    margin: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
});
```
