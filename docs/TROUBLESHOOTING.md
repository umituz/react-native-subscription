# Troubleshooting Guide

Common issues and solutions for @umituz/react-native-subscription.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Issues](#configuration-issues)
- [RevenueCat Issues](#revenuecat-issues)
- [Credits System Issues](#credits-system-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [Platform-Specific Issues](#platform-specific-issues)

## Installation Issues

### Issue: Peer dependency warnings

**Symptoms:**
```
npm WARN peer dependency missing
```

**Solution:**

Install all required peer dependencies:

```bash
npm install @tanstack/react-query react-native-purchases
# or
yarn add @tanstack/react-query react-native-purchases
```

### Issue: Type errors after installation

**Symptoms:**
```
Cannot find module '@umituz/react-native-subscription'
```

**Solution:**

1. Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Restart TypeScript server in your IDE

3. Ensure `package.json` has correct `main` and `types` fields

### Issue: Metro bundler cache issues

**Symptoms:**
```
Unable to resolve module @umituz/react-native-subscription
```

**Solution:**

```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or
npm start -- --reset-cache
```

## Configuration Issues

### Issue: "RevenueCat not initialized"

**Symptoms:**
```
Error: RevenueCat not initialized. Call configure() first.
```

**Solution:**

1. Ensure you've wrapped your app with `SubscriptionProvider`:

```typescript
function App() {
  return (
    <SubscriptionProvider config={config}>
      <YourApp />
    </SubscriptionProvider>
  );
}
```

2. Or manually initialize:

```typescript
import { initializeSubscription } from '@umituz/react-native-subscription';

await initializeSubscription(config);
```

3. Check API key is correct:

```typescript
const config = {
  revenueCatApiKey: __DEV__
    ? 'your_test_key'
    : 'your_production_key',
  revenueCatEntitlementId: 'premium',
};
```

### Issue: Wrong entitlement ID

**Symptoms:**
```
Subscription status always shows as "free"
```

**Solution:**

Verify your entitlement ID matches RevenueCat:

1. Go to RevenueCat Dashboard
2. Check your entitlement ID
3. Update config:

```typescript
const config = {
  revenueCatEntitlementId: 'premium', // Must match exactly
};
```

### Issue: Environment mismatch

**Symptoms:**
```
Using production API keys in development
```

**Solution:**

Use different keys for dev/prod:

```typescript
const config = {
  revenueCatApiKey: __DEV__
    ? process.env.REVENUECAT_API_KEY_DEV
    : process.env.REVENUECAT_API_KEY_PROD,
};
```

## RevenueCat Issues

### Issue: No products available

**Symptoms:**
```
Offerings are empty
Packages list is empty
```

**Solution:**

1. **Check RevenueCat Dashboard:**
   - Products are configured
   - Products are active
   - Offering contains products

2. **Check App Store Connect:**
   - Subscriptions are created
   - Subscriptions are approved
   - Product IDs match

3. **Check Google Play Console:**
   - Subscriptions are active
   - Product IDs match
   - App is published (can be in testing track)

4. **Verify product IDs:**

```typescript
// In RevenueCat Dashboard
Product IDs:
- com.yourapp.premium.monthly
- com.yourapp.premium.annual

// Must match in your code
```

### Issue: Purchases failing in sandbox

**Symptoms:**
```
Purchase fails in test environment
"Purchase failed" error
```

**Solution:**

**iOS:**
1. Create sandbox test account in App Store Connect
2. Sign out of App Store on device
3. Use sandbox account for purchase
4. Clear Safari cookies if needed

**Android:**
1. Add license testers in Google Play Console
2. Use test account for purchase
3. Ensure APK is uploaded to Play Console
4. Use track URL for testing

### Issue: CustomerInfo not updating

**Symptoms:**
```
Premium status doesn't update after purchase
Old subscription info shown
```

**Solution:**

1. Manually refetch customer info:

```typescript
const { refetch } = useCustomerInfo();

await refetch();
```

2. Check RevenueCat listener:

```typescript
useEffect(() => {
  const listener = CustomerInfoUpdatedListener((info) => {
    console.log('Customer info updated:', info);
  });

  return () => listener.remove();
}, []);
```

3. Clear cache:

```typescript
await Purchases.invalidateCustomerInfoCache();
await refetch();
```

## Credits System Issues

### Issue: Credits not initializing

**Symptoms:**
```
Credits always show 0
configureCreditsRepository not working
```

**Solution:**

1. Ensure Firebase is configured:

```typescript
import { initializeApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

2. Configure credits repository:

```typescript
import { configureCreditsRepository } from '@umituz/react-native-subscription';

configureCreditsRepository({
  firebase: { firestore: db },
  config: creditsConfig,
});
```

3. Check Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /credits/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Issue: Credit deduction fails

**Symptoms:**
```
consumeCredit returns error
"Insufficient credits" even with balance
```

**Solution:**

1. Check credit balance:

```typescript
const { credits } = useCredits();
console.log('Current credits:', credits);
```

2. Verify credit cost:

```typescript
const { consumeCredit } = useDeductCredit();

const result = await consumeCredit({
  amount: 5, // Check this amount
  reason: 'feature_usage',
});
```

3. Handle error properly:

```typescript
if (!result.success) {
  console.error('Error:', result.error?.message);
  // Show user-friendly message
}
```

### Issue: Credits not persisting

**Symptoms:**
```
Credits reset on app restart
Credits lost after navigation
```

**Solution:**

1. Ensure Firestore is connected:

```typescript
const db = getFirestore(app);

// Test connection
db.collection('test').doc('test').get()
  .then(() => console.log('Firestore connected'))
  .catch(err => console.error('Firestore error:', err));
```

2. Check network connectivity:

```typescript
import { NetInfo } from '@react-native-community/netinfo';

const state = await NetInfo.fetch();
if (!state.isConnected) {
  console.log('No internet connection');
}
```

3. Enable offline persistence:

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

await enableIndexedDbPersistence(db);
```

## Build Issues

### Issue: TypeScript errors

**Symptoms:**
```
Cannot find module
Property does not exist
Type errors
```

**Solution:**

1. Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

2. Run type check:

```bash
npm run typecheck
```

3. Clear and rebuild:

```bash
rm -rf node_modules
npm install
npx tsc --noEmit
```

### Issue: iOS build fails

**Symptoms:**
```
Pod install fails
Linker errors
Duplicate symbols
```

**Solution:**

1. Update pods:

```bash
cd ios
pod deintegrate
pod install
cd ..
```

2. Clean build:

```bash
# Xcode: Product > Clean Build Folder
# Or
rm -rf ios/build
```

3. Check React Native version:

```bash
# Ensure compatible versions
npx react-native --version
```

### Issue: Android build fails

**Symptoms:**
```
Gradle sync fails
Build errors
Duplicate class errors
```

**Solution:**

1. Clean Gradle:

```bash
cd android
./gradlew clean
cd ..
```

2. Update Gradle dependencies:

```gradle
// android/build.gradle
dependencies {
  // ...
  classpath 'com.google.gms:google-services:4.4.0'
}
```

3. Check AndroidX migration:

```gradle
// gradle.properties
android.useAndroidX=true
android.enableJetifier=true
```

## Runtime Issues

### Issue: Hook called outside component

**Symptoms:**
```
Error: Invalid hook call
Hooks can only be called inside of the body of a function component
```

**Solution:**

Ensure hooks are called correctly:

```typescript
// ✅ Correct
function MyComponent() {
  const { isPremium } = usePremium();
  return <View />;
}

// ❌ Wrong
function MyComponent() {
  if (condition) {
    const { isPremium } = usePremium(); // Don't call in conditions
  }
  return <View />;
}
```

### Issue: Memory leaks

**Symptoms:**
```
Warning: Can't perform a React state update on an unmounted component
Memory usage increases over time
```

**Solution:**

1. Cleanup subscriptions:

```typescript
useEffect(() => {
  const subscription = someObservable.subscribe(data => {
    setState(data);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

2. Cancel async operations:

```typescript
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    const result = await api.call();
    if (!cancelled) {
      setState(result);
    }
  }

  fetchData();

  return () => {
    cancelled = true;
  };
}, []);
```

## Platform-Specific Issues

### iOS Issues

#### Issue: App Store receipt missing

**Symptoms:**
```
Cannot find App Store receipt
Receipt validation failed
```

**Solution:**

1. Ensure app is signed correctly
2. Test on physical device, not simulator
3. Check Bundle Identifier matches App Store Connect

#### Issue: Sandbox account issues

**Symptoms:**
```
Cannot sign in with sandbox account
Sandbox purchase fails
```

**Solution:**

1. Sign out of App Store on device
2. Clear Safari cookies
3. Create new sandbox tester
4. Wait 15-30 minutes for new account activation

### Android Issues

#### Issue: Play Store billing unavailable

**Symptoms:**
```
Billing unavailable
Purchase fails with "Billing unavailable"
```

**Solution:**

1. Check Google Play Services version
2. Ensure device has Google Play Store
3. Update Google Play Services
4. Test on physical device, not emulator

#### Issue: License testing not working

**Symptoms:**
```
Test purchases charged
License testers not recognized
```

**Solution:**

1. Add email to License Testers in Play Console
2. Use correct track URL for testing
3. Upload APK to Play Console
4. Wait 15-30 minutes for tester activation

## Getting Help

If none of these solutions work:

1. **Check logs:**
```typescript
// Enable verbose logging
if (__DEV__) {
  console.log('Subscription state:', subscription);
  console.log('Error:', error);
}
```

2. **Check RevenueCat dashboard:**
- Events log
- API requests
- Error logs

3. **Create minimal reproduction:**
```typescript
// Minimal example
function MinimalExample() {
  const { isPremium } = usePremium();
  return <Text>{isPremium ? 'Premium' : 'Free'}</Text>;
}
```

4. **Report issue:**
- GitHub Issues with reproduction steps
- Include platform, OS, package version
- Include error logs and stack traces

## Resources

- [Getting Started](./GETTING_STARTED.md)
- [Advanced Usage](./ADVANCED_USAGE.md)
- [API Reference](./API_REFERENCE.md)
- [RevenueCat Docs](https://docs.revenuecat.com)
- [GitHub Issues](https://github.com/umituz/react-native-subscription/issues)
