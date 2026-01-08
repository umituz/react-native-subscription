# Paywall Domain

Abonelik ve kredi satın alımı için kullanıcı dostu ödeme duvarı (paywall) bileşenleri ve hooks.

## Özellikler

- **Hazır Paywall Bileşenleri**: Önceden tasarlanmış, özelleştirilebilir paywall UI'ları
- **Modal ve Full-Screen Desteği**: Modal veya tam ekran paywall seçenekleri
- **Çoklu Dil Desteği**: Built-in i18n desteği
- **A/B Test Hazır**: Farklı paywall varyantları kolayca oluşturulabilir
- **Analytics Entegrasyonu**: Kullanıcı davranışlarını takip edin

## Kurulum

### Temel Konfigürasyon

```typescript
import { SubscriptionProvider } from '@umituz/react-native-subscription';

function App() {
  return (
    <SubscriptionProvider
      config={{
        revenueCatApiKey: 'your_api_key',
        entitlementId: 'premium',
      }}
    >
      {/* Your app */}
    </SubscriptionProvider>
  );
}
```

## Kullanım

### PaywallModal

Modal paywall gösterimi için:

```typescript
import { PaywallModal } from '@umituz/react-native-subscription';

function MyComponent() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Button onPress={() => setIsVisible(true)} title="Upgrade to Premium" />

      <PaywallModal
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        config={{
          title: 'Unlock Premium Features',
          description: 'Get unlimited access to all features',
          features: [
            { icon: 'star', text: 'Unlimited credits' },
            { icon: 'zap', text: 'AI-powered tools' },
            { icon: 'shield', text: 'Ad-free experience' },
          ],
        }}
      />
    </>
  );
}
```

### usePaywall Hook

Paywall görünürlüğünü ve davranışlarını kontrol etmek için:

```typescript
import { usePaywall } from '@umituz/react-native-subscription';

function PremiumFeature() {
  const { showPaywall, hidePaywall, isPaywallVisible } = usePaywall();

  const handleUpgradeClick = () => {
    showPaywall({
      trigger: 'premium_button',
      featureId: 'ai_tools',
    });
  };

  return (
    <View>
      <Text>Premium Feature</Text>
      <Button onPress={handleUpgradeClick} title="Unlock" />
    </View>
  );
}
```

### usePaywallActions Hook

Paywall aksiyonları için:

```typescript
import { usePaywallActions } from '@umituz/react-native-subscription';

function PaywallHandler() {
  const { handlePurchase, handleRestore, isLoading } = usePaywallActions();

  return (
    <View>
      <Button
        onPress={handlePurchase}
        disabled={isLoading}
        title="Subscribe Now"
      />
      <Button onPress={handleRestore} title="Restore Purchase" />
    </View>
  );
}
```

### useSubscriptionModal Hook

Subscription modal yönetimi için:

```typescript
import { useSubscriptionModal } from '@umituz/react-native-subscription';

function SubscriptionButton() {
  const { openModal, closeModal, isModalOpen } = useSubscriptionModal();

  return (
    <>
      <Button onPress={openModal} title="View Plans" />
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
```

## Bileşenler

### PaywallContainer

Paywall içerik wrapper'ı:

```typescript
import { PaywallContainer } from '@umituz/react-native-subscription';

<PaywallContainer
  config={{
    theme: 'dark',
    showCloseButton: true,
    closeOnBackdropPress: false,
  }}
>
  {/* Paywall content */}
</PaywallContainer>
```

### PaywallScreen

Tam ekran paywall:

```typescript
import { PaywallScreen } from '@umituz/react-native-subscription';

<PaywallScreen
  packages={subscriptionPackages}
  onPackageSelect={handlePackageSelect}
  config={{
    highlightPackage: 'annual',
    showPerks: true,
    showTerms: true,
  }}
  translations={{
    title: 'Choose Your Plan',
    subtitle: 'Cancel anytime',
    terms: 'Terms & Privacy Policy',
  }}
/>
```

## Hooks Referansı

### usePaywall

