export const creditsQueryKeys = {
  all: ["credits"] as const,
  user: (userId: string | null | undefined) =>
    userId ? (["credits", userId] as const) : (["credits"] as const),
};
