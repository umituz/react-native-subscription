# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.42.0] - 2026-03-18

### BREAKING CHANGES
- **PaywallScreen:** Removed `onPurchase` and `onRestore` props
  - Use `usePremium()` hook internally instead
  - Migration: Remove these props from your PaywallScreen usage
- **Orchestrator:** No longer passes functions via navigation params
  - Only serializable data (translations, features, packages) passed
  - Migration: Remove `onPurchase`/`onRestore` from navigation.navigate() calls
- **PaywallScreenWrapper:** No longer needed
  - Direct usage of PaywallScreen component
  - Migration: Remove wrapper, use PaywallScreen directly in stack

### Fixed
- Non-serializable values warnings in React Navigation
- Maximum update depth exceeded errors
- Infinite re-render loops caused by function prop dependencies
- useEffect dependency array issues

### Added
- Detailed __DEV__ logging throughout the subscription flow
- Console emojis for better debugging (📱, 🛒, ✅, ❌, etc.)
- Architectural clarity with clean separation of concerns

### Changed
- `usePaywallActions` interface: `onPurchase`/`onRestore` → `purchasePackage`/`restorePurchase`
- PaywallScreen now directly uses `usePremium()` hook for purchase functions
- Orchestrator only passes serializable data via navigation params

### Technical Details
**Old Architecture (Problematic):**
```
Orchestrator → navigation.navigate("PaywallScreen", { onPurchase, onRestore })
  ↓ Non-serializable warnings
PaywallScreen (receives functions as props)
  ↓ Function dependencies change
usePaywallActions (infinite loops)
```

**New Architecture (Clean):**
```
Orchestrator → navigation.navigate("PaywallScreen", { translations, features, packages })
  ↓ Only serializable data
PaywallScreen (uses usePremium() hook internally)
  ↓ Stable function references
usePaywallActions (no infinite loops)
```

## [2.41.13] - 2026-03-17

### Added
- PaywallScreenWrapper to filter non-serializable params
- Documentation for serializable navigation params requirement

### Fixed
- PaywallScreen onClose prop made optional
- Added navigation.goBack() fallback for onClose handler

## [2.41.0] - Earlier versions

### Features
- RevenueCat integration
- Paywall UI components
- Credit system
- Premium gating
- Managed subscription flow
- Onboarding orchestration
- Feedback collection
