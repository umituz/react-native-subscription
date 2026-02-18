/**
 * Firestore Collection Utilities
 * Shared utilities for building Firestore collection and document references
 */

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

/**
 * Build a collection reference based on configuration
 * Supports both root collections and user subcollections
 */
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

/**
 * Build a document reference based on configuration
 * Supports both root collections and user subcollections
 */
export function buildDocRef(
  db: Firestore,
  userId: string,
  docId: string,
  config: CollectionConfig
): DocumentReference {
  if (config.useUserSubcollection) {
    return doc(db, "users", userId, config.collectionName, docId);
  }
  return doc(db, config.collectionName, docId);
}

/**
 * Get Firestore instance or throw error
 */
export function requireFirestore(): Firestore {
  const db = getFirestore();
  if (!db) {
    throw new Error("Firestore instance is not available");
  }
  return db;
}
