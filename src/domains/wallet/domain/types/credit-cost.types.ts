/**
 * Credit Cost Types
 *
 * Types for configurable AI operation credit costs.
 * Apps can override these costs based on their pricing model.
 */

export interface CreditCostConfig {
  [operationKey: string]: number;
}

export interface AICreditCosts {
  IMAGE: number;
  VIDEO_5S: number;
  VIDEO_10S: number;
  VOICE: number;
  UPSCALE: number;
  PHOTO_RESTORE: number;
  REMOVE_BACKGROUND: number;
  ANIME_SELFIE: number;
  FACE_SWAP: number;
  REMOVE_OBJECT: number;
  REPLACE_BACKGROUND: number;
  INPAINTING: number;
  IMAGE_TO_IMAGE: number;
  AI_HUG: number;
  AI_KISS: number;
  IMAGE_TO_VIDEO_5S: number;
  IMAGE_TO_VIDEO_10S: number;
  TEXT_TO_VIDEO_5S: number;
  TEXT_TO_VIDEO_10S: number;
  TREND_VIDEO: number;
  EFFECT_VIDEO: number;
}

export const DEFAULT_AI_CREDIT_COSTS: AICreditCosts = {
  IMAGE: 2,
  VIDEO_5S: 20,
  VIDEO_10S: 35,
  VOICE: 3,
  UPSCALE: 2,
  PHOTO_RESTORE: 2,
  REMOVE_BACKGROUND: 2,
  ANIME_SELFIE: 3,
  FACE_SWAP: 4,
  REMOVE_OBJECT: 5,
  REPLACE_BACKGROUND: 5,
  INPAINTING: 5,
  IMAGE_TO_IMAGE: 3,
  AI_HUG: 15,
  AI_KISS: 15,
  IMAGE_TO_VIDEO_5S: 20,
  IMAGE_TO_VIDEO_10S: 35,
  TEXT_TO_VIDEO_5S: 25,
  TEXT_TO_VIDEO_10S: 45,
  TREND_VIDEO: 20,
  EFFECT_VIDEO: 15,
};

export interface CreditCostResult {
  cost: number;
  dollarValue: number;
}

export function getCreditCost(
  config: CreditCostConfig,
  operation: string
): number {
  return config[operation] ?? 0;
}

export function creditsToDollars(
  credits: number,
  pricePerCredit: number = 0.1
): number {
  return credits * pricePerCredit;
}

export function createCreditCostConfig(
  overrides?: Partial<AICreditCosts>
): AICreditCosts {
  return {
    ...DEFAULT_AI_CREDIT_COSTS,
    ...overrides,
  };
}
