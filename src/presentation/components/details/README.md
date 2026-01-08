# Details Components

UI components for displaying subscription and premium details.

## Location

- **Base Path**: `/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/presentation/components/details/`
- **Components**: `src/presentation/components/details/`

## Strategy

### Component Architecture

Specialized components for subscription detail display.

- **PremiumDetailsCard**: Premium subscription details card
- **PremiumStatusBadge**: Status badge display
- **DetailRow**: Individual detail row component
- **CreditRow**: Credit balance display component

### Display Components

Structured information display components.

- **Subscription Status**: Active/inactive status display
- **Expiration Dates**: Date formatting and display
- **Product Information**: Plan and product details
- **Credit Balance**: Credit amount display

### Translation Support

Multi-language support for all displayed text.

- **Translation Props**: Optional translation overrides
- **Default Translations**: Built-in language support
- **Date Formatting**: Locale-aware date formatting
- **Currency Formatting**: Locale-aware currency display

### Styling System

Flexible styling and customization.

- **Style Props**: Custom style support
- **Theme Support**: Theme-aware styling
- **Responsive Design**: Adaptive layouts
- **Accessibility**: Accessibility features

## Restrictions

### REQUIRED

- **Loading States**: Show loading indicators while fetching data
- **Error States**: Handle and display errors appropriately
- **Translation Support**: Support multiple languages
- **Accessibility**: Include accessibility labels

### PROHIBITED

- **Hardcoded Text**: All text must support translations
- **Missing Null Checks**: Handle null/undefined values
- **Blocking UI**: Never block app flow
- **Assumed Data**: Never assume data exists

### CRITICAL

- **Data Validation**: Validate all displayed data
- **Edge Cases**: Handle missing or invalid data
- **Performance**: Optimize re-renders
- **User Experience**: Smooth interactions and transitions

## AI Agent Guidelines

### When Modifying Detail Components

1. **Component Props**: Maintain consistent prop interfaces
2. **Styling**: Preserve responsive design
3. **Translations**: Ensure translation support
4. **Testing**: Test with various data states

### When Adding New Detail Components

1. **Pattern Consistency**: Follow existing component patterns
2. **Type Safety**: Define TypeScript types
3. **Documentation**: Document props and usage
4. **Accessibility**: Include accessibility features

### When Fixing Detail Component Bugs

1. **Data Flow**: Check data flow and state
2. **Edge Cases**: Test with null/undefined
3. **Rendering**: Verify rendering logic
4. **Styling**: Check style application

## Related Documentation

- [Presentation Components](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/presentation/components/README.md)
- [Feedback Components](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/presentation/components/feedback/README.md)
- [Sections Components](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/presentation/components/sections/README.md)
- [Paywall Domain](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domains/paywall/README.md)
