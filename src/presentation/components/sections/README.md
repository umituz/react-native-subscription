# Sections Components

Subscription-related section and card components.

## Location

- **Base Path**: `/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/presentation/components/sections/`
- **Components**: `src/presentation/components/sections/`

## Strategy

### Section Components

Organized sections for subscription information display.

- **SubscriptionSection**: Subscription status and management section
- **Status Display**: Clear status indicators
- **Action Buttons**: Management and upgrade actions
- **Navigation Support**: Deep linking to detail screens

### Display Features

Comprehensive subscription information display.

- **Status Indicators**: Active/inactive status display
- **Expiration Dates**: Date formatting and display
- **Management Actions**: Subscription management buttons
- **Upgrade Options**: Premium upgrade prompts

### Interaction Design

User-friendly interaction patterns.

- **Press Actions**: Navigation to detail screens
- **Long Press**: Quick management options
- **Status-Based UI**: Different UI for different subscription states
- **Refresh Support**: Pull-to-refresh capabilities

### Customization

Flexible styling and behavior.

- **Custom Actions**: Custom action handlers
- **Style Props**: Custom styling support
- **Translation Support**: Multi-language support
- **Conditional Display**: Show/hide elements based on state

## Restrictions

### REQUIRED

- **Status Clarity**: Status must be clearly visible
- **Action Buttons**: Provide appropriate action buttons
- **Loading States**: Show loading indicators
- **Error Handling**: Handle errors gracefully

### PROHIBITED

- **Hardcoded Text**: All text must support translations
- **Missing Actions**: Never omit necessary actions
- **Ambiguous Status**: Status must be unambiguous
- **Blocking UI**: Never block app navigation

### CRITICAL

- **Deep Links**: Include management deep links
- **State Accuracy**: Display accurate subscription state
- **User Actions**: Provide clear action options
- **Platform Links**: Correct platform-specific management links

## AI Agent Guidelines

### When Modifying Section Components

1. **Component Interface**: Maintain consistent prop interfaces
2. **State Handling**: Proper state management
3. **Translations**: Ensure translation support
4. **Accessibility**: Include accessibility features

### When Adding Section Features

1. **Pattern Consistency**: Follow existing patterns
2. **Type Safety**: Define TypeScript types
3. **Documentation**: Document props and usage
4. **Testing**: Test with different subscription states

### When Fixing Section Component Bugs

1. **State Display**: Check state display logic
2. **Actions**: Verify action handlers
3. **Navigation**: Test navigation flows
4. **Edge Cases**: Test with null/undefined states

## Related Documentation

- [Details Components](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/presentation/components/details/README.md)
- [Feedback Components](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/presentation/components/feedback/README.md)
- [Presentation Components](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/presentation/components/README.md)
- [Paywall Domain](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domains/paywall/README.md)
