/**
 * Dev Test Callbacks Hook
 * Provides test functions for subscription renewal testing
 * Only used in __DEV__ mode
 */

import { useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "@umituz/react-native-auth";
import { getCreditsRepository } from "../../infrastructure/repositories/CreditsRepositoryProvider";
import { useCredits } from "./useCredits";
import type { DevTestActions } from "../screens/components/DevTestSection";

export const useDevTestCallbacks = (): DevTestActions | undefined => {
  const { user } = useAuth();
  const { credits, refetch } = useCredits({ userId: user?.uid });

  const onTestRenewal = useCallback(async () => {
    if (!user?.uid) {
      Alert.alert("Error", "No user logged in");
      return;
    }

    try {
      const repository = getCreditsRepository();
      const renewalId = `dev_renewal_${Date.now()}`;
      const productId = "test_yearly_subscription";

      if (__DEV__) {
        console.log("🧪 [Dev Test] Simulating auto-renewal...", {
          userId: user.uid,
          renewalId,
        });
      }

      const result = await repository.initializeCredits(
        user.uid,
        renewalId,
        productId,
      );

      if (__DEV__) {
        console.log("✅ [Dev Test] Renewal completed:", {
          success: result.success,
          textCredits: result.data?.textCredits,
          imageCredits: result.data?.imageCredits,
        });
      }

      await refetch();

      Alert.alert(
        "✅ Test Renewal Success",
        `Credits Updated!\n\nText: ${result.data?.textCredits || 0}\nImage: ${result.data?.imageCredits || 0}\n\n(ACCUMULATE mode - credits added to existing)`,
        [{ text: "OK" }],
      );
    } catch (error) {
      if (__DEV__) {
        console.error("❌ [Dev Test] Renewal failed:", error);
      }
      Alert.alert(
        "Test Failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }, [user?.uid, refetch]);

  const onCheckCredits = useCallback(() => {
    if (!credits) {
      Alert.alert("Credits", "No credits data available");
      return;
    }

    Alert.alert(
      "📊 Current Credits",
      `Text Generation: ${credits.textCredits}\nImage Generation: ${credits.imageCredits}\n\nPurchased: ${credits.purchasedAt?.toLocaleDateString() || "N/A"}`,
      [{ text: "OK" }],
    );
  }, [credits]);

  const onTestDuplicate = useCallback(async () => {
    if (!user?.uid) {
      Alert.alert("Error", "No user logged in");
      return;
    }

    try {
      const repository = getCreditsRepository();
      const sameRenewalId = "dev_duplicate_test_12345";

      if (__DEV__) {
        console.log("🧪 [Dev Test] Testing duplicate protection...");
      }

      const result1 = await repository.initializeCredits(
        user.uid,
        sameRenewalId,
        "test_product",
      );
      if (__DEV__) {
        console.log("First call:", result1.data);
      }

      const result2 = await repository.initializeCredits(
        user.uid,
        sameRenewalId,
        "test_product",
      );
      if (__DEV__) {
        console.log("Second call:", result2.data);
      }

      await refetch();

      const duplicateProtectionWorks =
        result2.data?.textCredits === result1.data?.textCredits;

      Alert.alert(
        "Duplicate Test",
        `First call: ${result1.success ? "✅ Added credits" : "❌ Failed"}\n\nSecond call: ${duplicateProtectionWorks ? "✅ Skipped (protection works!)" : "❌ Added again (protection failed!)"}`,
        [{ text: "OK" }],
      );
    } catch (error) {
      if (__DEV__) {
        console.error("❌ [Dev Test] Duplicate test failed:", error);
      }
      Alert.alert(
        "Test Failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }, [user?.uid, refetch]);

  if (!__DEV__) {
    return undefined;
  }

  return {
    onTestRenewal,
    onCheckCredits,
    onTestDuplicate,
  };
};
