import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getHasCompletedTour, resetTourStorage, setHasCompletedTour } from "./storage.ts";
import { EDITOR_TOUR_STEPS } from "./tour-steps.ts";
import type { TourContextValue, TourStep } from "./types.ts";

export const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

type TourProviderProps = {
  children: ReactNode;
  steps?: TourStep[];
  autoStartForFirstTime?: boolean;
};

export function TourProvider({
  children,
  steps = EDITOR_TOUR_STEPS,
  autoStartForFirstTime = true,
}: TourProviderProps) {
  const [hasCompleted, setHasCompleted] = useState<boolean>(() => getHasCompletedTour());
  const [isOpen, setIsOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Auto-trigger for first-time visitors once mounted
  useEffect(() => {
    if (autoStartForFirstTime && !hasCompleted) {
      // Small timeout to allow the editor DOM to mount smoothly
      const timer = window.setTimeout(() => {
        setIsWelcomeOpen(true);
      }, 700);
      return () => window.clearTimeout(timer);
    }
  }, [autoStartForFirstTime, hasCompleted]);

  const startTour = useCallback((showWelcome = false) => {
    setCurrentStepIndex(0);
    if (showWelcome) {
      setIsWelcomeOpen(true);
      setIsOpen(false);
    } else {
      setIsWelcomeOpen(false);
      setIsOpen(true);
    }
  }, []);

  const skipTour = useCallback(() => {
    setIsOpen(false);
    setIsWelcomeOpen(false);
    setHasCompletedTour(true);
    setHasCompleted(true);
  }, []);

  const finishTour = useCallback(() => {
    setIsOpen(false);
    setIsWelcomeOpen(false);
    setHasCompletedTour(true);
    setHasCompleted(true);
  }, []);

  const resetTour = useCallback(() => {
    resetTourStorage();
    setHasCompleted(false);
    startTour(false);
  }, [startTour]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      steps[nextIndex]?.actionBeforeStep?.();
      setCurrentStepIndex(nextIndex);
    } else {
      finishTour();
    }
  }, [currentStepIndex, steps, finishTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      steps[prevIndex]?.actionBeforeStep?.();
      setCurrentStepIndex(prevIndex);
    }
  }, [currentStepIndex, steps]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        steps[index]?.actionBeforeStep?.();
        setCurrentStepIndex(index);
      }
    },
    [steps]
  );

  // Keyboard navigation handler
  useEffect(() => {
    if (!isOpen && !isWelcomeOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept keyboard shortcuts if user is typing in an input
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        skipTour();
        return;
      }

      if (isOpen) {
        if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nextStep();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevStep();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isWelcomeOpen, nextStep, prevStep, skipTour]);

  const currentStep = useMemo(() => {
    return isOpen && steps[currentStepIndex] ? steps[currentStepIndex] : null;
  }, [isOpen, steps, currentStepIndex]);

  const value = useMemo<TourContextValue>(
    () => ({
      isOpen,
      isWelcomeOpen,
      currentStepIndex,
      totalSteps: steps.length,
      currentStep,
      hasCompleted,
      startTour,
      nextStep,
      prevStep,
      goToStep,
      skipTour,
      finishTour,
      resetTour,
    }),
    [
      isOpen,
      isWelcomeOpen,
      currentStepIndex,
      steps.length,
      currentStep,
      hasCompleted,
      startTour,
      nextStep,
      prevStep,
      goToStep,
      skipTour,
      finishTour,
      resetTour,
    ]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
