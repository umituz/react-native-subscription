import { StyleSheet } from "react-native";

export const feedbackOptionStyles = StyleSheet.create({
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    flex: 1,
    marginRight: 12,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inputContainer: {
    padding: 12,
  },
  textInput: {
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
