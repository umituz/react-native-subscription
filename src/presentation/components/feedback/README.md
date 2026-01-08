# Feedback Components

Kullanıcı etkileşimi ve feedback için UI bileşenleri.

## Bileşenler

- [PaywallFeedbackModal](#paywallfeedbackmodal) - Paywall feedback modal'ı

## PaywallFeedbackModal

Kullanıcıların paywall deneyimi hakkında feedback vermeleri için modal bileşeni.

### Kullanım

```typescript
import React, { useState } from 'react';
import { Button } from 'react-native';
import { PaywallFeedbackModal } from '@umituz/react-native-subscription';

function PaywallScreen() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <Button
        onPress={() => setShowFeedback(true)}
        title="Give Feedback"
      />

      <PaywallFeedbackModal
        isVisible={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={(feedback) => {
          console.log('Feedback submitted:', feedback);
          // Analytics tracking
          analytics.track('paywall_feedback', {
            feedback,
            timestamp: new Date().toISOString(),
          });
          setShowFeedback(false);
        }}
        translations={{
          title: 'Tell us why',
          placeholder: 'Share your thoughts...',
          submit: 'Submit',
          cancel: 'Cancel',
        }}
      />
    </>
  );
}
```

### Props

```typescript
interface PaywallFeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  translations?: PaywallFeedbackTranslations;
  placeholder?: string;
  maxLength?: number;
  showRating?: boolean;
}
```

### Özellikler

- Kullanıcı feedback'i toplama
- Özelleştirilebilir çeviri desteği
- Karakter limiti
- Opsiyonel rating sistemi
- Smooth animasyonlar

### Detaylı Kullanım

```typescript
import { PaywallFeedbackModal } from '@umituz/react-native-subscription';

function AdvancedFeedback() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    feedback: '',
  });

  const handleSubmit = (feedback: string) => {
    // Feedback'i kaydet
    saveFeedback({
      ...feedbackData,
      feedback,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
    });

    // Analytics tracking
    analytics.track('paywall_feedback_submitted', {
      rating: feedbackData.rating,
      feedbackLength: feedback.length,
      hasFeedback: feedback.length > 0,
    });

    setShowFeedback(false);
  };

  return (
    <PaywallFeedbackModal
      isVisible={showFeedback}
      onClose={() => setShowFeedback(false)}
      onSubmit={handleSubmit}
      placeholder="Why didn't you subscribe? What can we improve?"
      maxLength={500}
      showRating={true}
      onRatingChange={(rating) => {
        setFeedbackData(prev => ({ ...prev, rating }));
      }}
      translations={{
        title: 'Help us improve',
        placeholder: 'Tell us what you think...',
        submit: 'Submit Feedback',
        cancel: 'Cancel',
        ratingLabels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
      }}
    />
  );
}
```

## Analytics Entegrasyonu

Feedback'i analytics ile takip edin:

```typescript
import { PaywallFeedbackModal } from '@umituz/react-native-subscription';

function PaywallWithTracking() {
  const [showPaywall, setShowPaywall] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [paywallShownAt, setPaywallShownAt] = useState<Date | null>(null);

  // Paywall gösterimini track et
  useEffect(() => {
    if (showPaywall) {
      setPaywallShownAt(new Date());
      analytics.track('paywall_impression', {
        timestamp: new Date().toISOString(),
      });
    }
  }, [showPaywall]);

  const handlePaywallClose = () => {
    // Kullanıcı paywall'ı kapattı
    const duration = paywallShownAt
      ? Date.now() - paywallShownAt.getTime()
      : 0;

    analytics.track('paywall_dismissed', {
      duration,
      timestamp: new Date().toISOString(),
    });

    // Feedback göster (opsiyonel)
    if (duration > 5000) {
      // 5 saniyeden uzun bakmışsa
      setShowFeedback(true);
    }

    setShowPaywall(false);
  };

  const handleFeedbackSubmit = (feedback: string) => {
    analytics.track('paywall_feedback', {
      feedback,
      feedbackLength: feedback.length,
      hasFeedback: feedback.length > 0,
      timestamp: new Date().toISOString(),
    });

    setShowFeedback(false);
  };

  return (
    <>
      <PaywallModal
        isVisible={showPaywall}
        onClose={handlePaywallClose}
      />

      <PaywallFeedbackModal
        isVisible={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
        translations={{
          title: 'Tell us why',
          placeholder: 'Why did you decide not to subscribe?',
          submit: 'Submit',
          cancel: 'Skip',
        }}
      />
    </>
  );
}
```

## Feedback Kategorileri

Farklı feedback senaryoları için:

```typescript
import { PaywallFeedbackModal } from '@umituz/react-native-subscription';

type FeedbackReason =
  | 'too_expensive'
  | 'dont_need_features'
  | 'technical_issues'
  | 'prefer_free'
  | 'other';

function CategorizedFeedback() {
  const [selectedReason, setSelectedReason] = useState<FeedbackReason | null>(null);

  const reasons = [
    { id: 'too_expensive', label: 'Too expensive', icon: '💰' },
    { id: 'dont_need_features', label: "Don't need features", icon: '🤷' },
    { id: 'technical_issues', label: 'Technical issues', icon: '🔧' },
    { id: 'prefer_free', label: 'Prefer free version', icon: '🆓' },
    { id: 'other', label: 'Other', icon: '💬' },
  ];

  return (
    <PaywallFeedbackModal
      isVisible={showFeedback}
      onClose={() => setShowFeedback(false)}
      onSubmit={(feedback) => {
        saveFeedback({
          reason: selectedReason,
          feedback,
          timestamp: new Date().toISOString(),
        });
      }}
      customContent={
        <View>
          <Text>Why didn't you subscribe?</Text>
          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              onPress={() => setSelectedReason(reason.id as FeedbackReason)}
              style={[
                styles.reasonButton,
                selectedReason === reason.id && styles.selected,
              ]}
            >
              <Text>{reason.icon}</Text>
              <Text>{reason.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      }
    />
  );
}
```

## Styling

Özel stiller kullanma:

```typescript
import { paywallFeedbackStyles } from '@umituz/react-native-subscription';

const customStyles = StyleSheet.create({
  modal: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

<PaywallFeedbackModal
  isVisible={showFeedback}
  onClose={handleClose}
  onSubmit={handleSubmit}
  style={customStyles.modal}
  titleStyle={customStyles.title}
  textAreaStyle={customStyles.textArea}
  buttonContainerStyle={customStyles.buttonContainer}
/>
```

## Best Practices

1. **Timing**: Feedback'i doğru zamanda gösterin (paywall'dan hemen sonra)
2. **Optional**: Feedback'i zorunlu yapmayın
3. **Short**: Kullanıcıdan kısa feedback isteyin
4. **Actionable**: Feedback'i ürün geliştirmede kullanın
5. **Privacy**: Kullanıcıya feedback'in nasıl kullanılacağını bildirin
6. **Analytics**: Feedback verilerini analytics ile takip edin
7. **Follow-up**: Ciddi sorunlarda follow-up yapın

