import type { CustomerInfo } from "react-native-purchases";

export interface UseCustomerInfoResult {
  customerInfo: CustomerInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isFetching: boolean;
}
