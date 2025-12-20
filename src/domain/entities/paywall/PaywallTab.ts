/**
 * Paywall Tab Entity
 * Represents paywall tab types
 */

export type PaywallTabType = "credits" | "subscription";

export interface PaywallTab {
  id: PaywallTabType;
  label: string;
}
