import { StyleSheet } from "react-native";

export const transactionItemStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  reason: {
    fontWeight: "600",
  },
  change: {
    fontWeight: "700",
    marginLeft: 12,
  },
});
