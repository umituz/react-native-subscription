# PaywallFeedbackModal Component

Modal component for collecting user feedback after paywall dismissal.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/components/feedback/PaywallFeedbackModal.tsx`

**Type**: Component

## Strategy

### Feedback Collection Flow

1. **Trigger Display**: Show modal after paywall dismissal
2. **Feedback Options**: Provide multiple feedback options
3. **Reason Capture**: Allow users to select reason for not upgrading
4. **Comment Input**: Optional text input for detailed feedback
5. **Submission**: Handle feedback submission
6. **Analytics**: Track feedback for optimization

### Integration Points

- **PaywallModal**: Trigger after paywall close
- **Analytics Service**: Track feedback responses
- **Backend API**: Submit feedback to server
- **usePaywall**: For paywall state management

## Restrictions

### REQUIRED

- **Visible Control**: MUST control visibility via prop
- **Callback Handling**: MUST implement onFeedbackSubmit callback
- **Close Handler**: MUST provide close mechanism
- **Feedback Options**: MUST provide clear feedback options

### PROHIBITED

- **NEVER** show modal automatically (user-triggered only)
- **NEVER** make feedback mandatory
- **DO NOT** show too frequently (respect user experience)
- **DO NOT** require personal information

### CRITICAL SAFETY

- **ALWAYS** make feedback optional
- **MUST** provide clear close option
- **ALWAYS** keep feedback anonymous by default
- **NEVER** collect sensitive information

## AI Agent Guidelines

### When Implementing Feedback Modals

1. **Always** make feedback optional
2. **Always** provide clear close button
3. **Always** keep feedback options concise
4. **Always** handle feedback submission gracefully
5. **Never** show modal too frequently

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Control visibility via isVisible prop
- [ ] Implement onFeedbackSubmit callback
- [ ] Provide onClose callback
- [ ] Keep feedback options concise (3-5 options)
- [ ] Make feedback optional
- [ ] Handle submission errors
- [ ] Test with various feedback selections
- [ ] Test close behavior
- [ ] Verify analytics tracking

### Common Patterns

1. **Post-Paywall**: Show after paywall dismissal
2. **Anonymous Feedback**: Keep feedback anonymous
3. **Simple Options**: Provide 3-5 quick options
4. **Optional Comment**: Allow optional detailed feedback
5. **Analytics Integration**: Track feedback for insights

## Related Documentation

- **PaywallModal**: Paywall modal component
- **usePaywall**: Paywall state management
- **Feedback README**: `./README.md`
- **Paywall README**: `../paywall/README.md`
