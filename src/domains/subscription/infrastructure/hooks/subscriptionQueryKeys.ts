export const SUBSCRIPTION_QUERY_KEYS = {
  packages: ["subscription", "packages"] as const,
  initialized: (userId: string) =>
    ["subscription", "initialized", userId] as const,
  customerInfo: ["subscription", "customerInfo"] as const,
} as const;
