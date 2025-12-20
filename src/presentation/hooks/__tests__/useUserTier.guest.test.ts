/**
 * useUserTier Hook Tests - Guest Users
 * 
 * Tests for guest user scenarios
 */

import React from 'react';
import { create } from 'react-test-renderer';
import { useUserTier, type UseUserTierParams } from '../useUserTier';

// Test component that uses the hook
function TestComponent({ params }: { params: UseUserTierParams }) {
  const tierInfo = useUserTier(params);
  return React.createElement('div', { 'data-testid': 'tier-info' }, JSON.stringify(tierInfo));
}

describe('useUserTier - Guest Users', () => {
  it('should return guest tier for guest users', () => {
    const params: UseUserTierParams = {
      isGuest: true,
      userId: null,
      isPremium: false,
    };

    const component = create(React.createElement(TestComponent, { params }));
    const tree = component.toJSON();
    const tierInfo = JSON.parse((tree as any).children[0]);

    expect(tierInfo.tier).toBe('guest');
    expect(tierInfo.isPremium).toBe(false);
    expect(tierInfo.isGuest).toBe(true);
    expect(tierInfo.isAuthenticated).toBe(false);
    expect(tierInfo.userId).toBe(null);
    expect(tierInfo.isLoading).toBe(false);
    expect(tierInfo.error).toBe(null);
  });

  it('should ignore isPremium for guest users', () => {
    const params: UseUserTierParams = {
      isGuest: true,
      userId: null,
      isPremium: true, // Even if true, guest should be false
    };

    const component = create(React.createElement(TestComponent, { params }));
    const tree = component.toJSON();
    const tierInfo = JSON.parse((tree as any).children[0]);

    expect(tierInfo.tier).toBe('guest');
    expect(tierInfo.isPremium).toBe(false); // Guest users NEVER have premium
  });

  it('should handle guest user with userId provided', () => {
    const params: UseUserTierParams = {
      isGuest: true,
      userId: 'user123', // Even with userId, isGuest=true takes precedence
      isPremium: true,
    };

    const component = create(React.createElement(TestComponent, { params }));
    const tree = component.toJSON();
    const tierInfo = JSON.parse((tree as any).children[0]);

    expect(tierInfo.tier).toBe('guest');
    expect(tierInfo.isPremium).toBe(false);
    expect(tierInfo.isGuest).toBe(true);
    expect(tierInfo.isAuthenticated).toBe(false);
    expect(tierInfo.userId).toBe(null); // Should be null for guests
  });
});