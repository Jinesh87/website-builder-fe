import { createContext, useContext } from "react";

export interface MarketingContextValue {
  toast: (message: string) => void;
  previewTemplate: (index: number) => void;
  startWithTemplate: (index: number) => void;
  shortlist: number[];
  toggleShortlist: (index: number) => void;
  openShortlist: () => void;
}

export const MarketingContext = createContext<MarketingContextValue | null>(null);

export function useMarketing() {
  const value = useContext(MarketingContext);
  if (!value) throw new Error("useMarketing must be used inside MarketingLayout");
  return value;
}

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
