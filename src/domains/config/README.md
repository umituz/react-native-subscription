# Config Domain

Abonelik planları, ürün konfigürasyonları ve paket yönetimi için merkezi konfigürasyon sistemi.

## Özellikler

- **Plan Yönetimi**: Aylık, yıllık ve_lifetime plan konfigürasyonları
- **Ürün Metadata**: RevenueCat ürünleri için metadata yönetimi
- **Validasyon**: Konfigürasyon validasyonu ve tip güvenliği
- **Helper Fonksiyonlar**: Plan karşılaştırma ve filtreleme araçları

## Temel Kavramlar

### Plan (Plan Entity)

Abonelik planını temsil eden temel entity:

```typescript
import { Plan } from '@umituz/react-native-subscription';

interface Plan {
  id: string;              // 'premium_monthly'
  productId: string;       // RevenueCat product ID
  period: 'monthly' | 'annual' | 'lifetime';
  price: number;           // Fiyat (kusur Sayı)
  currency: string;        // 'USD', 'EUR', 'TRY'
  credits?: number;        // İlk kredi miktarı
  features: string[];      // ['feature1', 'feature2']
  metadata?: Record<string, any>;
}
```

## Kullanım

### Plan Oluşturma

```typescript
import { Plan } from '@umituz/react-native-subscription';

const monthlyPlan = Plan.create({
  id: 'premium_monthly',
  productId: 'com.app.premium.monthly',
  period: 'monthly',
  price: 9.99,
  currency: 'USD',
  credits: 100,
  features: ['unlimited_access', 'ai_tools', 'no_ads'],
  metadata: {
    popular: false,
    discount: 0,
  },
});

const annualPlan = Plan.create({
  id: 'premium_annual',
  productId: 'com.app.premium.annual',
  period: 'annual',
  price: 79.99,
  currency: 'USD',
  credits: 1200,
  features: ['unlimited_access', 'ai_tools', 'no_ads', 'priority_support'],
  metadata: {
    popular: true,
    discount: 33, // 33% indirim
    savings: 39.89,
  },
});
```

### Plan Karşılaştırma

```typescript
import { Plan } from '@umituz/react-native-subscription';

// Planları karşılaştır
const isAnnualBetter = annualPlan.isBetterValueThan(monthlyPlan); // true

// Aylık eşdeğer fiyatı hesapla
const monthlyEquivalent = annualPlan.getMonthlyEquivalent(); // 6.67

// Tasarruf hesapla
const savings = annualPlan.calculateSavings(monthlyPlan); // 39.89
```

### Plan Filtreleme

```typescript
import { filterPlans, sortByPrice, sortByPeriod } from '@umituz/react-native-subscription';

const plans = [monthlyPlan, annualPlan, lifetimePlan];

// Periyoda göre filtrele
const subscriptionPlans = filterPlans(plans, { period: ['monthly', 'annual'] });

// Fiyata göre sırala
const sortedByPrice = sortByPrice(plans, 'asc');

// Özelliklere göre filtrele
const plansWithAI = filterPlans(plans, { features: ['ai_tools'] });
```

## Helper Fonksiyonlar

### Plan Helpers

```typescript
import {
  getPlanPeriod,
  isSubscriptionPlan,
  isLifetimePlan,
  formatPrice,
  calculateDiscount,
} from '@umituz/react-native-subscription';

// Plan periyodunu al
const period = getPlanPeriod(plan); // 'monthly'

// Plan tipi kontrolü
const isSubscription = isSubscriptionPlan(plan); // true
const isLifetime = isLifetimePlan(plan); // false

// Fiyat formatlama
const formatted = formatPrice(9.99, 'USD'); // '$9.99'
const formattedTRY = formatPrice(99.99, 'TRY'); // '99,99 ₺'

// İndirim hesaplama
const discount = calculateDiscount(originalPrice, discountedPrice); // 20
```

### Package Helpers

```typescript
import {
  getPackageType,
  isSubscriptionPackage,
  isInAppPurchase,
  extractPackagePeriod,
  filterPackagesByType,
} from '@umituz/react-native-subscription';

// Paket tipi belirleme
const type = getPackageType(revenueCatPackage); // 'MONTHLY'

// Paket filtreleme
const subscriptions = filterPackagesByType(packages, 'subscription');
const inAppPurchases = filterPackagesByType(packages, 'inapp');

// Periyot çıkarma
const period = extractPackagePeriod('com.app.premium.monthly'); // 'monthly'
```

## Validasyon

### Plan Validasyonu

```typescript
import { Plan } from '@umituz/react-native-subscription';

try {
  const plan = Plan.create({
    id: 'premium_monthly',
    productId: 'com.app.premium.monthly',
    period: 'monthly',
    price: -9.99, // Invalid: negatif fiyat
    currency: 'USD',
  });
} catch (error) {
  console.error('Validation error:', error.message);
}
```

### Config Validasyonu

