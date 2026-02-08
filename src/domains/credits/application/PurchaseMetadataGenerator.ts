import { Timestamp } from "firebase/firestore";
import type { 
  PurchaseType, 
  PurchaseMetadata,
  UserCreditsDocumentRead,
  PurchaseSource
} from "../models/UserCreditsDocument";
import { detectPackageType } from "../../utils/packageTypeDetector";

export interface MetadataGeneratorConfig {
  productId?: string;
  source?: PurchaseSource;
  type?: PurchaseType;
  creditLimit: number;
  platform: "ios" | "android";
  appVersion?: string;
}

export class PurchaseMetadataGenerator {
  static generate(
    config: MetadataGeneratorConfig,
    existingData: UserCreditsDocumentRead | null
  ): { purchaseType: PurchaseType; purchaseHistory: PurchaseMetadata[] } {
    const { productId, source, type, creditLimit, platform, appVersion } = config;
    
    if (!productId || !source) {
      return { 
        purchaseType: type ?? "initial", 
        purchaseHistory: existingData?.purchaseHistory || [] 
      };
    }

    const packageType = detectPackageType(productId);
    let purchaseType: PurchaseType = type ?? "initial";

    if (existingData?.packageType && packageType !== "unknown") {
      const oldLimit = existingData.creditLimit || 0;
      if (creditLimit > oldLimit) purchaseType = "upgrade";
      else if (creditLimit < oldLimit) purchaseType = "downgrade";
      // This check is a bit fragile if purchaseId is not passed here, 
      // but we use the explicit 'type' if provided.
    }

    const newMetadata: PurchaseMetadata = {
      productId,
      packageType,
      creditLimit,
      source,
      type: purchaseType,
      platform,
      appVersion,
      timestamp: Timestamp.fromDate(new Date()) as any,
    };

    const purchaseHistory = [...(existingData?.purchaseHistory || []), newMetadata].slice(-10);

    return { purchaseType, purchaseHistory };
  }
}
