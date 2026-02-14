import Purchases, { type CustomerInfo } from "react-native-purchases";
import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";
import type { InitializerDeps } from "./RevenueCatInitializer.types";
import { FAILED_INITIALIZATION_RESULT } from "./initializerConstants";

function buildSuccessResult(deps: InitializerDeps, customerInfo: CustomerInfo, offerings: any): InitializeResult {
  const isPremium = !!customerInfo.entitlements.active[deps.config.entitlementIdentifier];
  return { success: true, offering: offerings.current, isPremium };
}

function normalizeUserId(userId: string): string | null {
  return (userId && userId.length > 0) ? userId : null;
}

function isAnonymousId(userId: string): boolean {
  return userId.startsWith('$RCAnonymous');
}

export async function handleUserSwitch(
  deps: InitializerDeps,
  userId: string
): Promise<InitializeResult> {
  try {
    const currentAppUserId = await Purchases.getAppUserID();
    let customerInfo;

    const normalizedUserId = normalizeUserId(userId);
    const normalizedCurrentUserId = isAnonymousId(currentAppUserId) ? null : currentAppUserId;

    if (normalizedCurrentUserId !== normalizedUserId) {
      if (normalizedUserId) {
        const result = await Purchases.logIn(normalizedUserId);
        customerInfo = result.customerInfo;
      } else {
        customerInfo = await Purchases.getCustomerInfo();
      }
    } else {
      customerInfo = await Purchases.getCustomerInfo();
    }

    deps.setInitialized(true);
    deps.setCurrentUserId(normalizedUserId);
    const offerings = await Purchases.getOfferings();
    return buildSuccessResult(deps, customerInfo, offerings);
  } catch (error) {
    console.error('[UserSwitchHandler] Failed during user switch or fetch', {
      userId,
      currentAppUserId: await Purchases.getAppUserID().catch(() => 'unknown'),
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
    await Purchases.configure({ apiKey, appUserID: normalizedUserId });
    deps.setInitialized(true);
    deps.setCurrentUserId(normalizedUserId);

    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);

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
