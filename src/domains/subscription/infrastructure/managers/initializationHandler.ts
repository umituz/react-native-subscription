import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import { initializeRevenueCatService, getRevenueCatService } from "../services/revenueCatServiceInstance";
import { ensureServiceAvailable } from "./subscriptionManagerUtils";
import type { RevenueCatConfig } from "../../../revenuecat/core/types";

export const performServiceInitialization = async (config: RevenueCatConfig, userId: string): Promise<{ service: IRevenueCatService; success: boolean }> => {
  await initializeRevenueCatService(config);
  const service = getRevenueCatService();

  ensureServiceAvailable(service);

  const result = await service!.initialize(userId);
  return { service: service!, success: result.success };
};
