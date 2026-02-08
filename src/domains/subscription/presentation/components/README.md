# Presentation Components

React Native UI components for subscription and paywall features.

## Location

**Directory**: `src/presentation/components/`

**Type**: Component Library

## Strategy

### Component Categories

Components are organized by functionality:

1. **Details Components**
   - CreditRow: Display credit balance and info
   - DetailRow: Generic detail display row
   - PremiumStatusBadge: Visual premium indicator
   - PremiumDetailsCard: Premium subscription details

2. **Feedback Components**
   - PaywallFeedbackModal: User feedback collection
   - Alert components: Warning and info displays

3. **Section Components**
   - SubscriptionSection: Subscription info section
   - CreditsSection: Credits balance section

4. **Paywall Components**
   - PaywallModal: Upgrade/purchase modal
   - Purchase options: Subscription and credit packages

### Design Principles

All components follow these principles:
- **Reusable**: Composable and configurable
- **Typed**: Full TypeScript support
- **Accessible**: WCAG compliant where possible
- **Testable**: Easy to test in isolation
- **Themeable**: Support custom styling

### Integration Points

- **React Native**: Core UI framework
- **Design System**: Shared UI components
- **Localization**: i18n string support
- **Theme**: Custom styling support

## Restrictions

### REQUIRED

- **Props Typing**: All components MUST have TypeScript interfaces
- **Default Props**: MUST provide sensible defaults
- **Accessibility**: MUST implement accessibility labels
- **Responsive**: MUST handle different screen sizes

### PROHIBITED

- **NEVER** hardcode colors or sizes (use theme)
- **NEVER** include business logic in components
- **DO NOT** make direct API calls
- **NEVER** hardcode strings (use localization)

### CRITICAL SAFETY

- **ALWAYS** validate props before rendering
- **ALWAYS** handle loading and error states
- **NEVER** trust user input for security decisions
- **MUST** implement proper error boundaries
- **ALWAYS** sanitize user-provided content

## AI Agent Guidelines

### When Building Components

1. **Always** define TypeScript interfaces for props
2. **Always** use theme for styling (no hardcoded values)
3. **Always** implement accessibility labels
4. **Always** handle loading and error states
5. **Never** include business logic in components

### Integration Checklist

- [ ] Define TypeScript interface for props
- [ ] Use theme for all styling
- [ ] Implement accessibility labels
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Provide sensible defaults
- [ ] Test with different screen sizes
- [ ] Test accessibility
- [ ] Test with various prop combinations
- [ ] Document component usage

### Common Patterns

1. **Compound Components**: Build complex UIs from simple parts
2. **Render Props**: Share stateful logic
3. **Slot Pattern**: Allow content injection
4. **Control Props**: Make components controlled or uncontrolled
5. **Asynchronous States**: Handle loading, error, success states
6. **Responsive Design**: Adapt to different screen sizes
7. **Theme Integration**: Use design system tokens
8. **Accessibility First**: Include a11y from the start

## Related Documentation

- **Details Components**: `details/README.md`
- **Feedback Components**: `feedback/README.md`
- **Section Components**: `sections/README.md`
- **Paywall Components**: `paywall/README.md`
- **Design System**: External design system documentation
- **Hooks**: `../hooks/README.md`

## Component Examples

### CreditRow

Display user's credit balance with optional actions.

Usage:
- Set amount prop to number of credits
- Set isLoading to true during data fetch
- Provide onPress callback for navigation
- Component displays credit count and handles tap

### PremiumStatusBadge

Visual indicator for premium subscription status.

Usage:
- Set isPremium to boolean status
- Set tier to subscription level (gold, silver, etc.)
- Component renders styled badge

### PaywallModal

Modal for subscription and credit purchase.

Usage:
- Set isVisible to boolean for show/hide
- Provide onClose callback
- Pass features array for premium features list
- Modal handles purchase flow

## Directory Structure

The components directory contains:
- **details/** - Detail display components (CreditRow, DetailRow, PremiumStatusBadge, PremiumDetailsCard)
- **feedback/** - Feedback and alert components (PaywallFeedbackModal)
- **sections/** - Section components (SubscriptionSection)
- **paywall/** - Paywall components (PaywallModal)
