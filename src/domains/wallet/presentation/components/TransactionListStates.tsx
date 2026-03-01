import React from "react";
import { View } from "react-native";
import { AtomicText, AtomicIcon, AtomicSpinner } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { transactionListStyles } from "./TransactionList.styles";

interface LoadingStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => (
  <AtomicSpinner size="lg" color="primary" text={message} style={transactionListStyles.stateContainer} />
);

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  const tokens = useAppDesignTokens();
  return (
    <View style={transactionListStyles.stateContainer}>
      <AtomicIcon name="file-tray-outline" size="xl" color="secondary" />
      <AtomicText type="bodyMedium" style={[transactionListStyles.stateText, { color: tokens.colors.textSecondary }]}>
        {message}
      </AtomicText>
    </View>
  );
};
