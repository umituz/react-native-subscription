/**
 * Feedback State Component
 *
 * Displays feedback screen to collect user input.
 */

import React from "react";
import { PaywallFeedbackScreen } from "../feedback/PaywallFeedbackScreen";
import { usePaywallFeedbackSubmit } from "../../../../../presentation/hooks/feedback/useFeedbackSubmit";
import type { ManagedSubscriptionFlowProps } from "../ManagedSubscriptionFlow.types";

interface FeedbackStateProps {
  config: ManagedSubscriptionFlowProps["feedback"];
  onClose: () => void;
}

export const FeedbackState: React.FC<FeedbackStateProps> = ({ config, onClose }) => {
  const { submit: internalSubmit } = usePaywallFeedbackSubmit();

  const handleSubmit = async (data: { reason: string; otherText?: string }) => {
    if (config.onSubmit) {
      await config.onSubmit(data);
    } else {
      const description = data.otherText ? `${data.reason}: ${data.otherText}` : data.reason;
      await internalSubmit(description);
    }
  };

  return (
    <PaywallFeedbackScreen
      onClose={onClose}
      onSubmit={handleSubmit}
      translations={config.translations}
    />
  );
};
