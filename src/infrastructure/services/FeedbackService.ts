/**
 * Feedback Service
 * Handles feedback submission to Firestore
 */

import { getFirestore } from "@umituz/react-native-firebase";
import { collection, addDoc } from "firebase/firestore";

export interface FeedbackData {
  userId: string | null;
  userEmail: string | null;
  type: string;
  title: string;
  description: string;
  rating?: number;
  status?: string;
}

export interface FeedbackSubmitResult {
  success: boolean;
  error?: Error;
}

const FEEDBACK_COLLECTION = "feedback";

/**
 * Submit feedback to Firestore
 */
export async function submitFeedback(
  data: FeedbackData
): Promise<FeedbackSubmitResult> {
  const db = getFirestore();

  if (!db) {
    if (__DEV__) {
      console.warn("[FeedbackService] Firestore not available");
    }
    return { success: false, error: new Error("Firestore not available") };
  }

  try {
    if (__DEV__) {
      console.log("[FeedbackService] Submitting feedback:", {
        type: data.type,
        userId: data.userId?.slice(0, 8),
      });
    }

    const now = new Date().toISOString();

    await addDoc(collection(db, FEEDBACK_COLLECTION), {
      userId: data.userId,
      userEmail: data.userEmail,
      type: data.type,
      title: data.title,
      description: data.description,
      rating: data.rating ?? null,
      status: data.status ?? "pending",
      createdAt: now,
      updatedAt: now,
    });

    if (__DEV__) {
      console.log("[FeedbackService] Feedback submitted successfully");
    }

    return { success: true };
  } catch (error) {
    if (__DEV__) {
      console.error("[FeedbackService] Submit error:", error);
    }
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

/**
 * Submit paywall decline feedback
 */
export async function submitPaywallFeedback(
  userId: string | null,
  userEmail: string | null,
  reason: string
): Promise<FeedbackSubmitResult> {
  return submitFeedback({
    userId,
    userEmail,
    type: "paywall_declined",
    title: "Paywall Declined",
    description: reason,
  });
}

/**
 * Submit general settings feedback
 */
export async function submitSettingsFeedback(
  userId: string | null,
  userEmail: string | null,
  data: {
    type?: string;
    title?: string;
    description: string;
    rating?: number;
  }
): Promise<FeedbackSubmitResult> {
  return submitFeedback({
    userId,
    userEmail,
    type: data.type ?? "general",
    title: data.title ?? "Settings Feedback",
    description: data.description,
    rating: data.rating,
  });
}
