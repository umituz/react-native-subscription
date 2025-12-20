/**
 * useUserTier Hook Tests - States and Memoization
 * 
 * Tests for loading/error states and memoization
 */

import React from 'react';
import { create } from 'react-test-renderer';
import { useUserTier, type UseUserTierParams } from '../useUserTier';

// Test component that uses hook
function TestComponent({ params }: { params: UseUserTierParams }) {
  const tierInfo = useUserTier(params);
  return React.createElement('div', { 'data-testid': 'tier-info' }, JSON.stringify(tierInfo));
}

describe('useUserTier - States and Memoization', () => {
  describe('Loading and error states', () => {
    it('should pass through loading state', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
        isLoading: true,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.isLoading).toBe(true);
    });

    it('should pass through error state', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
        error: 'Failed to fetch premium status',
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.error).toBe('Failed to fetch premium status');
    });

    it('should default loading to false', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.isLoading).toBe(false);
    });

    it('should default error to null', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.error).toBe(null);
    });
  });

  describe('Memoization', () => {
    it('should recalculate when isGuest changes', () => {
      let params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: true,
      };

      const component = create(React.createElement(TestComponent, { params }));
      let tree = component.toJSON();
      let tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.tier).toBe('premium');

      params = {
        isGuest: true,
        userId: null,
        isPremium: true,
      };
      component.update(React.createElement(TestComponent, { params }));
      tree = component.toJSON();
      tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.tier).toBe('guest');
    });

    it('should recalculate when userId changes', () => {
      let params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: true,
      };

      const component = create(React.createElement(TestComponent, { params }));
      let tree = component.toJSON();
      let tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.userId).toBe('user123');

      params = {
        isGuest: false,
        userId: 'user456',
        isPremium: true,
      };
      component.update(React.createElement(TestComponent, { params }));
      tree = component.toJSON();
      tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.userId).toBe('user456');
    });

    it('should recalculate when isPremium changes', () => {
      let params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
      };

      const component = create(React.createElement(TestComponent, { params }));
      let tree = component.toJSON();
      let tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.tier).toBe('freemium');

      params = {
        isGuest: false,
        userId: 'user123',
        isPremium: true,
      };
      component.update(React.createElement(TestComponent, { params }));
      tree = component.toJSON();
      tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.tier).toBe('premium');
    });

    it('should not recalculate when params are the same', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: true,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree1 = component.toJSON();
      const tierInfo1 = JSON.parse((tree1 as any).children[0]);

      // Update with same params
      component.update(React.createElement(TestComponent, { params }));
      const tree2 = component.toJSON();
      const tierInfo2 = JSON.parse((tree2 as any).children[0]);

      expect(tierInfo1).toEqual(tierInfo2);
    });
  });
});