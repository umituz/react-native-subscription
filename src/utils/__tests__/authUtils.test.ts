/**
 * Authentication Utilities Tests
 *
 * Tests for authentication check functions
 */

import { isAuthenticated, isGuest } from '../authUtils';

describe('isAuthenticated', () => {
  it('should return false for guest users', () => {
    expect(isAuthenticated(true, null)).toBe(false);
    expect(isAuthenticated(true, 'user123')).toBe(false);
  });

  it('should return false when userId is null', () => {
    expect(isAuthenticated(false, null)).toBe(false);
  });

  it('should return true for authenticated users', () => {
    expect(isAuthenticated(false, 'user123')).toBe(true);
  });
});

describe('isGuest', () => {
  it('should return true for guest users', () => {
    expect(isGuest(true, null)).toBe(true);
    expect(isGuest(true, 'user123')).toBe(true);
  });

  it('should return true when userId is null', () => {
    expect(isGuest(false, null)).toBe(true);
  });

  it('should return false for authenticated users', () => {
    expect(isGuest(false, 'user123')).toBe(false);
  });
});
