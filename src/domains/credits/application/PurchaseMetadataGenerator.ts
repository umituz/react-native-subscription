import { Timestamp } from "@umituz/react-native-firebase";
import type {
  PurchaseType,
  PurchaseMetadata,
  UserCreditsDocumentRead,
  PurchaseSource
} from "../core/UserCreditsDocument";
import { detectPackageType } from "../../../utils/packageTypeDetector";
import { PACKAGE_TYPE, PURCHASE_TYPE, type Platform } from "../../subscription/core/SubscriptionConstants";

interface MetadataGeneratorConfig {
  productId: string;
  source: PurchaseSource;
  type: PurchaseType;
  creditLimit: number;
  platform: Platform;
  appVersion: string;
}

export function generatePurchaseMetadata(
  config: MetadataGeneratorConfig,
  existingData: UserCreditsDocumentRead
): { purchaseType: PurchaseType; purchaseHistory: PurchaseMetadata[] } {
  const { productId, source, type, creditLimit, platform, appVersion } = config;

  const packageType = detectPackageType(productId);
  let purchaseType: PurchaseType = type;

  if (packageType !== PACKAGE_TYPE.UNKNOWN && creditLimit > existingData.creditLimit) {
    purchaseType = PURCHASE_TYPE.UPGRADE;
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
