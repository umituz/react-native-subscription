import { Timestamp } from "firebase/firestore";
import type {
  PurchaseType,
  PurchaseMetadata,
  UserCreditsDocumentRead,
  PurchaseSource
} from "../core/UserCreditsDocument";
import { detectPackageType } from "../../../utils/packageTypeDetector";

export interface MetadataGeneratorConfig {
  productId: string;
  source: PurchaseSource;
  type: PurchaseType;
  creditLimit: number;
  platform: "ios" | "android";
  appVersion: string;
}

export class PurchaseMetadataGenerator {
  static generate(
    config: MetadataGeneratorConfig,
    existingData: UserCreditsDocumentRead
  ): { purchaseType: PurchaseType; purchaseHistory: PurchaseMetadata[] } {
    const { productId, source, type, creditLimit, platform, appVersion } = config;

    const packageType = detectPackageType(productId);
    let purchaseType: PurchaseType = type;

    if (packageType !== "unknown") {
      const oldLimit = existingData.creditLimit;
      if (creditLimit > oldLimit) {
        purchaseType = "upgrade";
      } else if (creditLimit < oldLimit) {
        purchaseType = "downgrade";
      }
    }

    const newMetadata: PurchaseMetadata = {
      productId,
      packageType,
      creditLimit,
      source,
      type: purchaseType,
      platform,
      appVersion,
      timestamp: Timestamp.fromDate(new Date()),
    };

    const purchaseHistory = [...existingData.purchaseHistory, newMetadata].slice(-10);

    return { purchaseType, purchaseHistory };
  }
}
