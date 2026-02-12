import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore, serverTimestamp, type Firestore } from "@umituz/react-native-firebase";
import type { DeviceTrialRecord } from "../core/TrialTypes";

const DEVICE_TRIALS_COLLECTION = "device_trials";

export class DeviceTrialRepository {
  private get db(): Firestore | null {
    return getFirestore();
  }

  async getRecord(deviceId: string): Promise<DeviceTrialRecord | null> {
    if (!this.db) return null;
    const snap = await getDoc(doc(this.db, DEVICE_TRIALS_COLLECTION, deviceId));
    return snap.exists() ? snap.data() as DeviceTrialRecord : null;
  }

  async saveRecord(deviceId: string, data: Partial<DeviceTrialRecord>): Promise<boolean> {
    if (!this.db) return false;
    const ref = doc(this.db, DEVICE_TRIALS_COLLECTION, deviceId);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    
    // Ensure createdAt exists
    const snap = await getDoc(ref);
    if (!snap.data()?.createdAt) {
      await setDoc(ref, { createdAt: serverTimestamp() }, { merge: true });
    }
    return true;
  }
}
