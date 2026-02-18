import { RevenueCatService } from "./RevenueCatService.types";
import type { RevenueCatConfig } from "../../../revenuecat/core/types";

let revenueCatServiceInstance: RevenueCatService | null = null;

export const initializeRevenueCatService = (config: RevenueCatConfig): RevenueCatService => {
  if (!revenueCatServiceInstance) {
    revenueCatServiceInstance = new RevenueCatService(config);
  }
  return revenueCatServiceInstance;
};

export const getRevenueCatService = (): RevenueCatService | null => revenueCatServiceInstance;
