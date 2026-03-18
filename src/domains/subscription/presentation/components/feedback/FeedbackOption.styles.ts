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
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  inputContainer: {
    padding: 12,
  },
  textInput: {
    fontSize: 16,
    borderWidth: 1.5,
    lineHeight: 22,
  },
});
