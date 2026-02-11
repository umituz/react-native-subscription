import { StyleSheet } from "react-native";

export const transactionListStyles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  stateContainer: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
