import Purchases, { type CustomerInfo } from "react-native-purchases";
import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";
import type { InitializerDeps } from "./RevenueCatInitializer.types";
import { FAILED_INITIALIZATION_RESULT } from "./initializerConstants";
import { syncPremiumStatus } from "../../../subscription/infrastructure/utils/PremiumStatusSyncer";
import { UserSwitchMutex } from "./UserSwitchMutex";

declare const __DEV__: boolean;

function buildSuccessResult(deps: InitializerDeps, customerInfo: CustomerInfo, offerings: any): InitializeResult {
  const isPremium = !!customerInfo.entitlements.active[deps.config.entitlementIdentifier];
  return { success: true, offering: offerings.current, isPremium };
}

function normalizeUserId(userId: string): string | null {
  return (userId && userId.length > 0) ? userId : null;
}

function isAnonymousId(userId: string): boolean {
  return userId.startsWith('$RCAnonymous') || userId.startsWith('device_');
}

export async function handleUserSwitch(
  deps: InitializerDeps,
  userId: string
): Promise<InitializeResult> {
  const mutexKey = userId || '__anonymous__';

  // Acquire mutex to prevent concurrent Purchases.logIn() calls
  const { shouldProceed, existingPromise } = await UserSwitchMutex.acquire(mutexKey);

  if (!shouldProceed && existingPromise) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[UserSwitchHandler] Using result from active switch operation');
    }
    return existingPromise;
  }

  const switchOperation = performUserSwitch(deps, userId);
  UserSwitchMutex.setPromise(switchOperation);
  return switchOperation;
}

async function performUserSwitch(
  deps: InitializerDeps,
  userId: string
): Promise<InitializeResult> {
  try {
    const currentAppUserId = await Purchases.getAppUserID();
    const normalizedUserId = normalizeUserId(userId);
    const normalizedCurrentUserId = isAnonymousId(currentAppUserId) ? null : currentAppUserId;

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[UserSwitchHandler] handleUserSwitch:', {
        providedUserId: userId,
        normalizedUserId: normalizedUserId || '(null - anonymous)',
        currentAppUserId,
        normalizedCurrentUserId: normalizedCurrentUserId || '(null - anonymous)',
        needsSwitch: normalizedCurrentUserId !== normalizedUserId,
      });
    }

    let customerInfo;

    if (normalizedCurrentUserId !== normalizedUserId) {
      if (normalizedUserId) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('[UserSwitchHandler] Calling Purchases.logIn() to switch from anonymous to:', normalizedUserId);
        }
        const result = await Purchases.logIn(normalizedUserId);
        customerInfo = result.customerInfo;
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('[UserSwitchHandler] ✅ Purchases.logIn() successful, created:', result.created);
        }
      } else {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('[UserSwitchHandler] User is anonymous, fetching customer info');
        }
        customerInfo = await Purchases.getCustomerInfo();
      }
    } else {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[UserSwitchHandler] No user switch needed, fetching current customer info');
      }
      customerInfo = await Purchases.getCustomerInfo();
    }

    deps.setInitialized(true);
    deps.setCurrentUserId(normalizedUserId);
    const offerings = await Purchases.getOfferings();

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[UserSwitchHandler] ✅ User switch completed successfully');
    }

    return buildSuccessResult(deps, customerInfo, offerings);
  } catch (error) {
    let currentAppUserId = 'unknown';
    try {
      currentAppUserId = await Purchases.getAppUserID();
    } catch {
      // Ignore error in error handler
    }

    console.error('[UserSwitchHandler] Failed during user switch or fetch', {
      userId,
      currentAppUserId,
      error
    });
    return FAILED_INITIALIZATION_RESULT;
  }
}

export async function handleInitialConfiguration(
  deps: InitializerDeps,
  userId: string,
  apiKey: string
): Promise<InitializeResult> {
  try {
    const normalizedUserId = normalizeUserId(userId);

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[UserSwitchHandler] handleInitialConfiguration:', {
        providedUserId: userId,
        normalizedUserId: normalizedUserId || '(null - anonymous)',
        apiKeyPrefix: apiKey.substring(0, 5) + '...',
        isTestKey: apiKey.startsWith('test_'),
      });
    }

    await Purchases.configure({ apiKey, appUserID: normalizedUserId });
    deps.setInitialized(true);
    deps.setCurrentUserId(normalizedUserId);

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[UserSwitchHandler] ✅ Purchases.configure() successful');
    }

    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);

    const currentUserId = await Purchases.getAppUserID();

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[UserSwitchHandler] ✅ Initial configuration completed:', {
        revenueCatUserId: currentUserId,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        offeringsCount: offerings.all ? Object.keys(offerings.all).length : 0,
      });
    }

    await syncPremiumStatus(deps.config, currentUserId, customerInfo);

    return buildSuccessResult(deps, customerInfo, offerings);
  } catch (error) {
    console.error('[UserSwitchHandler] SDK configuration failed', {
      userId,
      error
    });
    return FAILED_INITIALIZATION_RESULT;
  }
}

export async function fetchCurrentUserData(deps: InitializerDeps): Promise<InitializeResult> {
  try {
    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);
    return buildSuccessResult(deps, customerInfo, offerings);
  } catch (error) {
    console.error('[UserSwitchHandler] Failed to fetch customer info/offerings for initialized user', {
      error
    });
    return FAILED_INITIALIZATION_RESULT;
  }
}
