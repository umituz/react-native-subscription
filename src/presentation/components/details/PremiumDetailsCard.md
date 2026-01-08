# PremiumDetailsCard Component

Premium subscription details card component.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/components/details/PremiumDetailsCard.tsx`

**Type**: Component

## Strategy

### Premium Status Card Display

1. **Status Display**: Show premium status with badge
2. **Detail Rendering**: Display subscription details (expiration, renewal, etc.)
3. **Action Buttons**: Show manage or upgrade button based on status
4. **Translation Support**: Support custom translations
5. **Visual Hierarchy**: Clear structure with header, details, and actions
6. **Responsive Design**: Adapt to different screen sizes

### Integration Points

- **useSubscriptionStatus**: For subscription status data
- **DetailRow**: For displaying individual details
- **PremiumStatusBadge**: For status badge
- **usePremium**: For premium status check
- **Navigation**: For button actions

## Restrictions

### REQUIRED

- **Status Prop**: MUST provide valid subscription status object
- **Callback Handling**: MUST implement button callbacks
- **Loading State**: MUST handle loading state
- **Null Handling**: MUST handle null status values

### PROHIBITED

- **NEVER** display without status data
- **NEVER** hardcode status text (use translations)
- **DO NOT** show both manage and upgrade buttons
- **DO NOT** expose sensitive implementation details

### CRITICAL SAFETY

- **ALWAYS** validate status object
- **MUST** handle loading state
- **ALWAYS** provide clear button labels
- **NEVER** trust client-side status for security

## AI Agent Guidelines

### When Implementing Premium Cards

1. **Always** provide valid subscription status
2. **Always** handle loading state
3. **Always** implement button callbacks
4. **Always** use translations for localization
5. **Never** hardcode status strings

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide valid subscription status
- [ ] Implement onManagePress callback
- [ ] Implement onUpgradePress callback
- [ ] Handle loading state
- [ ] Handle null dates
- [ ] Provide translations
- [ ] Test with active premium
- [ ] Test with expired subscription
- [ ] Test with free user
- [ ] Test with lifetime subscription

### Common Patterns

1. **Profile Display**: Show in user profile
2. **Settings Card**: Display in settings screen
3. **Status Overview**: Show premium status overview
4. **With Navigation**: Navigate to management
5. **Localized Display**: Use with i18n

## Related Documentation

- **PremiumStatusBadge**: Status badge component
- **DetailRow**: Detail item component
- **SubscriptionSection**: Subscription section
- **usePremium**: Premium status hook
- **Details README**: `./README.md`
