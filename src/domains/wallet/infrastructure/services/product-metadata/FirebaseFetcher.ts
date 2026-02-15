import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { requireFirestore } from "../../../../../shared/infrastructure";
import type { ProductMetadata } from "../../../domain/types/wallet.types";

export async function fetchProductsFromFirebase(
  collectionName: string
): Promise<ProductMetadata[]> {
  const db = requireFirestore();
  const colRef = collection(db, collectionName);
  const q = query(colRef, orderBy("order", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    productId: docSnap.id,
    ...docSnap.data(),
  })) as ProductMetadata[];
}
