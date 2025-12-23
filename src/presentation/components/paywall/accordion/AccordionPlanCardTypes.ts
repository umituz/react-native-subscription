/**
 * Accordion Plan Card Types
 * Type definitions for accordion-style subscription cards
 */

import type { PurchasesPackage } from "react-native-purchases";

export interface AccordionPlanCardProps {
  package: PurchasesPackage;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  isBestValue?: boolean;
  creditAmount?: number;
}

export interface PlanCardHeaderProps {
  title: string;
  price: string;
  creditAmount?: number;
  isSelected: boolean;
  isExpanded: boolean;
  isBestValue?: boolean;
  onToggle: () => void;
}

export interface PlanCardDetailsProps {
  fullPrice: string;
  monthlyEquivalent: string | null;
  periodLabel: string;
  isYearly: boolean;
}
