import { getDoc } from "firebase/firestore";
import type { Firestore, DocumentReference } from "@umituz/react-native-firebase";
import type { CreditsResult } from "../../core/Credits";
import type { UserCreditsDocumentRead } from "../../core/UserCreditsDocument";
import { mapCreditsDocumentToEntity } from "../../core/CreditsMapper";
import { requireFirestore } from "../../../../shared/infrastructure/firestore";

export async function fetchCredits(ref: DocumentReference): Promise<CreditsResult> {
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { success: true, data: null, error: null };
  }

  const entity = mapCreditsDocumentToEntity(snap.data() as UserCreditsDocumentRead);
  return { success: true, data: entity, error: null };
}

export async function checkHasCredits(ref: DocumentReference, cost: number): Promise<boolean> {
  const result = await fetchCredits(ref);
  if (!result.success || !result.data) return false;
  return result.data.credits >= cost;
}
