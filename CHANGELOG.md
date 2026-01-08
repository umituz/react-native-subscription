# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release with complete subscription management system
- RevenueCat integration with auto-initialization
- Credits system with transaction tracking
- Paywall components and hooks
- Premium gate system
- Multi-language support
- DDD architecture implementation

## [2.14.97] - 2024-01-08

### Added
- Domain-driven design architecture
- Wallet domain with credits and transactions
- Paywall domain with customizable UI components
- Config domain for plan management
- Complete TypeScript documentation
- 13 comprehensive README.md files

### Fixed
- Expo auth session and web browser dependencies
- Purchase result export
- Credits system consolidation

### Changed
- Externalized package allocations
- Improved error handling across all modules

## [2.14.96] - 2024-01-07

### Added
- Paywall feedback modal
- Premium details card component
- Status badge component
- Transaction history tracking

### Fixed
- Credit deduction edge cases
- Subscription status sync issues

## [2.14.95] - 2024-01-06

### Added
- Credits system with wallet domain
- Transaction repository
- Product metadata service
- Credit cost management

### Changed
- Refactored to DDD architecture
- Separated domain logic from infrastructure

## [2.14.0] - 2024-01-01

### Added
- RevenueCat integration
- Subscription management
- Premium status tracking
- Paywall components
- React hooks for subscription state

### Changed
- Migrated from legacy subscription system
- Improved type safety
- Better error handling

## Versioning Scheme

This project uses semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Example Version Numbers

- `2.14.97` → Major version 2, Minor version 14, Patch 97
- `3.0.0` → Breaking changes from version 2
- `2.15.0` → New features added to version 2
- `2.14.98` → Bug fix for version 2.14.97

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md with changes
3. Commit changes: `git commit -m "chore: release v{version}"`
4. Create git tag: `git tag v{version}`
5. Push to GitHub: `git push && git push --tags`
6. Publish to npm: `npm publish`

## Changelog Categories

### Added
- New features
- New components
- New hooks
- New utilities

### Changed
- Changes in existing functionality
- Refactoring
- Performance improvements

### Deprecated
- Soon-to-be removed features
- Features to be removed in future versions

### Removed
- Removed features
- Removed dependencies

### Fixed
- Bug fixes
- Error handling improvements

### Security
- Security vulnerability fixes
- Security improvements
