import { doc } from "firebase/firestore";
import { getFirestore, runTransaction, serverTimestamp, type Firestore, type Transaction } from "@umituz/react-native-firebase";
import type { DeviceTrialRecord } from "../core/TrialTypes";

const DEVICE_TRIALS_COLLECTION = "device_trials";

export class DeviceTrialRepository {
  private get db(): Firestore | null {
    return getFirestore();
  }

  async getRecord(deviceId: string): Promise<DeviceTrialRecord | null> {
    if (!this.db) return null;
    const ref = doc(this.db, DEVICE_TRIALS_COLLECTION, deviceId);
    const snap = await runTransaction(async (tx: Transaction) => {
      return tx.get(ref);
    });
    return snap.exists() ? snap.data() as DeviceTrialRecord : null;
  }

  async saveRecord(deviceId: string, data: Partial<DeviceTrialRecord>): Promise<boolean> {
    if (!this.db) return false;
    const ref = doc(this.db, DEVICE_TRIALS_COLLECTION, deviceId);

    // Atomic check-then-act: ensure createdAt is set only once
    await runTransaction(async (tx: Transaction) => {
      const snap = await tx.get(ref);
      const existingData = snap.data();

      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (!existingData?.createdAt) {
        updateData.createdAt = serverTimestamp();
      }

      tx.set(ref, updateData, { merge: true });
    });

    return true;
  }
}
