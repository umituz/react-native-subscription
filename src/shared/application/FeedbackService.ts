import { collection, addDoc, doc } from "firebase/firestore";
import { getFirestore, serverTimestamp } from "@umituz/react-native-firebase";

interface FeedbackData {
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

async function submitFeedback(
  data: FeedbackData
): Promise<FeedbackSubmitResult> {
  const db = getFirestore();

  if (!db) {
    return { success: false, error: new Error("Firestore not available") };
  }

  if (!data.userId) {
    return { success: false, error: new Error("User ID is required") };
  }

  try {
    const userDocRef = doc(db, "users", data.userId);
    const feedbackCollectionRef = collection(userDocRef, "feedback");

    await addDoc(feedbackCollectionRef, {
      userEmail: data.userEmail,
      type: data.type,
      title: data.title,
      description: data.description,
      rating: data.rating ?? null,
      status: data.status ?? "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

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
