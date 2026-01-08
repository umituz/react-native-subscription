# Screens

Tam ekran UI bileşenleri ve ekranlar.

## Bileşenler

- [SubscriptionDetailScreen](#subscriptiondetailscreen)

## SubscriptionDetailScreen

Abonelik detaylarını gösteren tam ekran bileşeni.

### Kullanım

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
```

### Props

```typescript
interface SubscriptionDetailScreenProps {
  route: {
    key: string;
    name: string;
    params?: {
      userId?: string;
      showUpgradeButton?: boolean;
    };
  };
  navigation: any;
}
```

### Özellikler

- Abonelik durumunu gösterir
- Paket detaylarını görüntüler
- Yönetim butonları sağlar
- Refresh desteği
- Yönetilebilir stil

## Ekran Akışları

### 1. Settings → Subscription Detail

```typescript
function SettingsScreen({ navigation }) {
  return (
    <View>
      <Button
        onPress={() => navigation.navigate('SubscriptionDetail')}
        title="Manage Subscription"
      />
    </View>
  );
}
```

### 2. Paywall → Subscription Detail

```typescript
function PaywallFlow() {
  const navigation = useNavigation();

  const handlePurchaseSuccess = () => {
    navigation.navigate('SubscriptionDetail');
  };

  return (
    <PaywallModal onPurchase={handlePurchaseSuccess} />
  );
}
```

## Özelleştirme

### Custom Header

```typescript
<Stack.Screen
  name="SubscriptionDetail"
  component={SubscriptionDetailScreen}
  options={{
    title: 'My Subscription',
    headerStyle: {
      backgroundColor: '#FF6B6B',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}
/>
```

### Navigation Integrasyonu

```typescript
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function SubscriptionStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SubscriptionDetail"
        component={SubscriptionDetailScreen}
        options={{
          title: 'Subscription',
          headerRight: () => (
            <Button onPress={handleRefresh} title="Refresh" />
          ),
        }}
      />
    </Stack.Navigator>
  );
}
```

## Örnek Implementasyon

```typescript
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SubscriptionDetailScreen } from '@umituz/react-native-subscription';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          cardStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="SubscriptionDetail"
          component={SubscriptionDetailScreen}
          options={{
            title: 'My Subscription',
            headerStyle: {
              backgroundColor: '#FF6B6B',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  const { isPremium } = usePremium();

  return (
    <View>
      <Text>Welcome!</Text>
      <Button
        onPress={() => navigation.navigate('SubscriptionDetail')}
        title="View Subscription"
      />
    </View>
  );
}
```

## Best Practices

1. **Navigation**: Screen'i doğru navigation stack'e ekleyin
2. **Header**: Uygun başlık ve stiller kullanın
3. **Back Button**: Kullanıcının geri dönmesini sağlayın
4. **Loading**: Yükleme durumlarını gösterin
5. **Error**: Hata durumlarını graceful handle edin
