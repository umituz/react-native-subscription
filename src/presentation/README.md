# Presentation Layer

Abonelik sisteminin UI/UX katmanı - React hooks, components ve screen'ler.

## Sorumluluklar

- **React Hooks**: State management ve veri erişimi
- **Components**: UI bileşenleri
- **Screens**: Tam ekran sayfalar
- **User Interaction**: Kullanıcı etkileşimlerini yönetme

## Yapı

```
presentation/
├── hooks/              # React hooks
│   ├── usePremium.ts
│   ├── useSubscription.ts
│   ├── useCredits.ts
│   └── ...
├── components/         # UI bileşenleri
│   ├── details/       # Detay kartları, badge'ler
│   ├── feedback/      # Modal, feedback bileşenleri
│   └── sections/      # Section bileşenleri
└── screens/           # Ekranlar
    └── SubscriptionDetailScreen.tsx
```

## Hooks

Tüm hooks `src/presentation/hooks/` dizininde README.md dosyasında detaylı olarak açıklanmıştır.

Ana hooks:
- `usePremium` - Premium durumu
- `useSubscription` - Abonelik durumu
- `useCredits` - Kredi bakiyesi
- `usePremiumGate` - Premium özellik kontrolü
- `useCreditsGate` - Kredi özellik kontrolü
- `usePaywall*` - Paywall yönetimi

Detaylı bilgi için: [hooks/README.md](./hooks/README.md)

## Components

### Details Components

Detay gösterimi için bileşenler:

```
components/details/
├── PremiumDetailsCard.tsx       # Premium detay kartı
├── PremiumDetailsCard.styles.ts
├── PremiumDetailsCardTypes.ts
├── PremiumStatusBadge.tsx       # Durum badge'i
└── PremiumDetailsCard.styles.ts
```

**PremiumDetailsCard Kullanımı:**

```typescript
import { PremiumDetailsCard } from '@umituz/react-native-subscription';

<PremiumDetailsCard
  status={{
    type: 'premium',
    isActive: true,
    expirationDate: '2025-12-31',
    willRenew: true,
  }}
  onUpgradePress={() => console.log('Upgrade pressed')}
  onManagePress={() => console.log('Manage pressed')}
  translations={{
    title: 'Premium',
    status: 'Active',
    expires: 'Expires on',
    renew: 'Renews on',
  }}
/>
```

**PremiumStatusBadge Kullanımı:**

```typescript
import { PremiumStatusBadge } from '@umituz/react-native-subscription';

<PremiumStatusBadge
  status="premium"
  size="medium"
  showIcon={true}
/>
```

### Feedback Components

Kullanıcı feedback'i için bileşenler:

```
components/feedback/
├── PaywallFeedbackModal.tsx     # Paywall feedback modal
├── PaywallFeedbackModal.styles.ts
└── paywallFeedbackStyles.ts
```

**PaywallFeedbackModal Kullanımı:**

```typescript
import { PaywallFeedbackModal } from '@umituz/react-native-subscription';

<PaywallFeedbackModal
  isVisible={showFeedback}
  onClose={() => setShowFeedback(false)}
  onSubmit={(feedback) => {
    console.log('Feedback:', feedback);
    analytics.track('paywall_feedback', feedback);
  }}
  translations={{
    title: 'Tell us why',
    placeholder: 'Share your thoughts...',
    submit: 'Submit',
  }}
/>
```

### Section Components

Section bileşenleri:

```
components/sections/
└── SubscriptionSection.tsx       # Abonelik section'ı
```

**SubscriptionSection Kullanımı:**

```typescript
import { SubscriptionSection } from '@umituz/react-native-subscription';

<SubscriptionSection
  title="Subscription"
  subscription={subscriptionData}
  onPress={() => navigateToSubscription()}
  translations={{
    manage: 'Manage Subscription',
    upgrade: 'Upgrade to Premium',
  }}
/>
```

## Screens

### SubscriptionDetailScreen

Abonelik detay ekranı:

```typescript
import { SubscriptionDetailScreen } from '@umituz/react-native-subscription';

function App() {
  return (
    <Stack.Screen
      name="SubscriptionDetail"
      component={SubscriptionDetailScreen}
      options={{
        title: 'Subscription',
      }}
    />
  );
}

// Veya doğrudan kullanım
<SubscriptionDetailScreen
  route={{
    key: 'subscription',
    name: 'SubscriptionDetail',
    params: { userId: 'user-123' },
  }}
  navigation={navigation}
/>
```

