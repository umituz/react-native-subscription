/**
 * useDeductCredit Hook
 *
 * TanStack Query mutation hook for deducting credits.
 * Generic and reusable - uses module-level repository.
 */

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreditType, UserCredits } from "@domain/entities/Credits";
import { getCreditsRepository } from "@infrastructure/repositories/CreditsRepositoryProvider";
import { creditsQueryKeys } from "./useCredits";

export interface UseDeductCreditParams {
  userId: string | undefined;
  onCreditsExhausted?: () => void;
}

export interface UseDeductCreditResult {
  deductCredit: (creditType: CreditType) => Promise<boolean>;
  isDeducting: boolean;
}

export const useDeductCredit = ({
  userId,
  onCreditsExhausted,
}: UseDeductCreditParams): UseDeductCreditResult => {
  const repository = getCreditsRepository();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (creditType: CreditType) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      return repository.deductCredit(userId, creditType);
    },
    onMutate: async (creditType: CreditType) => {
      if (!userId) return;

      await queryClient.cancelQueries({
        queryKey: creditsQueryKeys.user(userId),
      });

      const previousCredits = queryClient.getQueryData<UserCredits>(
        creditsQueryKeys.user(userId)
      );

      queryClient.setQueryData<UserCredits | null>(
        creditsQueryKeys.user(userId),
        (old) => {
          if (!old) return old;
          const fieldName =
            creditType === "text" ? "textCredits" : "imageCredits";
          return {
            ...old,
            [fieldName]: Math.max(0, old[fieldName] - 1),
            lastUpdatedAt: new Date(),
          };
        }
      );

      return { previousCredits };
    },
    onError: (_err, _creditType, context) => {
      if (userId && context?.previousCredits) {
        queryClient.setQueryData(
          creditsQueryKeys.user(userId),
          context.previousCredits
        );
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: creditsQueryKeys.user(userId),
        });
      }
    },
  });

  const deductCredit = useCallback(async (creditType: CreditType): Promise<boolean> => {
    try {
      const result = await mutation.mutateAsync(creditType);

      if (!result.success) {
        if (result.error?.code === "CREDITS_EXHAUSTED") {
          onCreditsExhausted?.();
        }
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }, [mutation, onCreditsExhausted]);

  return {
    deductCredit,
    isDeducting: mutation.isPending,
  };
};

export interface UseInitializeCreditsParams {
  userId: string | undefined;
}

export interface InitializeCreditsOptions {
  purchaseId?: string;
  productId?: string;
}

export interface UseInitializeCreditsResult {
  initializeCredits: (options?: InitializeCreditsOptions) => Promise<boolean>;
  isInitializing: boolean;
}

export const useInitializeCredits = ({
  userId,
}: UseInitializeCreditsParams): UseInitializeCreditsResult => {
  const repository = getCreditsRepository();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (options?: InitializeCreditsOptions) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      if (__DEV__) {
        console.log("[useInitializeCredits] Initializing credits:", {
          userId,
          purchaseId: options?.purchaseId,
          productId: options?.productId,
        });
      }

      return repository.initializeCredits(
        userId,
        options?.purchaseId,
        options?.productId
      );
    },
    onSuccess: (result) => {
      if (userId && result.success && result.data) {
        if (__DEV__) {
          console.log("[useInitializeCredits] Success, updating cache:", result.data);
        }

        // Set the data immediately for optimistic UI
        queryClient.setQueryData(creditsQueryKeys.user(userId), result.data);
        // Also invalidate to ensure all subscribers get the update
        queryClient.invalidateQueries({
          queryKey: creditsQueryKeys.user(userId),
        });
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.error("[useInitializeCredits] Error:", error);
      }
    },
  });

  const initializeCredits = useCallback(
    async (options?: InitializeCreditsOptions): Promise<boolean> => {
      try {
        const result = await mutation.mutateAsync(options);
        return result.success;
      } catch {
        return false;
      }
    },
    [mutation]
  );

  return {
    initializeCredits,
    isInitializing: mutation.isPending,
  };
};