```typescript
const {
  showPaywall,      // Paywall göster
  hidePaywall,      // Paywall gizle
  isPaywallVisible, // Paywall görünürlük durumu
  paywallConfig,    // Mevcut konfigürasyon
} = usePaywall();
```

### usePaywallActions

```typescript
const {
  handlePurchase,     // Satın alma işlemi
  handleRestore,      // Satın alma geri yükleme
  isLoading,          // Yüklenme durumu
  error,             // Hata mesajı
  selectedPackage,   // Seçili paket
} = usePaywallActions();
```

### usePaywallTranslations

```typescript
const {
  translations,      // Çeviri objeleri
  t,                // Çeviri fonksiyonu
  isLoading,        // Yüklenme durumu
} = usePaywallTranslations({
  language: 'tr',
  fallbackLanguage: 'en',
});
```

## Özelleştirme

### Tema Konfigürasyonu

```typescript
const customTheme = {
  colors: {
    primary: '#FF6B6B',
    background: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
  },
  fonts: {
    title: { fontSize: 28, fontWeight: 'bold' },
    body: { fontSize: 16, fontWeight: 'normal' },
  },
};

<PaywallModal theme={customTheme} />
```

### Özel Feature Listesi

```typescript
const customFeatures = [
  {
    id: 'feature1',
    icon: 'rocket',
    title: 'AI-Powered Tools',
    description: 'Advanced AI features',
    highlight: true,
  },
  {
    id: 'feature2',
    icon: 'infinity',
    title: 'Unlimited Credits',
    description: 'Never run out of credits',
  },
];

<PaywallScreen features={customFeatures} />
```

## Event Tracking

Analytics entegrasyonu için:

```typescript
import { usePaywallFeedback } from '@umituz/react-native-subscription';

function PaywallWithTracking() {
  const { trackEvent, trackPurchase, trackDismiss } = usePaywallFeedback();

  useEffect(() => {
    trackEvent('paywall_impression', {
      source: 'home_screen',
    });
  }, []);

  const handlePurchase = async () => {
    await purchasePackage();
    trackPurchase('premium_monthly', {
      revenue: 9.99,
      currency: 'USD',
    });
  };

  const handleClose = () => {
    trackDismiss('paywall_closed', {
      duration: 30, // seconds
    });
    closeModal();
  };
}
```

## Best Practices

1. **Trigger Bazlı Gösterim**: Farklı trigger'lar için farklı paywall'lar kullanın
2. **A/B Test**: Farklı varyasyonları test edin
3. **Analytics**: Kullanıcı davranışlarını takip edin
4. **Copywriting**: Farklı dillerde optimize edilmiş copy kullanın
5. **Loading States**: Satın alma sırasında loading gösterin
6. **Error Handling**: Hataları kullanıcı dostu mesajlarla gösterin

## Örnek Uygulama

```typescript
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import {
  PaywallModal,
  usePaywall,
  usePaywallActions,
} from '@umituz/react-native-subscription';

export default function PaywallExample() {
  const { isPaywallVisible, showPaywall, hidePaywall } = usePaywall();
  const { handlePurchase, isLoading } = usePaywallActions();

  return (
    <View>
      <Button
        onPress={() => showPaywall({ trigger: 'upgrade_button' })}
        title="Upgrade to Premium"
      />

      <PaywallModal
        isVisible={isPaywallVisible}
        onClose={hidePaywall}
        config={{
          title: 'Go Premium',
          description: 'Unlock all features',
          features: [
            { icon: 'star', text: 'Unlimited access' },
            { icon: 'zap', text: 'AI features' },
            { icon: 'shield', text: 'No ads' },
          ],
        }}
        onPurchase={handlePurchase}
        isLoading={isLoading}
      />
    </View>
  );
}
```

## Tip Tanımlamaları

```typescript
interface PaywallConfig {
  title?: string;
  description?: string;
  features?: PaywallFeature[];
  theme?: 'light' | 'dark';
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
}

interface PaywallFeature {
  icon: string;
  text: string;
  description?: string;
  highlight?: boolean;
}

interface PaywallTrigger {
  trigger: string;
  featureId?: string;
  source?: string;
}
```
