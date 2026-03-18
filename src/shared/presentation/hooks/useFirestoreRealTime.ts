/**
 * Generic real-time sync hook for Firestore.
 *
 * Eliminates 90% duplication from real-time hooks:
 * - useCreditsRealTime: 116 → ~35 lines
 * - useTransactionHistory: 98 → ~30 lines
 *
 * Features:
 * - Generic type support for any document/collection
 * - Automatic cleanup with unsubscribe
 * - Consistent error handling
 * - Loading state management
 * - Type-safe mapper function
 * - Support for both document and collection queries
 */

import { useEffect, useState, useCallback } from "react";
import {
  onSnapshot,
  type Query,
  type DocumentReference,
} from "firebase/firestore";
import type { HookState, HookStateWithEmpty } from "../types/hookState.types";
import { logError, logWarn } from "../../utils/logger";

/**
 * Configuration for building a Firestore document reference.
 */
export interface DocumentConfig {
  /** Collection name */
  collectionName: string;

  /** Whether to use a user subcollection (users/{userId}/{collectionName}) */
  useUserSubcollection: boolean;

  /** Document ID (fixed string or function that takes userId) */
  docId: string | ((userId: string) => string);
}

/**
 * Configuration for building a Firestore collection query.
 */
export interface CollectionConfig {
  /** Collection name */
  collectionName: string;

  /** Whether to use a user subcollection (users/{userId}/{collectionName}) */
  useUserSubcollection: boolean;
}

/**
 * Query builder for collection queries.
 * Takes a Firestore collection reference and returns a Query with constraints.
 */
export type QueryBuilder<T> = (collection: any) => Query<T>;

/**
 * Mapper function to convert Firestore document data to domain entity.
 */
export type Mapper<TDocument, TEntity> = (
  doc: TDocument,
  docId: string
) => TEntity;

/**
 * Generic hook for real-time document sync via Firestore onSnapshot.
 *
 * @template TDocument - Firestore document type
 * @template TEntity - Domain entity type
 *
 * @param userId - User ID to fetch document for
 * @param docRef - Document reference from Firestore
 * @param mapper - Function to map document data to entity
 * @param tag - Logging tag for debugging
 *
 * @returns Hook state with data, loading, error, and refetch
 */
export function useFirestoreDocumentRealTime<TDocument, TEntity>(
  userId: string | null | undefined,
  docRef: DocumentReference<TDocument> | null,
  mapper: Mapper<TDocument, TEntity>,
  tag: string
): HookState<TEntity> {
  const [data, setData] = useState<TEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when userId changes
    if (!userId) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!docRef) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const entity = mapper(snapshot.data() as TDocument, snapshot.id);
          setData(entity);
        } else {
          setData(null);
        }
        setIsLoading(false);
      },
      (err: Error) => {
        logError(tag, "Snapshot error", err, { userId });
        setError(err);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, docRef, mapper, tag]);

  const refetch = useCallback(() => {
    // Real-time sync doesn't need refetch, but keep for API compatibility
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      logWarn(tag, "Refetch called - not needed for real-time sync");
    }
  }, [tag]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Generic hook for real-time collection sync via Firestore onSnapshot.
 *
 * @template TDocument - Firestore document type
 * @template TEntity - Domain entity type
 *
 * @param userId - User ID to fetch collection for
 * @param query - Firestore query to listen to
 * @param mapper - Function to map document data to entity
 * @param tag - Logging tag for debugging
 *
 * @returns Hook state with array data, loading, error, refetch, and isEmpty
 */
export function useFirestoreCollectionRealTime<TDocument, TEntity>(
  userId: string | null | undefined,
  query: Query<TDocument>,
  mapper: Mapper<TDocument, TEntity>,
  tag: string
): HookStateWithEmpty<TEntity> {
  const [data, setData] = useState<TEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when userId changes
    if (!userId) {
      setData([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const entities: TEntity[] = [];
        snapshot.forEach((doc) => {
          entities.push(mapper(doc.data() as TDocument, doc.id));
        });
        setData(entities);
        setIsLoading(false);
      },
      (err: Error) => {
        logError(tag, "Snapshot error", err, { userId });
        setError(err);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, query, mapper, tag]);

  const refetch = useCallback(() => {
    // Real-time sync doesn't need refetch, but keep for API compatibility
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      logWarn(tag, "Refetch called - not needed for real-time sync");
    }
  }, [tag]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isEmpty: data.length === 0,
  };
}