## Örnek: Complete Feedback Flow

```typescript
import React, { useState, useEffect } from 'react';
import { View, Button } from 'react-native';
import { PaywallFeedbackModal } from '@umituz/react-native-subscription';

function PaywallWithFeedbackFlow() {
  const [paywallVisible, setPaywallVisible] = useState(true);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [paywallStartTime, setPaywallStartTime] = useState<number>(0);

  // Paywall gösterimini track et
  useEffect(() => {
    if (paywallVisible) {
      setPaywallStartTime(Date.now());
      analytics.track('paywall_shown', {
        timestamp: new Date().toISOString(),
        source: 'upgrade_button',
      });
    }
  }, [paywallVisible]);

  const handlePaywallClose = (result: 'purchased' | 'dismissed') => {
    const duration = Date.now() - paywallStartTime;

    analytics.track('paywall_closed', {
      result,
      duration,
      timestamp: new Date().toISOString(),
    });

    if (result === 'dismissed' && duration > 3000) {
      // 3 saniyeden uzun baktıysa feedback iste
      setFeedbackVisible(true);
    }

    setPaywallVisible(false);
  };

  const handleFeedbackSubmit = (feedback: string) => {
    analytics.track('paywall_feedback_submitted', {
      feedback,
      feedbackLength: feedback.length,
      timestamp: new Date().toISOString(),
    });

    // Optional: Firebase'e kaydet
    if (feedback.trim()) {
      firestore()
        .collection('feedback')
        .add({
          type: 'paywall',
          feedback,
          userId: currentUser?.id,
          timestamp: new Date().toISOString(),
        });
    }

    setFeedbackVisible(false);

    // Teşekkür mesajı göster
    Alert.alert('Thank you!', 'Thanks for your feedback.');
  };

  return (
    <View>
      <Button
        onPress={() => setPaywallVisible(true)}
        title="Show Paywall"
      />

      <PaywallModal
        isVisible={paywallVisible}
        onClose={() => handlePaywallClose('dismissed')}
        onPurchase={() => handlePaywallClose('purchased')}
      />

      <PaywallFeedbackModal
        isVisible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        onSubmit={handleFeedbackSubmit}
        placeholder="What would make this offer better for you?"
        maxLength={300}
        translations={{
          title: 'Quick question',
          placeholder: 'Your feedback helps us improve',
          submit: 'Send Feedback',
          cancel: 'No thanks',
        }}
      />
    </View>
  );
}
```

## Translations

Farklı dillerde destek:

```typescript
const translations = {
  'en': {
    title: 'Tell us why',
    placeholder: 'Share your thoughts...',
    submit: 'Submit',
    cancel: 'Cancel',
  },
  'tr': {
    title: 'Bize nedenlerini söyleyin',
    placeholder: 'Düşüncelerinizi paylaşın...',
    submit: 'Gönder',
    cancel: 'İptal',
  },
  'de': {
    title: 'Sagen Sie uns warum',
    placeholder: 'Teilen Sie uns Ihre Gedanken mit...',
    submit: 'Absenden',
    cancel: 'Abbrechen',
  },
};

<PaywallFeedbackModal
  translations={translations[userLanguage]}
  onSubmit={handleSubmit}
/>
```
