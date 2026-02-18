import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";
import { resolveApiKey } from "../utils/ApiKeyResolver";
import type { InitializerDeps } from "./RevenueCatInitializer.types";
import { FAILED_INITIALIZATION_RESULT, CONFIGURATION_RETRY_DELAY_MS, MAX_INIT_RETRIES } from "./initializerConstants";
import { configState } from "./ConfigurationStateManager";
import { handleUserSwitch, handleInitialConfiguration, fetchCurrentUserData } from "./userSwitchHandler";

const MAX_CONFIG_START_RETRIES = 3;

export async function initializeSDK(
  deps: InitializerDeps,
  userId: string,
  apiKey?: string,
  configStartRetryCount: number = 0
): Promise<InitializeResult> {
  if (deps.isInitialized() && deps.getCurrentUserId() === userId) {
    return fetchCurrentUserData(deps);
  }

  if (configState.isPurchasesConfigured) {
    return handleUserSwitch(deps, userId);
  }

  if (configState.isConfiguring) {
    let retryCount = 0;
    while (configState.isConfiguring && retryCount < MAX_INIT_RETRIES) {
      if (configState.configurationPromise) {
        await configState.configurationPromise;
      } else {
        await new Promise<void>(resolve => setTimeout(() => resolve(), CONFIGURATION_RETRY_DELAY_MS));
      }
      retryCount++;
    }

    if (configState.isConfiguring) {
      console.error('[RevenueCatInitializer] Max retry attempts reached', { userId });
      return FAILED_INITIALIZATION_RESULT;
    }

    return initializeSDK(deps, userId, apiKey, configStartRetryCount);
  }

  const key = apiKey || resolveApiKey(deps.config);
  if (!key) {
    return FAILED_INITIALIZATION_RESULT;
  }

  let resolveConfig: (value: InitializeResult) => void;
  try {
    resolveConfig = configState.startConfiguration();
  } catch (error) {
    if (configStartRetryCount >= MAX_CONFIG_START_RETRIES) {
      console.error('[RevenueCatInitializer] Max configuration start retries reached', {
        userId,
        retryCount: configStartRetryCount,
        error
      });
      return FAILED_INITIALIZATION_RESULT;
    }

    console.error('[RevenueCatInitializer] Failed to start configuration, retrying', {
      userId,
      retryCount: configStartRetryCount,
      error
    });
    await new Promise<void>(resolve => setTimeout(() => resolve(), CONFIGURATION_RETRY_DELAY_MS));
    return initializeSDK(deps, userId, apiKey, configStartRetryCount + 1);
  }

  const result = await handleInitialConfiguration(deps, userId, key);
  configState.completeConfiguration(result.success);
  resolveConfig(result);
  // Clean up the resolved promise so future callers don't await a stale promise
  configState.clearCompletedConfiguration();
  return result;
}
