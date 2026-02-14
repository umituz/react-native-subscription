import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";

export const FAILED_INITIALIZATION_RESULT: InitializeResult = {
  success: false,
  offering: null,
  isPremium: false,
};

export const CONFIGURATION_RETRY_DELAY_MS = 100;
export const MAX_INIT_RETRIES = 5;
