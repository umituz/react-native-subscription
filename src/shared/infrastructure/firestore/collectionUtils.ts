import { collection, doc } from "firebase/firestore";
import {
  getFirestore,
  type CollectionReference,
  type DocumentReference,
  type Firestore,
} from "@umituz/react-native-firebase";

export interface CollectionConfig {
  collectionName: string;
  useUserSubcollection: boolean;
}

export function buildCollectionRef(
  db: Firestore,
  userId: string,
  config: CollectionConfig
): CollectionReference {
  if (config.useUserSubcollection) {
    return collection(db, "users", userId, config.collectionName);
  }
  return collection(db, config.collectionName);
}

export function buildDocRef(
  db: Firestore,
  userId: string,
  docId: string,
  config: CollectionConfig
): DocumentReference {
  if (config.useUserSubcollection) {
    return doc(db, "users", userId, config.collectionName, docId);
  }
  return doc(db, config.collectionName, userId);
}

export function requireFirestore(): Firestore {
  const db = getFirestore();
  if (!db) {
    throw new Error("Firestore instance is not available");
  }
  return db;
}
