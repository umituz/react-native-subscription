/**
 * Tests for Plan Detection Utilities
 */

import { extractPlanFromProductId } from '../utils/planDetectionUtils';
import { SUBSCRIPTION_PLAN_TYPES } from '../utils/subscriptionConstants';

describe('Plan Detection Utils', () => {
  describe('extractPlanFromProductId', () => {
    it('should return UNKNOWN for null/undefined/empty productId', () => {
      expect(extractPlanFromProductId(null)).toBe(SUBSCRIPTION_PLAN_TYPES.UNKNOWN);
      expect(extractPlanFromProductId(undefined)).toBe(SUBSCRIPTION_PLAN_TYPES.UNKNOWN);
      expect(extractPlanFromProductId('')).toBe(SUBSCRIPTION_PLAN_TYPES.UNKNOWN);
    });

    it('should detect weekly plans', () => {
      expect(extractPlanFromProductId('com.app.weekly')).toBe(SUBSCRIPTION_PLAN_TYPES.WEEKLY);
      expect(extractPlanFromProductId('com.app.week')).toBe(SUBSCRIPTION_PLAN_TYPES.WEEKLY);
      expect(extractPlanFromProductId('WEEKLY_PREMIUM')).toBe(SUBSCRIPTION_PLAN_TYPES.WEEKLY);
    });

    it('should detect monthly plans', () => {
      expect(extractPlanFromProductId('com.app.monthly')).toBe(SUBSCRIPTION_PLAN_TYPES.MONTHLY);
      expect(extractPlanFromProductId('com.app.month')).toBe(SUBSCRIPTION_PLAN_TYPES.MONTHLY);
      expect(extractPlanFromProductId('MONTHLY_PREMIUM')).toBe(SUBSCRIPTION_PLAN_TYPES.MONTHLY);
    });

    it('should detect yearly plans', () => {
      expect(extractPlanFromProductId('com.app.yearly')).toBe(SUBSCRIPTION_PLAN_TYPES.YEARLY);
      expect(extractPlanFromProductId('com.app.year')).toBe(SUBSCRIPTION_PLAN_TYPES.YEARLY);
      expect(extractPlanFromProductId('com.app.annual')).toBe(SUBSCRIPTION_PLAN_TYPES.YEARLY);
      expect(extractPlanFromProductId('YEARLY_PREMIUM')).toBe(SUBSCRIPTION_PLAN_TYPES.YEARLY);
    });

    it('should be case insensitive', () => {
      expect(extractPlanFromProductId('WEEKLY')).toBe(SUBSCRIPTION_PLAN_TYPES.WEEKLY);
      expect(extractPlanFromProductId('Monthly')).toBe(SUBSCRIPTION_PLAN_TYPES.MONTHLY);
      expect(extractPlanFromProductId('YEARLY')).toBe(SUBSCRIPTION_PLAN_TYPES.YEARLY);
    });

    it('should return UNKNOWN for unrecognized patterns', () => {
      expect(extractPlanFromProductId('com.app.lifetime')).toBe(SUBSCRIPTION_PLAN_TYPES.UNKNOWN);
      expect(extractPlanFromProductId('com.app.premium')).toBe(SUBSCRIPTION_PLAN_TYPES.UNKNOWN);
      expect(extractPlanFromProductId('random_string')).toBe(SUBSCRIPTION_PLAN_TYPES.UNKNOWN);
    });
  });
});