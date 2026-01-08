# Contributing to @umituz/react-native-subscription

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When creating a bug report, include:

- **Clear title**: Describe the bug briefly
- **Description**: Detailed explanation of the problem
- **Steps to reproduce**: Minimal reproduction steps
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, React Native version, package version
- **Screenshots**: If applicable, add screenshots

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Clear title**: Describe the enhancement
- **Problem description**: What problem does it solve?
- **Proposed solution**: How should it work?
- **Alternatives**: What other solutions have you considered?
- **Additional context**: Any other relevant information

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- React Native development environment

### Installation

```bash
# Clone the repository
git clone https://github.com/umituz/react-native-subscription.git
cd react-native-subscription

# Install dependencies
npm install
# or
yarn install

# Install peer dependencies
npm install @tanstack/react-query react-native-purchases
# or
yarn add @tanstack/react-query react-native-purchases
```

### Running Tests

```bash
# Run all tests
npm test
# or
yarn test

# Run with coverage
npm test -- --coverage
# or
yarn test --coverage

# Run specific test file
npm test -- path/to/test.test.ts
# or
yarn test path/to/test.test.ts
```

### Type Checking

```bash
# Run TypeScript type check
npm run typecheck
# or
yarn typecheck
```

### Linting

```bash
# Run ESLint
npm run lint
# or
yarn lint

# Auto-fix issues
npm run lint -- --fix
# or
yarn lint --fix
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper type annotations
- Avoid `any` types
- Use interfaces for public APIs
- Use types for internal logic

```typescript
// ✅ Good
interface SubscriptionConfig {
  apiKey: string;
  entitlementId: string;
}

function initializeSubscription(config: SubscriptionConfig): Promise<void> {
  // ...
}

// ❌ Bad
function initializeSubscription(config: any): Promise<any> {
  // ...
}
```

### Naming Conventions

- **Components**: PascalCase (e.g., `PremiumDetailsCard`)
- **Hooks**: camelCase with `use` prefix (e.g., `usePremium`)
- **Functions**: camelCase (e.g., `formatPrice`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_CREDITS_CONFIG`)
- **Types/Interfaces**: PascalCase (e.g., `SubscriptionStatus`)

### File Organization

```
src/
├── domains/
│   └── {domain-name}/
│       ├── domain/
│       ├── infrastructure/
│       ├── presentation/
│       └── index.ts
├── application/
├── infrastructure/
├── presentation/
└── utils/
```

### Code Style

Follow the established code style:

- Use 2 spaces for indentation
- Use single quotes for strings
- Use trailing commas
- Add semicolons
- Max line length: 100 characters

```typescript
// ✅ Good
import { useState, useEffect } from 'react';

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  return { isPremium, isLoading };
}

// ❌ Bad
import { useState, useEffect } from "react"
export function usePremium(){
const [isPremium,setIsPremium]=useState(false)
return {isPremium}
}
```

### Comments and Documentation

- Use JSDoc for public APIs
- Comment complex logic
- Keep comments up-to-date
- Write in English

```typescript
/**
 * Checks if the user has an active premium subscription
 * @param userId - The user ID to check
 * @returns Promise<boolean> - True if user has premium, false otherwise
 * @example
 * ```ts
 * const isPremium = await checkUserPremium('user-123');
 * ```
 */
export async function checkUserPremium(userId: string): Promise<boolean> {
  // Implementation
}
```

## Testing Guidelines

### Unit Tests

- Write unit tests for all new functions
- Aim for high code coverage (>80%)
- Test both success and error cases
- Use descriptive test names

```typescript
describe('formatPrice', () => {
  it('should format USD price correctly', () => {
    const result = formatPrice(9.99, 'USD');
    expect(result).toBe('$9.99');
  });

  it('should format TRY price correctly', () => {
    const result = formatPrice(99.99, 'TRY');
    expect(result).toBe('99,99 ₺');
  });

  it('should handle zero price', () => {
    const result = formatPrice(0, 'USD');
    expect(result).toBe('$0.00');
  });
});
```

### Integration Tests

- Test component integration
- Test hook behavior
- Test with mock data

```typescript
describe('usePremium', () => {
  it('should return premium status', async () => {
    const { result, waitFor } = renderHook(() => usePremium());

    await waitFor(() => {
      expect(result.current.isPremium).toBe(true);
    });
  });
});
```

### Test Files

- Place test files next to source files
- Name test files with `.test.ts` or `.spec.ts` suffix
- Keep tests focused and independent

## Documentation

### Code Documentation

- Document all public APIs with JSDoc
- Include usage examples
- Describe parameters and return types
- Note any edge cases or limitations

### README Updates

- Update README when adding features
- Include usage examples
- Update API reference
- Keep examples up-to-date

### Changelog

- Update CHANGELOG.md for all changes
- Follow Keep a Changelog format
- Categorize changes (Added, Changed, Fixed, etc.)
- Reference issues and PRs

## Pull Request Process

### Before Submitting

1. **Code Review**: Review your own code first
2. **Tests**: Ensure all tests pass
3. **Linting**: Fix all linting issues
4. **Type Check**: Ensure no TypeScript errors
5. **Documentation**: Update relevant documentation

### PR Title

Use clear, descriptive titles:

- ✅ `feat: add credit transaction history`
- ✅ `fix: resolve subscription sync issue`
- ✅ `docs: update README with new examples`
- ❌ `update code`
- ❌ `fix stuff`

### PR Description

Include in your PR description:

- **Summary**: Brief description of changes
- **Motivation**: Why this change is needed
- **Changes**: List of changes made
- **Testing**: How you tested the changes
- **Screenshots**: If UI changes, include screenshots
- **Breaking Changes**: Note any breaking changes
- **Related Issues**: Link to related issues

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] No merge conflicts
- [ ] PR description clearly describes changes
- [ ] Ready for review

### Review Process

1. Automated checks must pass
2. Code review by maintainers
3. Address review comments
4. Approval from at least one maintainer
5. Squash and merge

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
feat(wallet): add transaction history tracking

Add transaction history feature with pagination support.
Implements #123

fix(paywall): resolve modal closing issue

Fix modal not closing on backdrop press.
Fixes #456

docs: update README with new examples

Add comprehensive usage examples for all hooks.
```

## Getting Help

- Open an issue for bugs or questions
- Check existing documentation
- Join community discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## Recognition

Contributors will be recognized in the CONTRIBUTORS.md file.

Thank you for contributing! 🎉