```typescript
import {
  validatePlanConfig,
  validatePackageConfig,
  type ValidationError,
} from '@umituz/react-native-subscription';

const validation = validatePlanConfig({
  plans: [monthlyPlan, annualPlan],
  defaultPlanId: 'premium_monthly',
});

if (!validation.isValid) {
  validation.errors.forEach((error: ValidationError) => {
    console.error(`Field: ${error.field}, Message: ${error.message}`);
  });
}
```

## Konfigürasyon Nesneleri

### SubscriptionConfig

```typescript
import { SubscriptionConfig } from '@umituz/react-native-subscription';

const config: SubscriptionConfig = {
  revenueCatApiKey: 'your_api_key',
  revenueCatEntitlementId: 'premium',

  plans: {
    monthly: monthlyPlan,
    annual: annualPlan,
    lifetime: lifetimePlan,
  },

  defaultPlan: 'monthly',

  features: {
    requireAuth: true,
    allowRestore: true,
    syncWithFirebase: true,
  },

  ui: {
    showAnnualDiscount: true,
    highlightPopularPlan: true,
    showPerks: true,
  },
};
```

### WalletConfig

```typescript
import { WalletConfig } from '@umituz/react-native-subscription';

const walletConfig: WalletConfig = {
  initialCredits: 100,

  creditPackages: [
    {
      id: 'credits_small',
      productId: 'com.app.credits.small',
      amount: 100,
      price: 0.99,
    },
    {
      id: 'credits_medium',
      productId: 'com.app.credits.medium',
      amount: 500,
      price: 3.99,
    },
  ],

  creditCosts: {
    ai_generation: 1,
    ai_analysis: 2,
    premium_feature: 5,
  },

  expiration: {
    enabled: true,
    daysUntilExpiration: 365,
  },
};
```

## Best Practices

1. **Tip Güvenliği**: Her zaman tip tanımlamalarını kullanın
2. **Validasyon**: Konfigürasyonları çalıştırmadan önce doğrulayın
3. **Default Değerler**: Anlamlı default değerler sağlayın
4. **Immutable**: Plan objelerini değiştirmek yerine yeni kopyalar oluşturun
5. **Environment**: Farklı ortamlar için farklı konfigürasyonlar kullanın

## Örnek Uygulama

```typescript
import {
  Plan,
  SubscriptionConfig,
  validatePlanConfig,
  formatPrice,
  calculateDiscount,
} from '@umituz/react-native-subscription';

// 1. Planları tanımlayın
const plans = {
  monthly: Plan.create({
    id: 'premium_monthly',
    productId: 'com.app.premium.monthly',
    period: 'monthly',
    price: 9.99,
    currency: 'USD',
    credits: 100,
    features: ['unlimited_access', 'ai_tools'],
  }),

  annual: Plan.create({
    id: 'premium_annual',
    productId: 'com.app.premium.annual',
    period: 'annual',
    price: 79.99,
    currency: 'USD',
    credits: 1200,
    features: ['unlimited_access', 'ai_tools', 'priority_support'],
    metadata: { discount: 33, popular: true },
  }),
};

// 2. Konfigürasyonu oluşturun
const config: SubscriptionConfig = {
  revenueCatApiKey: process.env.REVENUECAT_API_KEY,
  revenueCatEntitlementId: 'premium',
  plans,
  defaultPlan: 'monthly',
};

// 3. Doğrulayın
const validation = validatePlanConfig(config);
if (!validation.isValid) {
  throw new Error('Invalid config');
}

// 4. Kullanın
function PricingCard() {
  const monthlyPrice = formatPrice(plans.monthly.price, 'USD');
  const annualPrice = formatPrice(plans.annual.price, 'USD');
  const discount = calculateDiscount(
    plans.monthly.price * 12,
    plans.annual.price
  );

  return (
    <View>
      <Text>Monthly: {monthlyPrice}</Text>
      <Text>Annual: {annualPrice} (Save {discount}%)</Text>
    </View>
  );
}
```

## API Referansı

### Plan Entity

```typescript
class Plan {
  readonly id: string;
  readonly productId: string;
  readonly period: PlanPeriod;
  readonly price: number;
  readonly currency: string;
  readonly credits?: number;
  readonly features: string[];
  readonly metadata?: Record<string, any>;

  // Metodlar
  isBetterValueThan(other: Plan): boolean;
  getMonthlyEquivalent(): number;
  calculateSavings(other: Plan): number;
  hasFeature(feature: string): boolean;

  // Static metodlar
  static create(config: PlanConfig): Plan;
  static fromRevenueCat(package: Package): Plan;
}
```

### Tip Tanımlamaları

```typescript
type PlanPeriod = 'monthly' | 'annual' | 'lifetime';

interface PlanConfig {
  id: string;
  productId: string;
  period: PlanPeriod;
  price: number;
  currency: string;
  credits?: number;
  features: string[];
  metadata?: Record<string, any>;
}

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
```
