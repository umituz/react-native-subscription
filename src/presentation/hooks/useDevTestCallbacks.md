# useDevTestCallbacks Hook

**Development-only** hook for testing subscription renewal and credit operations.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useDevTestCallbacks.ts`

**Type**: Hook

## Strategy

### Development Testing Utilities

1. **Renewal Simulation**: Simulate subscription renewal with credit allocation
2. **Credits Inspection**: Display current credit balance and purchase date
3. **Duplicate Protection Testing**: Test that duplicate renewals are prevented
4. **Development Mode Guard**: Only available in `__DEV__` mode
5. **Production Safety**: Returns `undefined` in production builds
6. **Alert-Based Feedback**: Show test results in alert dialogs

### Integration Points

- **useInitializeCredits**: For credit initialization testing
- **Credits Repository**: `src/domains/wallet/infrastructure/repositories/CreditsRepository.ts`
- **Development Tools**: For testing and debugging
- **Alert API**: For displaying test results

## Restrictions

### REQUIRED

- **Development Only**: MUST only use in `__DEV__` mode
- **Guard Checks**: MUST check if hook returns undefined
- **Visual Distinction**: SHOULD make dev tools visually distinct
- **Documentation**: MUST document behavior for other developers

### PROHIBITED

- **NEVER** use in production code paths
- **NEVER** ship dev UI to production
- **DO NOT** rely on dev tools for production features
- **DO NOT** expose dev functionality to end users

### CRITICAL SAFETY

- **ALWAYS** guard with `__DEV__` checks
- **NEVER** call hook functions in production
- **MUST** remove or disable before release
- **ALWAYS** test that dev tools don't affect production

## AI Agent Guidelines

### When Implementing Development Testing

1. **Always** guard with `__DEV__` checks
2. **Always** check if hook returns undefined
3. **Always** make dev tools visually distinct
4. **Never** expose dev tools to production users
5. **Always** document development-only behavior

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Guard with `__DEV__` check
- [ ] Check if hook returns undefined
- [ ] Make dev UI visually distinct
- [ ] Test renewal simulation
- [ ] Test credits inspection
- [ ] Test duplicate protection
- [ ] Verify undefined returned in production
- [ ] Remove or disable before release

### Common Patterns

1. **Dev Test Panel**: Dedicated screen for testing
2. **Settings Integration**: Add dev tools to settings screen
3. **Debug Menu**: Hidden menu for testing
4. **Flow Testing**: Test complete renewal flows
5. **Edge Case Testing**: Test duplicate handling and errors

## Related Documentation

- **useCredits**: For accessing credits balance
- **useInitializeCredits**: For credit initialization
- **usePremiumWithCredits**: For premium + credits integration
- **Credits README**: `src/domains/wallet/README.md`
- **Renewal Testing Guide**: `src/docs/RENEWAL_TESTING.md`
- **Development Tools**: `src/docs/DEV_TOOLS.md`
