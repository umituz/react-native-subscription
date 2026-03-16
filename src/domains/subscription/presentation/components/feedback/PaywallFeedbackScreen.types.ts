import type { PaywallFeedbackTranslations } from "./PaywallFeedbackModal.types";

export interface PaywallFeedbackScreenProps {
  onClose: () => void;
  onSubmit: (data: { reason: string; otherText?: string }) => void | Promise<void>;
  translations: PaywallFeedbackTranslations;
}
