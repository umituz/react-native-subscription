import { Timestamp } from "firebase/firestore";
import type {
  PurchaseType,
  PurchaseMetadata,
  UserCreditsDocumentRead,
  PurchaseSource
} from "../core/UserCreditsDocument";
import { detectPackageType } from "../../../utils/packageTypeDetector";
import { PACKAGE_TYPE, PURCHASE_TYPE, type Platform } from "../../subscription/core/SubscriptionConstants";

/** Maximum number of purchase history entries to retain per user */
const MAX_PURCHASE_HISTORY_SIZE = 10;

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

  const existingLimit = typeof existingData.creditLimit === 'number' && Number.isFinite(existingData.creditLimit)
    ? existingData.creditLimit
    : 0;
  if (packageType !== PACKAGE_TYPE.UNKNOWN && creditLimit > existingLimit) {
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

  const purchaseHistory = [...existingData.purchaseHistory, newMetadata].slice(-MAX_PURCHASE_HISTORY_SIZE);

  return { purchaseType, purchaseHistory };
}
