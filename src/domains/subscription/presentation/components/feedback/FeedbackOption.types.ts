export interface FeedbackOptionProps {
  isSelected: boolean;
  text: string;
  showInput: boolean;
  placeholder: string;
  inputValue: string;
  onSelect: () => void;
  onChangeText: (text: string) => void;
}
