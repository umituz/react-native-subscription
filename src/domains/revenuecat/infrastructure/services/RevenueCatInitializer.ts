import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";
import type { InitializerDeps } from "./RevenueCatInitializer.types";
import { FAILED_INITIALIZATION_RESULT, CONFIGURATION_RETRY_DELAY_MS, MAX_INIT_RETRIES } from "./initializerConstants";
import { configState } from "./ConfigurationStateManager";
import { handleUserSwitch, handleInitialConfiguration, fetchCurrentUserData } from "./userSwitchHandler";
import { createLogger } from "../../../../../shared/utils/logger";

const logger = createLogger("RevenueCatInitializer");

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
      logger.error("Max retry attempts reached", undefined, { userId });
      return FAILED_INITIALIZATION_RESULT;
    }

    return initializeSDK(deps, userId, apiKey, configStartRetryCount);
  }

  const key = apiKey || deps.config.apiKey || null;
  if (!key) {
    return FAILED_INITIALIZATION_RESULT;
  }

  let resolveConfig: (value: InitializeResult) => void;
  try {
    resolveConfig = configState.startConfiguration();
  } catch (error) {
    if (configStartRetryCount >= MAX_CONFIG_START_RETRIES) {
      logger.error("Max configuration start retries reached", error, {
        userId,
        retryCount: configStartRetryCount,
      });
      return FAILED_INITIALIZATION_RESULT;
    }

    logger.error("Failed to start configuration, retrying", error, {
      userId,
      retryCount: configStartRetryCount,
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
