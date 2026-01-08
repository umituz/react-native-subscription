/**
 * Analytics Integration Examples
 *
 * How to integrate analytics tracking with subscription events
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import analytics from '@react-native-firebase/analytics';
import {
  usePremium,
  usePaywallFeedback,
  usePaywallActions,
  useCredits,
} from '@umituz/react-native-subscription';

// Example 1: Basic Analytics Tracking
function AnalyticsWrapper() {
  const { isPremium, subscription } = usePremium();

  useEffect(() => {
    // Track subscription status change
    analytics().setUserId('user-123');

    analytics().logEvent('subscription_status', {
      is_premium: isPremium,
      subscription_type: subscription?.type,
      is_active: subscription?.isActive,
    });
  }, [isPremium, subscription]);

  return <YourAppContent />;
}

// Example 2: Custom Analytics Service
class SubscriptionAnalytics {
  private analytics: any;

  constructor() {
    this.analytics = analytics;
  }

  // Track paywall impression
  trackPaywallImpression(source: string, context?: any) {
    this.analytics.logEvent('paywall_impression', {
      source,
      timestamp: Date.now(),
      ...context,
    });
  }

  // Track purchase attempt
  trackPurchaseAttempt(packageId: string, revenue: number) {
    this.analytics.logEvent('purchase_attempted', {
      package_id: packageId,
      revenue,
      currency: 'USD',
    });
  }

  // Track purchase success
  trackPurchaseSuccess(
    packageId: string,
    revenue: number,
    transactionId: string
  ) {
    this.analytics.logEvent('purchase_completed', {
      package_id: packageId,
      revenue,
      transaction_id: transactionId,
    });

    // Also log revenue with Firebase
    this.analytics().logPurchase({
      value: revenue,
      currency: 'USD',
      transaction_id: transactionId,
    });
  }

  // Track purchase failure
  trackPurchaseFailure(packageId: string, error: string) {
    this.analytics.logEvent('purchase_failed', {
      package_id: packageId,
      error,
    });
  }

  // Track paywall dismissal
  trackPaywallDismissal(source: string, duration: number) {
    this.analytics.logEvent('paywall_dismissed', {
      source,
      duration_seconds: duration,
    });
  }

  // Track feature access
  trackFeatureAccess(featureId: string, method: 'premium' | 'credits') {
    this.analytics.logEvent('feature_accessed', {
      feature_id: featureId,
      method,
    });
  }

  // Track credit consumption
  trackCreditConsumption(
    amount: number,
    reason: string,
    remaining: number
  ) {
    this.analytics.logEvent('credits_consumed', {
      amount,
      reason,
      remaining_balance: remaining,
    });
  }

  // Track upgrade button click
  trackUpgradeClick(location: string, context?: any) {
    this.analytics.logEvent('upgrade_clicked', {
      location,
      ...context,
    });
  }
}

// Usage of custom analytics service
const subscriptionAnalytics = new SubscriptionAnalytics();

function PaywallWithAnalytics() {
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallShownAt, setPaywallShownAt] = useState<Date | null>(null);

  const handleShowPaywall = (source: string) => {
    subscriptionAnalytics.trackUpgradeClick(source);
    subscriptionAnalytics.trackPaywallImpression(source);
    setPaywallShownAt(new Date());
    setShowPaywall(true);
  };

  const handleClose = () => {
    if (paywallShownAt) {
      const duration = (Date.now() - paywallShownAt.getTime()) / 1000;
      subscriptionAnalytics.trackPaywallDismissal('upgrade_button', duration);
    }
    setShowPaywall(false);
  };

  const handlePurchase = async (pkg: Package) => {
    subscriptionAnalytics.trackPurchaseAttempt(pkg.identifier, pkg.product.price);

    const result = await purchasePackage(pkg);

    if (result.success) {
      subscriptionAnalytics.trackPurchaseSuccess(
        pkg.identifier,
        pkg.product.price,
        result.transactionId
      );
    } else {
      subscriptionAnalytics.trackPurchaseFailure(
        pkg.identifier,
        result.error?.message || 'Unknown error'
      );
    }

    return result;
  };

  return (
    <PaywallModal
      isVisible={showPaywall}
      onClose={handleClose}
      onPurchase={handlePurchase}
    />
  );
}

// Example 3: A/B Test Analytics
function ABTestedPaywall() {
  const [variant, setVariant] = useState<'A' | 'B'>('A');

  useEffect(() => {
    // Track which variant user sees
    analytics().logEvent('paywall_variant_viewed', {
      variant,
    });
  }, [variant]);

  const handlePurchase = async (result: PurchaseResult) => {
    if (result.success) {
      // Track conversion by variant
      analytics().logEvent('paywall_converted', {
        variant,
        revenue: result.revenue,
      });
    }
  };

  return variant === 'A' ? (
    <PaywallVariantA onPurchase={handlePurchase} />
  ) : (
    <PaywallVariantB onPurchase={handlePurchase} />
  );
}

// Example 4: Funnel Analytics
function SubscriptionFunnel() {
  const { isPremium } = usePremium();
  const [funnelStep, setFunnelStep] = useState(1);

  useEffect(() => {
    // Track funnel steps
    analytics().logEvent('funnel_step', {
      step: funnelStep,
      screen: 'SubscriptionFunnel',
    });

    // Track funnel completion
    if (isPremium && funnelStep === 5) {
      analytics().logEvent('funnel_completed', {
        total_steps: funnelStep,
        time_to_complete: Date.now() - startTime,
      });
    }
  }, [funnelStep, isPremium]);

  const advanceFunnel = () => {
    setFunnelStep(prev => prev + 1);
  };

  return (
    <View>
      {funnelStep === 1 && <Step1 onNext={advanceFunnel} />}
      {funnelStep === 2 && <Step2 onNext={advanceFunnel} />}
      {/* ... */}
    </View>
  );
}

