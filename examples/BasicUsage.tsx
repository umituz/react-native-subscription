/**
 * Basic Usage Example
 *
 * This example demonstrates the basic usage of @umituz/react-native-subscription
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  SubscriptionProvider,
  usePremium,
  useCredits,
  useUserTier,
  PaywallModal,
  PremiumDetailsCard,
  initializeSubscription,
} from '@umituz/react-native-subscription';

// 1. Initialize the subscription system
const config = {
  revenueCatApiKey: 'your_api_key_here',
  revenueCatEntitlementId: 'premium',
};

// 2. Wrap your app with SubscriptionProvider
function App() {
  return (
    <SubscriptionProvider config={config}>
      <MyApp />
    </SubscriptionProvider>
  );
}

// 3. Use hooks in your components
function MyApp() {
  return (
    <ScrollView style={styles.container}>
      <UserTierDisplay />
      <PremiumFeature />
      <CreditFeature />
      <SettingsScreen />
    </ScrollView>
  );
}

// Example: Display user tier
function UserTierDisplay() {
  const { tier, isGuest, isFree, isPremium, isLoading } = useUserTier();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>User Tier</Text>
      <Text style={styles.text}>Current Tier: {tier?.toUpperCase()}</Text>

      {isGuest && <Text style={styles.text}>👤 Guest User</Text>}
      {isFree && <Text style={styles.text}>🆓 Free User</Text>}
      {isPremium && <Text style={styles.text}>⭐ Premium User</Text>}
    </View>
  );
}

// Example: Premium-gated feature
function PremiumFeature() {
  const { isPremium, isLoading } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!isPremium) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Premium Feature 🔒</Text>
        <Text style={styles.text}>
          This feature requires a premium subscription
        </Text>
        <Button title="Upgrade to Premium" onPress={() => setShowPaywall(true)} />

        <PaywallModal
          isVisible={showPaywall}
          onClose={() => setShowPaywall(false)}
          config={{
            title: 'Unlock Premium',
            description: 'Get unlimited access to all features',
            features: [
              { icon: '⭐', text: 'Unlimited credits' },
              { icon: '🚀', text: 'AI-powered tools' },
              { icon: '🛡️', text: 'Ad-free experience' },
            ],
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Premium Feature ⭐</Text>
      <Text style={styles.text}>
        Congratulations! You have access to this premium feature.
      </Text>
    </View>
  );
}

// Example: Credit-based feature
function CreditFeature() {
  const { credits, hasCredits, consumeCredit } = useCredits();
  const [message, setMessage] = useState('');

  const handleUseFeature = async () => {
    if (!hasCredits || credits < 5) {
      setMessage('❌ Not enough credits. You need 5 credits.');
      return;
    }

    const result = await consumeCredit({
      amount: 5,
      reason: 'feature_usage',
      metadata: { featureId: 'ai_generation' },
    });

    if (result.success) {
      setMessage(`✅ Success! Credits remaining: ${result.newBalance}`);
    } else {
      setMessage(`❌ Error: ${result.error?.message}`);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Credit-Based Feature 💰</Text>
      <Text style={styles.text}>Your Credits: {credits}</Text>
      <Button title="Use Feature (5 credits)" onPress={handleUseFeature} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

// Example: Settings screen with subscription details
function SettingsScreen() {
  const { subscription, isLoading, refetch } = usePremium();

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Settings ⚙️</Text>

      {isLoading ? (
        <ActivityIndicator />
      ) : subscription?.isPremium ? (
        <>
          <PremiumDetailsCard
            status={subscription}
            onManagePress={() => console.log('Manage subscription')}
          />
          <Button title="Refresh Status" onPress={handleRefresh} />
        </>
      ) : (
        <Button title="Upgrade to Premium" onPress={() => console.log('Show paywall')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default App;
