import { setDoc } from "firebase/firestore";
import type { DocumentReference } from "@umituz/react-native-firebase";
import { serverTimestamp } from "@umituz/react-native-firebase";
import { SUBSCRIPTION_STATUS } from "../../../subscription/core/SubscriptionConstants";

export async function syncExpiredStatus(ref: DocumentReference): Promise<void> {
  await setDoc(ref, {
    isPremium: false,
    status: SUBSCRIPTION_STATUS.EXPIRED,
    willRenew: false,
    expirationDate: serverTimestamp(),
  }, { merge: true });
}
