# PaywallFeedbackModal Component

Modal for collecting user feedback when declining paywall/subscription.

## Import

```typescript
import { PaywallFeedbackModal } from '@umituz/react-native-subscription';
```

## Signature

```typescript
interface PaywallFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title?: string;
  subtitle?: string;
  submitText?: string;
  otherPlaceholder?: string;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | **Required** | Modal visibility |
| `onClose` | `() => void` | **Required** | Close handler |
| `onSubmit` | `(reason: string) => void` | **Required** | Submit feedback handler |
| `title` | `string` | `t('paywall.feedback.title')` | Modal title |
| `subtitle` | `string` | `t('paywall.feedback.subtitle')` | Modal subtitle |
| `submitText` | `string` | `t('paywall.feedback.submit')` | Submit button text |
| `otherPlaceholder` | `string` | `t('paywall.feedback.otherPlaceholder')` | Other text input placeholder |

## Basic Usage

```typescript
function PaywallScreen() {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleClose = () => {
    setShowFeedback(true);
  };

  const handleSubmitFeedback = (reason: string) => {
    analytics.track('paywall_feedback', { reason });
    setShowFeedback(false);
    navigation.goBack();
  };

  return (
    <View>
      <PaywallContent onClose={handleClose} />

      <PaywallFeedbackModal
        visible={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleSubmitFeedback}
      />
    </View>
  );
}
```

## Advanced Usage

### With Custom Content

```typescript
function CustomFeedbackModal() {
  const [visible, setVisible] = useState(false);

  return (
    <PaywallFeedbackModal
      visible={visible}
      onClose={() => setVisible(false)}
      onSubmit={(reason) => {
        console.log('Feedback:', reason);
        setVisible(false);
      }}
      title="Help Us Improve"
      subtitle="Why are you not upgrading today?"
      submitText="Send Feedback"
      otherPlaceholder="Please tell us more..."
    />
  );
}
```

### With Analytics Tracking

```typescript
function TrackedFeedbackModal() {
  const [visible, setVisible] = useState(false);
  const [paywallTrigger] = useState('premium_feature');

  const handleSubmit = (reason: string) => {
    analytics.track('paywall_decline_feedback', {
      reason,
      trigger: paywallTrigger,
      timestamp: Date.now(),
    });

    // Send to backend
    api.trackFeedback({
      type: 'paywall_decline',
      reason,
      context: { trigger: paywallTrigger },
    });

    setVisible(false);
  };

  return (
    <PaywallFeedbackModal
      visible={visible}
      onClose={() => setVisible(false)}
      onSubmit={handleSubmit}
    />
  );
}
```

### With Conditional Display

```typescript
function ConditionalFeedback() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasSeenFeedback, setHasSeenFeedback] = useState(false);

  const handleClose = () => {
    // Only show feedback if user hasn't seen it recently
    const lastSeen = await AsyncStorage.getItem('last_feedback_date');
    const daysSinceLastSeen = lastSeen
      ? (Date.now() - parseInt(lastSeen)) / (1000 * 60 * 60 * 24)
      : Infinity;

    if (daysSinceLastSeen > 30) {
      setShowFeedback(true);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async (reason: string) => {
    await AsyncStorage.setItem('last_feedback_date', Date.now().toString());
    setShowFeedback(false);
    navigation.goBack();
  };

  return (
    <PaywallFeedbackModal
      visible={showFeedback}
      onClose={() => setShowFeedback(false)}
      onSubmit={handleSubmit}
    />
  );
}
```

## Feedback Options

The modal includes these predefined options:

1. **too_expensive** - "Too expensive"
2. **no_need** - "Don't need it right now"
3. **trying_out** - "Just trying out the app"
4. **technical_issues** - "Technical issues"
5. **other** - "Other" (with text input)

## Examples

### Complete Paywall with Feedback

```typescript
function CompletePaywallFlow() {
  const [showFeedback, setShowFeedback] = useState(false);

  const handlePaywallClose = () => {
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = (reason: string) => {
    // Track feedback
    analytics.track('paywall_feedback_submitted', { reason });

    // Send to backend
    fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        type: 'paywall_decline',
        reason,
        userId: user?.uid,
        timestamp: Date.now(),
      }),
    });

    setShowFeedback(false);
    navigation.goBack();
  };

  const handleFeedbackSkip = () => {
    analytics.track('paywall_feedback_skipped');
    setShowFeedback(false);
    navigation.goBack();
  };

  return (
    <View>
      <PaywallScreen onClose={handlePaywallClose} />

      <PaywallFeedbackModal
        visible={showFeedback}
        onClose={handleFeedbackSkip}
        onSubmit={handleFeedbackSubmit}
        title="Help Us Improve"
        subtitle="Why are you not upgrading today?"
        submitText="Send Feedback"
        otherPlaceholder="Tell us more (optional)"
      />
    </View>
  );
}
```

### With A/B Testing

```typescript
function ABTestedFeedback() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [variant, setVariant] = useState<'short' | 'long'>('short');

  useEffect(() => {
    // Determine A/B test variant
    const testVariant = await getABTestVariant('paywall_feedback');
    setVariant(testVariant);
  }, []);

  return (
    <PaywallFeedbackModal
      visible={showFeedback}
      onClose={() => setShowFeedback(false)}
      onSubmit={(reason) => {
        analytics.track('paywall_feedback', {
          reason,
          variant,
          abTest: 'paywall_feedback_v1',
        });
        setShowFeedback(false);
      }}
      title={
        variant === 'short'
          ? 'Quick Feedback'
          : 'Help Us Improve Our Premium'
      }
      subtitle={
        variant === 'short'
          ? 'Why not today?'
          : 'We\'d love to know why you\'re not upgrading'
      }
      submitText={
        variant === 'short'
          ? 'Send'
          : 'Submit Feedback'
      }
    />
  );
}
```

## Modal Layout

```
┌─────────────────────────────────┐
│                                 │
│     Help Us Improve             │
│  Why are you not upgrading?     │
│                                 │
├─────────────────────────────────┤
│ ○ Too expensive                │
│ ○ Don't need it right now      │
│ ○ Just trying out the app      │
│ ○ Technical issues             │
│ ○ Other                        │
│                                 │
│   [Text input for Other]        │
│                                 │
├─────────────────────────────────┤
│        [Send Feedback]          │
└─────────────────────────────────┘
```

## Best Practices

1. **Track feedback** - Send analytics with feedback data
2. **Show sparingly** - Don't overwhelm users with feedback requests
3. **Keep optional** - Allow users to skip feedback
4. **Use data wisely** - Analyze feedback to improve paywall
5. **Test timing** - Find optimal moment to show feedback
6. **Localize content** - Translate all strings for i18n
7. **Keep simple** - Don't ask for too much information

## Related Hooks

- **usePaywallFeedback** - Hook for feedback logic
- **usePaywall** - For paywall state management
- **usePaywallVisibility** - For paywall visibility

## See Also

- [Paywall Screen](../../screens/README.md)
- [Feedback Utilities](../../hooks/feedback/usePaywallFeedback.md)
