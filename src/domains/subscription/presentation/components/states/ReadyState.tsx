/**
 * Ready State Component
 *
 * Displays app content with optional offline banner and feedback.
 */

import React from "react";
import { FeedbackState } from "./FeedbackState";
import type { ManagedSubscriptionFlowProps } from "../ManagedSubscriptionFlow.types";

interface ReadyStateProps {
  children: React.ReactNode;
  offline?: ManagedSubscriptionFlowProps["offline"];
  feedbackConfig: ManagedSubscriptionFlowProps["feedback"];
  showFeedback: boolean;
  tokens: any;
  onFeedbackClose: () => void;
}

export const ReadyState: React.FC<ReadyStateProps> = ({
  children,
  offline,
  feedbackConfig,
  showFeedback,
  tokens,
  onFeedbackClose,
}) => {
  const { OfflineBanner } = require("@umituz/react-native-design-system/offline");

  return (
    <>
      {children}

      {offline && (
        <OfflineBanner
          visible={offline.isOffline}
          message={offline.message}
          backgroundColor={offline.backgroundColor || tokens.colors.error}
          position={offline.position || "top"}
        />
      )}

      {showFeedback && (
        <FeedbackState
          config={feedbackConfig}
          onClose={onFeedbackClose}
        />
      )}
    </>
  );
};
