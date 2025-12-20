/**
 * useUserTier Hook Tests - Authenticated Users
 * 
 * Tests for authenticated user scenarios
 */

import React from 'react';
import { create } from 'react-test-renderer';
import { useUserTier, type UseUserTierParams } from '../useUserTier';

// Test component that uses hook
function TestComponent({ params }: { params: UseUserTierParams }) {
  const tierInfo = useUserTier(params);
  return React.createElement('div', { 'data-testid': 'tier-info' }, JSON.stringify(tierInfo));
}

describe('useUserTier - Authenticated Users', () => {
  it('should return premium tier for authenticated premium users', () => {
    const params: UseUserTierParams = {
      isGuest: false,
      userId: 'user123',
      isPremium: true,
    };

    const component = create(React.createElement(TestComponent, { params }));
    const tree = component.toJSON();
    const tierInfo = JSON.parse((tree as any).children[0]);

    expect(tierInfo.tier).toBe('premium');
    expect(tierInfo.isPremium).toBe(true);
    expect(tierInfo.isGuest).toBe(false);
    expect(tierInfo.isAuthenticated).toBe(true);
    expect(tierInfo.userId).toBe('user123');
  });

  it('should return freemium tier for authenticated non-premium users', () => {
    const params: UseUserTierParams = {
      isGuest: false,
      userId: 'user123',
      isPremium: false,
    };

    const component = create(React.createElement(TestComponent, { params }));
    const tree = component.toJSON();
    const tierInfo = JSON.parse((tree as any).children[0]);

    expect(tierInfo.tier).toBe('freemium');
    expect(tierInfo.isPremium).toBe(false);
    expect(tierInfo.isGuest).toBe(false);
    expect(tierInfo.isAuthenticated).toBe(true);
    expect(tierInfo.userId).toBe('user123');
  });

  it('should handle different userId formats', () => {
    const testCases = [
      'user123',
      'user-with-dashes',
      'user_with_underscores',
      'user@example.com',
      '1234567890',
    ];

    testCases.forEach(userId => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId,
        isPremium: false,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.userId).toBe(userId);
      expect(tierInfo.isAuthenticated).toBe(true);
      expect(tierInfo.isGuest).toBe(false);
    });
  });
});