// Example 5: Revenue Analytics
function RevenueTracker() {
  const trackRevenue = async (
    type: 'subscription' | 'credits',
    amount: number,
    currency: string
  ) => {
    await analytics().logEvent('revenue', {
      type,
      amount,
      currency,
    });

    // Also track with Adjust, AppsFlyer, etc.
    if (type === 'subscription') {
      Adjust.trackEvent({
        eventToken: 'subscription_purchase',
        revenue: amount,
        currency,
      });
    }
  };

  return <RevenueTrackerComponent onRevenue={trackRevenue} />;
}

// Example 6: Cohort Analytics
function CohortTracker() {
  useEffect(() => {
    // Track user cohort
    const cohort = getUserCohort(); // e.g., 'organic', 'paid', 'referral'

    analytics().setUserProperty('cohort', cohort);

    // Track subscription by cohort
    if (isPremium) {
      analytics().logEvent('cohort_conversion', {
        cohort,
        time_to_conversion: getDaysSinceInstall(),
      });
    }
  }, [isPremium]);

  return null;
}

// Example 7: Feature Usage Analytics
function FeatureUsageTracker() {
  const { isPremium } = usePremium();
  const { credits } = useCredits();

  const trackFeatureUsage = (featureId: string) => {
    analytics().logEvent('feature_used', {
      feature_id: featureId,
      access_method: isPremium ? 'subscription' : 'credits',
      user_tier: isPremium ? 'premium' : 'free',
      credits_remaining: credits,
    });
  };

  return (
    <FeatureButton
      featureId="ai_generation"
      onPress={() => trackFeatureUsage('ai_generation')}
    />
  );
}

// Example 8: Retention Analytics
function RetentionTracker() {
  useEffect(() => {
    // Track daily/weekly active users
    const trackRetention = async () => {
      const lastActive = await getLastActiveDate();
      const daysSinceActive = getDaysBetween(lastActive, new Date());

      if (daysSinceActive === 1) {
        analytics().logEvent('retention_day_1');
      } else if (daysSinceActive === 7) {
        analytics().logEvent('retention_day_7');
      } else if (daysSinceActive === 30) {
        analytics().logEvent('retention_day_30');
      }
    };

    trackRetention();
  }, []);

  return null;
}

// Example 9: Churn Analytics
function ChurnPredictor() {
  const { subscription } = usePremium();

  useEffect(() => {
    if (subscription?.isActive === false) {
      // Track churn
      analytics().logEvent('user_churned', {
        subscription_type: subscription.type,
        last_active: subscription.expirationDate,
        days_since_expiry: getDaysSince(subscription.expirationDate),
      });

      // Predict churn likelihood
      const churnRisk = calculateChurnRisk(subscription);
      analytics().setUserProperty('churn_risk', churnRisk.toString());
    }
  }, [subscription]);

  return null;
}

// Example 10: Lifetime Value (LTV) Analytics
function LTVTracker() {
  const trackLifetimeValue = async (userId: string) => {
    // Get user's total purchases
    const purchases = await getUserPurchases(userId);
    const totalRevenue = purchases.reduce((sum, p) => sum + p.revenue, 0);

    // Track LTV
    analytics().logEvent('ltv_updated', {
      user_id: userId,
      lifetime_value: totalRevenue,
      purchase_count: purchases.length,
      days_since_first_purchase: getDaysSince(purchases[0].date),
    });

    // Set user property
    analytics().setUserProperty('ltv', totalRevenue.toString());
  };

  return null;
}

export {
  SubscriptionAnalytics,
  subscriptionAnalytics,
  PaywallWithAnalytics,
  ABTestedPaywall,
  SubscriptionFunnel,
  RevenueTracker,
  CohortTracker,
  FeatureUsageTracker,
  RetentionTracker,
  ChurnPredictor,
  LTVTracker,
};
