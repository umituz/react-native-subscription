import type { RevenueCatConfig } from "../../core/RevenueCatConfig";

export interface InitializerDeps {
  config: RevenueCatConfig;
  isInitialized: () => boolean;
  getCurrentUserId: () => string | null;
  setInitialized: (value: boolean) => void;
  setCurrentUserId: (userId: string) => void;
}