## Tip Tanımlamaları

### Component Props

```typescript
// PremiumDetailsCard
interface PremiumDetailsCardProps {
  status: SubscriptionStatus;
  onUpgradePress?: () => void;
  onManagePress?: () => void;
  style?: ViewStyle;
  translations?: PremiumDetailsCardTranslations;
}

// PremiumStatusBadge
interface PremiumStatusBadgeProps {
  status: SubscriptionStatusType;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: ViewStyle;
}

// PaywallFeedbackModal
interface PaywallFeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  translations?: PaywallFeedbackTranslations;
}
```

## Styling

Component stilleri StyleSheet ile tanımlanır:

```typescript
import { premiumDetailsCardStyles } from '@umituz/react-native-subscription';

// Özel stil override
<PremiumDetailsCard
  style={customStyles.card}
  status={status}
/>

const customStyles = StyleSheet.create({
  card: {
    backgroundColor: 'custom-background',
    borderRadius: 16,
    padding: 20,
  },
});
```

## Translations

Tüm component'ler translations desteği sunar:

```typescript
const translations = {
  // PremiumDetailsCard
  title: 'Premium',
  active: 'Active',
  expires: 'Expires on',
  renews: 'Renews on',
  manage: 'Manage Subscription',
  upgrade: 'Upgrade to Premium',

  // PaywallFeedbackModal
  feedbackTitle: 'Tell us why',
  feedbackPlaceholder: 'Share your thoughts...',
  submit: 'Submit',
  cancel: 'Cancel',
};

<PremiumDetailsCard translations={translations} status={status} />
```

## Theming

Component'leri özelleştirin:

```typescript
import { ThemeProvider } from '@umituz/react-native-subscription';

const customTheme = {
  colors: {
    primary: '#FF6B6B',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    background: '#FFFFFF',
    text: '#000000',
  },
  fonts: {
    title: { fontSize: 24, fontWeight: 'bold' },
    body: { fontSize: 16, fontWeight: 'normal' },
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
};

<ThemeProvider theme={customTheme}>
  <YourApp />
</ThemeProvider>
```

## Best Practices

1. **Props Validation**: PropTypes veya TypeScript kullanın
2. **Styling**: Inline style yerine StyleSheet kullanın
3. **Translations**: Her zaman translation prop'u sağlayın
4. **Loading States**: Yüklenme durumlarını gösterin
5. **Error Handling**: Hataları kullanıcı dostu gösterin
6. **Accessibility**: Accessibility özelliklerini ekleyin
7. **Performance**: React.memo ve useMemo kullanın

## Örnek: Premium Feature Card

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PremiumDetailsCard, usePremium } from '@umituz/react-native-subscription';

function PremiumFeatureCard() {
  const { isPremium, subscription } = usePremium();

  if (!isPremium) {
    return (
      <View style={styles.locked}>
        <Text>🔒 Premium Feature</Text>
        <PremiumDetailsCard
          status={{
            type: 'free',
            isActive: false,
            isPremium: false,
          }}
          onUpgradePress={showPaywall}
          translations={{
            title: 'Upgrade Required',
            upgrade: 'Go Premium',
          }}
        />
      </View>
    );
  }

  return (
    <PremiumDetailsCard
      status={subscription}
      onManagePress={navigateToManage}
      translations={{
        title: 'Premium Active',
        manage: 'Manage',
      }}
    />
  );
}

const styles = StyleSheet.create({
  locked: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
});

export default PremiumFeatureCard;
```

## Örnek: Full Screen Implementation

```typescript
import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import {
  SubscriptionDetailScreen,
  useSubscription,
  usePremium,
} from '@umituz/react-native-subscription';

function MySubscriptionScreen() {
  const { subscription, isLoading } = useSubscription();
  const { isPremium } = usePremium();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <ScrollView>
      <SubscriptionDetailScreen
        route={{
          key: 'subscription',
          name: 'SubscriptionDetail',
          params: {},
        }}
        navigation={navigation}
      />

      {!isPremium && (
        <UpgradePrompt
          onPress={() => navigation.navigate('Paywall')}
        />
      )}
    </ScrollView>
  );
}
```

## Component Library

Tüm component'leri export edin:

```typescript
// components/index.ts
export * from './details';
export * from './feedback';
export * from './sections';

// Kullanım
import {
  PremiumDetailsCard,
  PremiumStatusBadge,
  PaywallFeedbackModal,
  SubscriptionSection,
} from '@umituz/react-native-subscription';
```
