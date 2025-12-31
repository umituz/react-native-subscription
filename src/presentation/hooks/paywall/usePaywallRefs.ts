import { useRef, useEffect } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import type { PaywallRefs } from "./types";

interface UsePaywallRefsProps {
  userId: string | undefined;
  isAnonymous: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  closePaywall: () => void;
  onPurchaseSuccess?: () => void;
}

export function usePaywallRefs({
  userId,
  isAnonymous,
  purchasePackage,
  closePaywall,
  onPurchaseSuccess,
}: UsePaywallRefsProps): PaywallRefs {
  const userIdRef = useRef(userId);
  const isAnonymousRef = useRef(isAnonymous);
  const purchasePackageRef = useRef(purchasePackage);
  const closePaywallRef = useRef(closePaywall);
  const onPurchaseSuccessRef = useRef(onPurchaseSuccess);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    isAnonymousRef.current = isAnonymous;
  }, [isAnonymous]);

  useEffect(() => {
    purchasePackageRef.current = purchasePackage;
  }, [purchasePackage]);

  useEffect(() => {
    closePaywallRef.current = closePaywall;
  }, [closePaywall]);

  useEffect(() => {
    onPurchaseSuccessRef.current = onPurchaseSuccess;
  }, [onPurchaseSuccess]);

  return {
    userIdRef,
    isAnonymousRef,
    purchasePackageRef,
    closePaywallRef,
    onPurchaseSuccessRef,
  };
}
