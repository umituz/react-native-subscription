import type { PurchasesPackage } from "react-native-purchases";
import type { IRevenueCatService } from "../../../../../shared/application/ports/IRevenueCatService";

export async function executePurchase(
  service: IRevenueCatService,
  pkg: PurchasesPackage,
  userId: string
): Promise<boolean> {
  console.log('🔵 [executePurchase] Starting', {
    productId: pkg.product.identifier,
    userId,
    isInitialized: service.isInitialized()
  });

  if (!service.isInitialized()) {
    console.error('❌ [executePurchase] Service not initialized!');
    throw new Error("Service not initialized");
  }

  console.log('🚀 [executePurchase] Calling service.purchasePackage');
  const result = await service.purchasePackage(pkg, userId);
  console.log('✅ [executePurchase] Completed', { success: result.success });

  return result.success;
}
