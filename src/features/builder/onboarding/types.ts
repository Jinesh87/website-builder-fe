export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "center";

export type TourStep = {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  placement: TooltipPlacement;
  mobilePlacement?: TooltipPlacement;
  padding?: number;
  radius?: number;
  badge?: string;
  actionBeforeStep?: () => void;
};

export type SpotlightRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  isVisible: boolean;
};

export type TooltipPosition = {
  top: number;
  left: number;
  placement: TooltipPlacement;
  arrowOffset?: number;
  isFallbackCenter?: boolean;
};

export type TourContextValue = {
  isOpen: boolean;
  isWelcomeOpen: boolean;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: TourStep | null;
  hasCompleted: boolean;
  hasAiStep?: boolean;
  startTour: (showWelcome?: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: () => void;
  finishTour: () => void;
  resetTour: () => void;
};
