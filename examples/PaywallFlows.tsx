/**
 * Paywall Flows Examples
 *
 * Different paywall implementation patterns and flows
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  usePaywall,
  usePaywallActions,
  usePaywallVisibility,
  PaywallModal,
  usePremium,
} from '@umituz/react-native-subscription';

// Example 1: Basic Paywall Flow
function BasicPaywallFlow() {
  const { isPremium } = usePremium();
  const { showPaywall, hidePaywall, isPaywallVisible } = usePaywall();

  const handleUpgradeClick = () => {
    showPaywall({
      trigger: 'upgrade_button',
      featureId: 'premium_features',
    });
  };

  const handlePurchaseComplete = () => {
    hidePaywall();
    // Navigate to premium content
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Basic Paywall</Text>

      {isPremium ? (
        <View style={styles.content}>
          <Text style={styles.success}>✨ Premium Active!</Text>
          <Text>You have access to all features</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Button
            onPress={handleUpgradeClick}
            title="Upgrade to Premium"
            color="#FF6B6B"
          />

          <PaywallModal
            isVisible={isPaywallVisible}
            onClose={hidePaywall}
            config={{
              title: 'Unlock Premium',
              description: 'Get unlimited access to all features',
              features: [
                { icon: '⭐', text: 'Unlimited Access' },
                { icon: '🚀', text: 'AI-Powered Tools' },
                { icon: '🛡️', text: 'Ad-Free Experience' },
              ],
            }}
            onPurchase={handlePurchaseComplete}
          />
        </View>
      )}
    </View>
  );
}

// Example 2: Trigger-Based Paywall
function TriggeredPaywall() {
  const { isPremium } = usePremium();
  const [actionCount, setActionCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleFeatureAction = () => {
    if (isPremium) {
      // Execute feature
      console.log('Feature executed');
    } else {
      // Increment action count
      setActionCount(prev => prev + 1);

      // Show paywall after 3 actions
      if (actionCount + 1 >= 3) {
        setShowPaywall(true);
      } else {
        // Show warning
        alert(
          `Free Action ${actionCount + 1}/3`,
          `Upgrade to Premium for unlimited access (${3 - actionCount - 1} free actions left)`
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Triggered Paywall</Text>
      <Text style={styles.subtitle}>
        Actions used: {actionCount}/3
      </Text>

      <Button
        onPress={handleFeatureAction}
        title="Use Feature"
        disabled={isPremium}
      />

      <PaywallModal
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
        config={{
          title: 'Free Limit Reached',
          description: `You've used ${actionCount} free actions. Upgrade for unlimited access!`,
          features: [
            { icon: '∞', text: 'Unlimited Actions' },
            { icon: '⚡', text: 'Priority Support' },
          ],
        }}
      />
    </View>
  );
}

// Example 3: Time-Delayed Paywall
function DelayedPaywall() {
  const { isPremium } = usePremium();
  const [sessionTime, setSessionTime] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Show paywall after 30 seconds
    const timer = setTimeout(() => {
      if (!isPremium) {
        setShowPaywall(true);
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isPremium]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timed Paywall</Text>
      <Text style={styles.subtitle}>
        Session time: {formatTime(sessionTime)}
      </Text>

      {!isPremium && sessionTime < 30 && (
        <Text>Paywall showing in {30 - sessionTime} seconds...</Text>
      )}

      <PaywallModal
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
        config={{
          title: 'Enjoying the App?',
          description: 'Upgrade to Premium to continue using all features',
          features: [
            { icon: '🎯', text: 'Full Access' },
            { icon: '💎', text: 'Premium Content' },
          ],
        }}
      />
    </View>
  );
}

// Example 4: Custom Paywall with Package Selection
function CustomPaywallWithPackages() {
  const { packages, selectedPackage, selectPackage, handlePurchase, isLoading } =
    usePaywallActions();
  const [isVisible, setIsVisible] = useState(false);

  const popularPackage = packages.find(pkg =>
    pkg.identifier.includes('annual')
  );

  return (
    <View style={styles.container}>
      <Button
        onPress={() => setIsVisible(true)}
        title="View Plans"
        color="#FF6B6B"
      />

      {isVisible && (
        <ScrollView style={styles.customPaywall}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>Cancel anytime</Text>
          </View>

          {packages.map(pkg => {
            const isPopular = pkg.identifier === popularPackage?.identifier;
            const isSelected = selectedPackage?.identifier === pkg.identifier;

            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[
                  styles.packageCard,
                  isSelected && styles.packageCardSelected,
                  isPopular && styles.packageCardPopular,
                ]}
                onPress={() => selectPackage(pkg)}
              >
                {isPopular && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>MOST POPULAR</Text>
                  </View>
                )}

                <Text style={styles.packageName}>
                  {pkg.identifier.includes('monthly')
                    ? 'Monthly'
                    : pkg.identifier.includes('annual')
                    ? 'Annual'
                    : 'Lifetime'}
                </Text>

                <Text style={styles.packagePrice}>
                  {pkg.product.priceString}
                </Text>

                {pkg.packageType !== 'LIFETIME' && (
                  <Text style={styles.packagePeriod}>
                    {pkg.identifier.includes('monthly')
                      ? '/month'
                      : '/year'}
                  </Text>
                )}

                {isPopular && (
                  <Text style={styles.savings}>
                    Save 33% compared to monthly
                  </Text>
                )}

                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <Button
            onPress={async () => {
              const result = await handlePurchase();
              if (result.success) {
                setIsVisible(false);
                Alert.alert('Success', 'Welcome to Premium!');
              }
            }}
            disabled={!selectedPackage || isLoading}
            title={isLoading ? 'Processing...' : 'Subscribe Now'}
            color="#FF6B6B"
          />

          <Button
            onPress={() => setIsVisible(false)}
            title="Maybe Later"
            color="#999"
          />
        </ScrollView>
      )}
    </View>
  );
}

// Example 5: A/B Test Paywall Variants
function ABTestedPaywall() {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const { isPremium, isPaywallVisible, showPaywall, hidePaywall } = usePaywall();

  useEffect(() => {
    // Randomly assign variant (in production, use Remote Config)
    setVariant(Math.random() > 0.5 ? 'A' : 'B');
  }, []);

  if (variant === 'A') {
    return (
      <PaywallVariantA
        isVisible={isPaywallVisible}
        onClose={hidePaywall}
      />
    );
  }

  return (
    <PaywallVariantB
      isVisible={isPaywallVisible}
      onClose={hidePaywall}
    />
  );
}

function PaywallVariantA({ isVisible, onClose }: any) {
  return (
    <PaywallModal
      isVisible={isVisible}
      onClose={onClose}
      config={{
        title: 'Unlock Premium',
        description: 'Get unlimited access to all features',
        features: [
          { icon: '⭐', text: 'Unlimited Access' },
          { icon: '🚀', text: 'AI-Powered Tools' },
          { icon: '🛡️', text: 'Ad-Free Experience' },
        ],
      }}
    />
  );
}

function PaywallVariantB({ isVisible, onClose }: any) {
  return (
    <PaywallModal
      isVisible={isVisible}
      onClose={onClose}
      config={{
        title: 'Join Thousands of Users',
        description: 'See why our users love Premium',
        features: [
          { icon: '💎', text: 'Premium Content' },
          { icon: '⚡', text: 'Faster Processing' },
          { icon: '💬', text: 'Priority Support' },
          { icon: '🎁', text: 'Exclusive Features' },
        ],
      }}
    />
  );
}

// Example 6: Paywall with Free Trial
function PaywallWithTrial() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <View style={styles.container}>
      <Button
        onPress={() => setShowPaywall(true)}
        title="Start Free Trial"
        color="#4CAF50"
      />

      <PaywallModal
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
        config={{
          title: '7-Day Free Trial',
          description: 'Try Premium risk-free',
          features: [
            { icon: '🎁', text: '7 days free, then $9.99/month' },
            { icon: '❌', text: 'Cancel anytime during trial' },
            { icon: '✓', text: 'No charge until trial ends' },
          ],
        }}
      />
    </View>
  );
}

// Example 7: Dismissible vs Non-Dismissible Paywall
function DismissiblePaywall() {
  const [showPaywall, setShowPaywall] = useState(false);
  const [allowDismiss, setAllowDismiss] = useState(true);

  return (
    <View style={styles.container}>
      <Button
        onPress={() => setShowPaywall(true)}
        title="Show Paywall"
      />

      <PaywallModal
        isVisible={showPaywall}
        onClose={allowDismiss ? () => setShowPaywall(false) : undefined}
        closeOnBackdropPress={allowDismiss}
        showCloseButton={allowDismiss}
        config={{
          title: 'Premium Required',
          description: allowDismiss
            ? 'You can close this, but why would you want to?'
            : 'You must subscribe to continue',
          features: [
            { icon: '⭐', text: 'Premium Feature 1' },
            { icon: '⭐', text: 'Premium Feature 2' },
          ],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  success: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  customPaywall: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  packageCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageCardSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff',
  },
  packageCardPopular: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  packagePeriod: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  savings: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  checkmark: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export {
  BasicPaywallFlow,
  TriggeredPaywall,
  DelayedPaywall,
  CustomPaywallWithPackages,
  ABTestedPaywall,
  PaywallWithTrial,
  DismissiblePaywall,
};
