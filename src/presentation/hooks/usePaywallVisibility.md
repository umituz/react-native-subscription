# usePaywallVisibility Hook

Simple global state management for paywall visibility using external store.

## Import

```typescript
import {
  usePaywallVisibility,
  paywallControl
} from '@umituz/react-native-subscription';
```

## Signature

```typescript
function usePaywallVisibility(): {
  showPaywall: boolean;
  setShowPaywall: (visible: boolean) => void;
  openPaywall: () => void;
  closePaywall: () => void;
}

// Direct control (non-React contexts)
paywallControl: {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `showPaywall` | `boolean` | Current visibility state |
| `setShowPaywall` | `(visible) => void` | Set visibility state |
| `openPaywall` | `() => void` | Open paywall |
| `closePaywall` | `() => void` | Close paywall |

## Basic Usage

```typescript
function PaywallModal() {
  const { showPaywall, closePaywall } = usePaywallVisibility();

  if (!showPaywall) return null;

  return (
    <Modal visible={showPaywall} onRequestClose={closePaywall}>
      <PaywallContent onClose={closePaywall} />
    </Modal>
  );
}
```

## Advanced Usage

### With App Root Setup

```typescript
function App() {
  return (
    <>
      <YourAppNavigation />
      <PaywallModal />
    </>
  );
}

function PaywallModal() {
  const { showPaywall, closePaywall } = usePaywallVisibility();

  return (
    <Modal visible={showPaywall} animationType="slide">
      <PaywallScreen onClose={closePaywall} />
    </Modal>
  );
}
```

### With Trigger Button

```typescript
function PremiumFeature() {
  const { openPaywall } = usePaywallVisibility();

  return (
    <Button
      onPress={openPaywall}
      title="Upgrade to Premium"
    />
  );
}
```

### With Direct Control (Non-React)

```typescript
// In app initializer or non-React code
import { paywallControl } from '@umituz/react-native-subscription';

function showPaywallFromDeepLink(url: URL) {
  if (url.pathname === '/upgrade') {
    paywallControl.open();
  }
}

function checkAndShowPaywall() {
  if (!paywallControl.isOpen()) {
    paywallControl.open();
  }
}
```

### With Conditional Display

```typescript
function ConditionalPaywall() {
  const { showPaywall, openPaywall, closePaywall } = usePaywallVisibility();
  const { isPremium } = usePremium();

  useEffect(() => {
    // Auto-show paywall for free users on certain screens
    if (!isPremium && someCondition) {
      openPaywall();
    }
  }, [isPremium]);

  if (isPremium) return null; // Don't show for premium users

  return (
    <Modal visible={showPaywall}>
      <PaywallContent onClose={closePaywall} />
    </Modal>
  );
}
```

### With History/Navigation

```typescript
function PaywallWithHistory() {
  const { showPaywall, closePaywall, openPaywall } = usePaywallVisibility();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Show paywall when returning to certain screens
      if (shouldShowPaywall()) {
        openPaywall();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleClose = () => {
    closePaywall();
    navigation.goBack();
  };

  return (
    <Modal visible={showPaywall}>
      <PaywallContent onClose={handleClose} />
    </Modal>
  );
}
```

## Examples

### Global Paywall System

```typescript
// App.tsx
function App() {
  return (
    <PaywallProvider>
      <Navigation />
      <GlobalPaywall />
    </PaywallProvider>
  );
}

// components/GlobalPaywall.tsx
function GlobalPaywall() {
  const { showPaywall, closePaywall } = usePaywallVisibility();

  return (
    <Modal visible={showPaywall} animationType="slide">
      <PaywallScreen onClose={closePaywall} />
    </Modal>
  );
}

// Any component can trigger the paywall
function UpgradeButton() {
  const { openPaywall } = usePaywallVisibility();
  return <Button onPress={openPaywall} title="Upgrade" />;
}
```

### With Context Integration

```typescript
function PaywallWithContext() {
  const { showPaywall, closePaywall, setShowPaywall } = usePaywallVisibility();
  const { isPremium } = usePremium();

  // Close paywall when user becomes premium
  useEffect(() => {
    if (isPremium && showPaywall) {
      setShowPaywall(false);
    }
  }, [isPremium, showPaywall]);

  if (isPremium) return null;

  return (
    <Modal visible={showPaywall}>
      <PaywallScreen onClose={closePaywall} />
    </Modal>
  );
}
```

### With Timeout/Auto-Close

```typescript
function TimedPaywall() {
  const { showPaywall, closePaywall } = usePaywallVisibility();

  useEffect(() => {
    if (!showPaywall) return;

    // Auto-close after 30 seconds
    const timer = setTimeout(() => {
      closePaywall();
    }, 30000);

    return () => clearTimeout(timer);
  }, [showPaywall, closePaywall]);

  return (
    <Modal visible={showPaywall}>
      <PaywallContent onClose={closePaywall} />
    </Modal>
  );
}
```

### With Back Handler

```typescript
function PaywallWithBackHandler() {
  const { showPaywall, closePaywall } = usePaywallVisibility();

  useBackHandler(showPaywall, () => {
    closePaywall();
    return true; // Prevent default back behavior
  });

  return (
    <Modal visible={showPaywall}>
      <PaywallContent onClose={closePaywall} />
    </Modal>
  );
}
```

### From Deep Link

```typescript
// Deep link handler
import { paywallControl } from '@umituz/react-native-subscription';
import { Linking } from 'react-native';

Linking.addEventListener('url', ({ url }) => {
  const parsed = new URL(url);

  if (parsed.pathname === '/upgrade') {
    paywallControl.open();
  }

  if (parsed.searchParams.get('show_paywall') === 'true') {
    paywallControl.open();
  }
});
```

### From Push Notification

```typescript
// Push notification handler
import { paywallControl } from '@umituz/react-native-subscription';
import messaging from '@react-native-firebase/messaging';

messaging().onNotificationOpenedApp((remoteMessage) => {
  if (remoteMessage.data?.type === 'paywall') {
    paywallControl.open();
  }
});

// Or when app is in background
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  if (remoteMessage.data?.show_paywall) {
    // Store flag to show paywall when app opens
    AsyncStorage.setItem('pending_paywall', 'true');
  }
});

// Then in your app
useEffect(() => {
  AsyncStorage.getItem('pending_paywall').then((value) => {
    if (value === 'true') {
      paywallControl.open();
      AsyncStorage.removeItem('pending_paywall');
    }
  });
}, []);
```

## Best Practices

1. **Single modal instance** - Place paywall once at app root
2. **Global access** - Use `paywallControl` for non-React contexts
3. **Clean close** - Always provide close button
4. **Back handler** - Handle Android back button
5. **State persistence** - Don't rely on component state
6. **Auto-close for premium** - Hide when user subscribes
7. **Deeplink support** - Open from URLs and notifications

## Related Hooks

- **usePaywallOperations** - For paywall purchase operations
- **usePremium** - For subscription status
- **usePaywall** - For complete paywall management

## See Also

- [Paywall Screen](../screens/README.md)
- [Paywall Components](../components/paywall/README.md)
- [Modal Integration](../../../docs/MODAL_INTEGRATION.md)
