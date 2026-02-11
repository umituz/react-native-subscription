import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import { PackageHandler } from "../handlers/PackageHandler";
import { ensureServiceAvailable, ensureConfigured } from "./subscriptionManagerUtils";
import type { SubscriptionManagerConfig } from "./SubscriptionManager.types";

export const createPackageHandler = (
  service: IRevenueCatService | null,
  config: SubscriptionManagerConfig | null
): PackageHandler => {
  ensureServiceAvailable(service);
  ensureConfigured(config);

  return new PackageHandler(
    service!,
    config!.config.entitlementIdentifier
  );
};
