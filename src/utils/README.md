# Utils

Abonelik sistemi için yardımcı fonksiyonlar ve utility araçları.

## İçindekiler

- [Premium Utilities](#premium-utilities)
- [User Tier Utilities](#user-tier-utilities)
- [Package Utilities](#package-utilities)
- [Price Utilities](#price-utilities)
- [Async Utilities](#async-utilities)
- [Type Definitions](#type-definitions)

## Premium Utilities

Premium durum kontrolü ve yönetimi için yardımcı fonksiyonlar.

```typescript
import {
  isPremiumStatus,
  isSubscriptionActive,
  getSubscriptionStatusText,
  hasPremiumAccess,
  canAccessPremiumFeature,
} from '@umituz/react-native-subscription';

// Premium durum kontrolü
const premium = isPremiumStatus({
  type: 'premium',
  isActive: true,
  isPremium: true,
});
// true

// Aktif abonelik kontrolü
const active = isSubscriptionActive({
  isActive: true,
  expirationDate: '2025-12-31',
});
// true

// Durum metni
const text = getSubscriptionStatusText({
  type: 'premium',
  isActive: true,
});
// "Active Premium"

// Premium erişim kontrolü
const hasAccess = hasPremiumAccess({
  type: 'premium',
  isActive: true,
  isPremium: true,
});
// true

// Özellik erişimi kontrolü
const canAccess = canAccessPremiumFeature(
  { type: 'premium', isActive: true },
  'ai_tools'
);
// true
```

## User Tier Utilities

Kullanıcı tier yönetimi için yardımcı fonksiyonlar.

```typescript
import {
  getUserTier,
  isGuestUser,
  isFreeUser,
  isPremiumUser,
  getTierPriority,
  canUpgradeTier,
  getNextTier,
} from '@umituz/react-native-subscription';

// Tier belirleme
const tier = getUserTier({
  isAuthenticated: false,
});
// 'guest'

const tier = getUserTier({
  isAuthenticated: true,
  subscription: { type: 'free', isActive: false },
});
// 'free'

const tier = getUserTier({
  isAuthenticated: true,
  subscription: { type: 'premium', isActive: true },
});
// 'premium'

// Tier kontrolü
const guest = isGuestUser({ isAuthenticated: false });
// true

const free = isFreeUser({ type: 'free' });
// true

const premium = isPremiumUser({ type: 'premium', isActive: true });
// true

// Tier önceliği
const priority = getTierPriority('premium'); // 3
const priority = getTierPriority('free'); // 2
const priority = getTierPriority('guest'); // 1

// Tier upgrade kontrolü
const canUpgrade = canUpgradeTier('free', 'premium');
// true

// Sonraki tier
const next = getNextTier('guest');
// 'free'
const next = getNextTier('free');
// 'premium'
```

## Package Utilities

RevenueCat paketleri ile çalışmak için yardımcı fonksiyonlar.

```typescript
import {
  getPackageType,
  isSubscriptionPackage,
  isInAppPurchase,
  filterPackagesByType,
  sortPackagesByPrice,
  getPackagePeriod,
  getAnnualPackage,
  getMonthlyPackage,
  formatPackageTitle,
} from '@umituz/react-native-subscription';

// Paket tipi
const type = getPackageType({
  identifier: 'com.app.premium.monthly',
  packageType: PACKAGE_TYPE.MONTHLY,
});
// 'MONTHLY'

// Abonelik kontrolü
const isSub = isSubscriptionPackage({
  packageType: PACKAGE_TYPE.MONTHLY,
});
// true

const isInApp = isInAppPurchase({
  packageType: PACKAGE_TYPE.ONE_TIME_PURCHASE,
});
// true

// Paket filtreleme
const subs = filterPackagesByType(packages, 'subscription');
const inApps = filterPackagesByType(packages, 'inapp');

// Fiyata göre sıralama
const sorted = sortPackagesByPrice(packages, 'asc');

// Periyot alma
const period = getPackagePeriod('com.app.premium.monthly');
// 'monthly'
const period = getPackagePeriod('com.app.premium.annual');
// 'annual'

// Yıllık paket
const annual = getAnnualPackage(packages);

// Aylık paket
const monthly = getMonthlyPackage(packages);

// Paket başlığı formatlama
const title = formatPackageTitle({
  product: {
    title: 'Premium Monthly',
    price: 9.99,
  },
}, 'en');
// "Premium Monthly - $9.99"
```

## Price Utilities

Fiyat hesaplama ve formatlama fonksiyonları.

```typescript
import {
  formatPrice,
  formatPriceWithCurrency,
  calculateDiscount,
  calculateSavings,
  getPricePerMonth,
  getCreditsPerDollar,
  getAnnualMonthlyPrice,
} from '@umituz/react-native-subscription';

// Fiyat formatlama
const formatted = formatPrice(9.99, 'USD');
// "$9.99"

const formattedTRY = formatPrice(99.99, 'TRY');
// "99,99 ₺"

// Currency ile formatlama
const withCurrency = formatPriceWithCurrency(9.99, 'USD', 'en-US');
// "$9.99"

const withCurrencyTRY = formatPriceWithCurrency(99.99, 'TRY', 'tr-TR');
// "99,99 ₺"

// İndirim hesaplama
const discount = calculateDiscount(19.99, 14.99);
// 25.012506253126564 (%25)

// Tasarruf hesaplama
const savings = calculateSavings(9.99, 12); // Monthly price vs 12 months
// 119.88

// Aylık fiyat
const monthly = getPricePerMonth(79.99, 'annual');
// 6.67

// Kredi/dolar oranı
const creditsPerDollar = getCreditsPerDollar(100, 0.99);
// 101.01

// Yıllık aylık fiyat
const annualMonthly = getAnnualMonthlyPrice(79.99);
// "$6.67/month"
```

## Period Utilities

Abonelik periyodu ile ilgili yardımcı fonksiyonlar.

```typescript
import {
  getPeriodInMonths,
  getPeriodInDays,
  formatPeriod,
  isMonthly,
  isAnnual,
  isLifetime,
  getPeriodType,
} from '@umituz/react-native-subscription';

// Periyodun ay sayısı
const months = getPeriodInMonths('monthly'); // 1
const months = getPeriodInMonths('annual'); // 12
const months = getPeriodInMonths('lifetime'); // null

// Periyodun gün sayısı
const days = getPeriodInDays('monthly'); // 30
const days = getPeriodInDays('annual'); // 365
const days = getPeriodInDays('lifetime'); // null

// Periyot formatlama
const formatted = formatPeriod('monthly', 'en');
// "Monthly"
const formatted = formatPeriod('annual', 'en');
// "Annual"
const formatted = formatPeriod('monthly', 'tr');
// "Aylık"

// Periyot kontrolü
const isMonth = isMonthly('monthly'); // true
const isYear = isAnnual('annual'); // true
const isLife = isLifetime('lifetime'); // true

// Periyot tipi
const type = getPeriodType('com.app.premium.monthly');
// 'monthly'
```

## Async Utilities

Asenkron işlemler için yardımcı fonksiyonlar.

```typescript
import {
  checkPremiumStatusAsync,
  getSubscriptionStatusAsync,
  waitForSubscriptionInit,
  retryOperation,
} from '@umituz/react-native-subscription';

// Premium kontrolü (async)
const isPremium = await checkPremiumStatusAsync(userId);
// true/false

// Abonelik durumu (async)
const status = await getSubscriptionStatusAsync(userId);
// { type: 'premium', isActive: true, ... }

// Başlatma bekleme
await waitForSubscriptionInit({
  timeout: 5000,
  interval: 100,
});

// Retry ile işlem
const result = await retryOperation(
  async () => {
    return await fetchSubscriptionStatus();
  },
  {
    maxRetries: 3,
    delay: 1000,
  }
);
```

## Type Definitions

Yardımcı tip tanımlamaları.

```typescript
import type {
  PackagePeriod,
  PackageType,
  UserTier,
  SubscriptionStatusType,
  PriceFormatOptions,
  PeriodFormatOptions,
} from '@umituz/react-native-subscription';

// Periyot tipi
type PackagePeriod = 'monthly' | 'annual' | 'lifetime';

// Paket tipi
type PackageType = 'subscription' | 'inapp';

// Kullanıcı tier
type UserTier = 'guest' | 'free' | 'premium';

// Durum tipi
type SubscriptionStatusType = 'unknown' | 'guest' | 'free' | 'premium';

// Fiyat format seçenekleri
interface PriceFormatOptions {
  locale?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Periyot format seçenekleri
interface PeriodFormatOptions {
  locale?: string;
  lowercase?: boolean;
  abbreviated?: boolean;
}
```

## Validation Utilities

Validasyon fonksiyonları.

```typescript
import {
  isValidPackageId,
  isValidPrice,
  isValidPeriod,
  validateSubscriptionData,
  isValidEmail,
} from '@umituz/react-native-subscription';

// Paket ID validasyonu
const valid = isValidPackageId('com.app.premium.monthly');
// true

const invalid = isValidPackageId('invalid-package');
// false

// Fiyat validasyonu
const valid = isValidPrice(9.99);
// true

const invalid = isValidPrice(-9.99);
// false

// Periyot validasyonu
const valid = isValidPeriod('monthly');
// true

const invalid = isValidPeriod('invalid');
// false

// Abonelik verisi validasyonu
const validation = validateSubscriptionData({
  type: 'premium',
  isActive: true,
  isPremium: true,
  expirationDate: '2025-12-31',
});

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}

// Email validasyonu
const valid = isValidEmail('user@example.com');
// true
```

## Data Transformation Utilities

Veri dönüşüm fonksiyonları.

```typescript
import {
  transformRevenueCatPackage,
  transformSubscriptionStatus,
  normalizePackageData,
  sanitizeUserData,
} from '@umituz/react-native-subscription';

// RevenueCat paketi dönüştürme
const transformed = transformRevenueCatPackage(revenueCatPackage);
// { id: 'premium_monthly', period: 'monthly', price: 9.99, ... }

// Abonelik durumu dönüştürme
const status = transformSubscriptionStatus(rawData);
// SubscriptionStatus objesi

// Paket verisi normalize etme
const normalized = normalizePackageData(packages);
// Standart paket formatı

// Kullanıcı verisi temizleme
const cleaned = sanitizeUserData({
  userId: 'user-123',
  // ...sensitive data removed
});
// Temizlenmiş kullanıcı verisi
```

## Best Practices

1. **Type Safety**: Tüm fonksiyonlar tip güvenlidir
2. **Null Safety**: Null check'leri güvenli şekilde yapın
3. **Error Handling**: Hataları yakalayın ve handle edin
4. **Localization**: Farklı dilleri destekleyin
5. **Testing**: Utility fonksiyonlarını test edin
6. **Documentation**: JSDoc yorumları ekleyin

## Örnek Kullanım

```typescript
import {
  getUserTier,
  isPremiumUser,
  formatPrice,
  getPackagePeriod,
  calculateDiscount,
} from '@umituz/react-native-subscription';

function SubscriptionCard({ subscription, package }) {
  // Tier belirleme
  const tier = getUserTier(subscription);

  // Premium kontrolü
  const isPremium = isPremiumUser(subscription);

  // Fiyat formatlama
  const formattedPrice = formatPrice(package.price, package.currency);

  // Periyot alma
  const period = getPackagePeriod(package.identifier);

  // İndirim hesaplama
  const discount = calculateDiscount(
    package.price,
    package.originalPrice
  );

  return (
    <View>
      <Text>Tier: {tier}</Text>
      <Text>Price: {formattedPrice}</Text>
      <Text>Period: {period}</Text>
      {discount > 0 && <Text>Save {discount.toFixed(0)}%</Text>}
    </View>
  );
}
```

## Testing

Utility fonksiyonları test etmek kolaydır:

```typescript
import { getUserTier, formatPrice } from '@umituz/react-native-subscription';

describe('Utils', () => {
  describe('getUserTier', () => {
    it('should return guest for unauthenticated users', () => {
      const tier = getUserTier({ isAuthenticated: false });
      expect(tier).toBe('guest');
    });

    it('should return premium for active subscriptions', () => {
      const tier = getUserTier({
        isAuthenticated: true,
        subscription: { type: 'premium', isActive: true },
      });
      expect(tier).toBe('premium');
    });
  });

  describe('formatPrice', () => {
    it('should format USD prices correctly', () => {
      const formatted = formatPrice(9.99, 'USD');
      expect(formatted).toBe('$9.99');
    });

    it('should format TRY prices correctly', () => {
      const formatted = formatPrice(99.99, 'TRY');
      expect(formatted).toBe('99,99 ₺');
    });
  });
});
```
