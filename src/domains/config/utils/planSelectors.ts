/**
 * Subscription Config Utilities
 * Helper functions for working with subscription configurations
 */

import type { Plan, Config } from "../domain";

export const getPlanByType = (
    config: Config,
    type: string
): Plan | undefined => {
    return config.plans.find((plan) => plan.type === type);
};

export const getPlanById = (
    config: Config,
    id: string
): Plan | undefined => {
    return config.plans.find((plan) => plan.id === id);
};

export const getBestValuePlan = (config: Config): Plan | undefined => {
    return config.plans.find((plan) => plan.isBestValue);
};

export const getPopularPlan = (config: Config): Plan | undefined => {
    return config.plans.find((plan) => plan.isPopular);
};

export const getCreditLimitForPlan = (
    config: Config,
    planId: string
): number => {
    const plan = getPlanById(config, planId);
    if (!plan) {
        console.warn(`[planSelectors] Plan not found: ${planId}, returning 0`);
        return 0;
    }
    return plan.credits;
};

export const determinePlanFromCredits = (
    config: Config,
    currentCredits: number
): Plan | undefined => {
    const sortedPlans = [...config.plans].sort((a, b) => b.credits - a.credits);

    for (const plan of sortedPlans) {
        const threshold = plan.credits * 0.5;
        if (currentCredits >= threshold) {
            return plan;
        }
    }

    return sortedPlans[sortedPlans.length - 1];
};
