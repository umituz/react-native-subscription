/**
 * Application flow events
 * Events emitted during high-level application flow transitions
 */

export const FLOW_EVENTS = {
  ONBOARDING_COMPLETED: "flow_onboarding_completed",
  PAYWALL_SHOWN: "flow_paywall_shown",
  PAYWALL_CLOSED: "flow_paywall_closed",
} as const;

export type FlowEventType = typeof FLOW_EVENTS[keyof typeof FLOW_EVENTS];

export interface OnboardingCompletedEvent {
  timestamp: number;
}

export interface PaywallShownEvent {
  timestamp: number;
}

export interface PaywallClosedEvent {
  timestamp: number;
}
