export interface PaywallFeedbackTranslations {
  title: string;
  subtitle: string;
  submit: string;
  otherPlaceholder: string;
  reasons: {
    too_expensive: string;
    no_need: string;
    trying_out: string;
    technical_issues: string;
    other: string;
  };
}

export interface PaywallFeedbackScreenProps {
  onClose: () => void;
  onSubmit: (data: { reason: string; otherText?: string }) => void | Promise<void>;
  translations: PaywallFeedbackTranslations;
}
