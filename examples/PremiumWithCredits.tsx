/**
 * Premium with Credits Example
 *
 * This example shows how to implement features that work with either
 * premium subscription OR credits
 */

import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import {
  usePremiumWithCredits,
  useCreditsGate,
  useUserTier,
} from '@umituz/react-native-subscription';

function HybridFeature() {
  const { tier, isPremium } = useUserTier();

  // Premium OR credits feature
  const { isPremium, hasCredits, credits, consumeCredit, isLoading } =
    usePremiumWithCredits({
      creditCost: 1,
      featureId: 'ai_generation',
    });

  const handleGenerate = async () => {
    if (isPremium) {
      // Premium users have unlimited access
      Alert.alert('Success', 'Generating content (unlimited)');
      await generateContent();
    } else if (hasCredits) {
      // Free users use credits
      const result = await consumeCredit();
      if (result.success) {
        Alert.alert('Success', `Content generated! Credits: ${result.newBalance}`);
        await generateContent();
      } else {
        Alert.alert('Error', result.error?.message || 'Failed to consume credit');
      }
    } else {
      // No credits: show purchase prompt
      Alert.alert(
        'Insufficient Credits',
        'You need credits to use this feature. Purchase credits or upgrade to Premium.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Purchase Credits', onPress: () => showCreditPurchase() },
          { text: 'Upgrade to Premium', onPress: () => showPaywall() },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Content Generator</Text>
        <Text style={styles.subtitle}>Tier: {tier?.toUpperCase()}</Text>
      </View>

      <View style={styles.creditsInfo}>
        {isPremium ? (
          <Text style={styles.unlimited}>✨ Unlimited Access</Text>
        ) : (
          <Text style={styles.credits}>💰 Credits: {credits}</Text>
        )}
      </View>

      <Button
        onPress={handleGenerate}
        title={isPremium ? 'Generate (Unlimited)' : 'Generate (1 credit)'}
        disabled={isLoading}
      />

      <View style={styles.info}>
        <Text style={styles.infoText}>
          {isPremium
            ? 'As a Premium user, you have unlimited access to this feature.'
            : 'Each generation costs 1 credit. Upgrade to Premium for unlimited access.'}
        </Text>
      </View>
    </View>
  );
}

// Credit-gated feature example
function CreditOnlyFeature() {
  const { hasCredits, credits, consumeCredit, isLoading, showPurchasePrompt } =
    useCreditsGate({
      creditCost: 5,
      featureId: 'export',
    });

  const handleExport = async () => {
    if (!hasCredits) {
      showPurchasePrompt();
      return;
    }

    const result = await consumeCredit();
    if (result.success) {
      Alert.alert('Success', `Data exported! Credits remaining: ${result.newBalance}`);
      await exportData();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Data</Text>
      <Text style={styles.credits}>Credits: {credits}</Text>
      <Button
        onPress={handleExport}
        title={`Export Data (5 credits)`}
        disabled={isLoading || !hasCredits}
      />
    </View>
  );
}

// Multiple credit tiers
function TieredCreditsFeature() {
  const { credits } = useCredits();

  const getCreditCost = (feature: string) => {
    switch (feature) {
      case 'basic':
        return 1;
      case 'advanced':
        return 5;
      case 'premium':
        return 10;
      default:
        return 1;
    }
  };

  const canAfford = (cost: number) => credits >= cost;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Tiers</Text>
      <Text style={styles.credits}>Your Credits: {credits}</Text>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>Basic Feature</Text>
          <Text style={styles.featureCost}>1 credit</Text>
          <Button
            title="Use"
            disabled={!canAfford(1)}
            onPress={() => console.log('Use basic feature')}
          />
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureTitle}>Advanced Feature</Text>
          <Text style={styles.featureCost}>5 credits</Text>
          <Button
            title="Use"
            disabled={!canAfford(5)}
            onPress={() => console.log('Use advanced feature')}
          />
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureTitle}>Premium Feature</Text>
          <Text style={styles.featureCost}>10 credits</Text>
          <Button
            title="Use"
            disabled={!canAfford(10)}
            onPress={() => console.log('Use premium feature')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  creditsInfo: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  credits: {
    fontSize: 18,
    color: '#666',
  },
  unlimited: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  info: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
  },
  features: {
    gap: 16,
  },
  feature: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureCost: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export { HybridFeature, CreditOnlyFeature, TieredCreditsFeature };
