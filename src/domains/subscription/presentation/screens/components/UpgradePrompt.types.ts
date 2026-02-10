export interface Benefit {
  icon?: string;
  text: string;
}

export interface UpgradePromptProps {
  title: string;
  subtitle?: string;
  benefits?: readonly Benefit[];
  upgradeButtonLabel: string;
  onUpgrade: () => void;
}
