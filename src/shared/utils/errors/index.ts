/**
 * Error Utilities Module
 *
 * Centralized error handling utilities split into focused modules.
 * Original 195-line file split into 5 files for better maintainability.
 *
 * Modules:
 * - errorConversion: Error normalization and creation
 * - errorTypeGuards: Type-safe error checking
 * - errorWrappers: Function wrapping with error handling
 * - errorAssertions: Runtime validation and type narrowing
 * - serviceErrors: Service-specific error creation
 */

export * from './errorConversion';
export * from './errorTypeGuards';
export * from './errorWrappers';
export * from './errorAssertions';
export * from './serviceErrors';
