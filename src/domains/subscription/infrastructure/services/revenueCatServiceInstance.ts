import { RevenueCatService } from "./RevenueCatService.types";
import type { RevenueCatConfig } from "../../core/RevenueCatConfig";

let revenueCatServiceInstance: RevenueCatService | null = null;

export const initializeRevenueCatService = (config: RevenueCatConfig): RevenueCatService => {
  if (!revenueCatServiceInstance) {
    revenueCatServiceInstance = new RevenueCatService(config);
  }
  return revenueCatServiceInstance;
};

export const getRevenueCatService = (): RevenueCatService | null => revenueCatServiceInstance;

export const resetRevenueCatService = (): void => {
  revenueCatServiceInstance = null;
};
