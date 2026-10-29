import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTour } from "./TourContext.tsx";
import { TourSpotlight } from "./TourSpotlight.tsx";
import { TourTooltipCard } from "./TourTooltipCard.tsx";
import { TourWelcomeModal } from "./TourWelcomeModal.tsx";
import { useTourPosition } from "./useTourPosition.ts";

export function EditorOnboarding() {
  const {
    isOpen,
    isWelcomeOpen,
    currentStep,
    currentStepIndex,
    totalSteps,
    hasAiStep,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
  } = useTour();

  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { spotlight, position } = useTourPosition(currentStep, cardRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  // Render overlay in document body portal
  return createPortal(
    <>
      {/* 1. Welcome Modal before Step 1 */}
      <TourWelcomeModal
        isOpen={isWelcomeOpen}
        onStart={() => startTour(false)}
        onSkip={skipTour}
        showAi={hasAiStep}
      />

      {/* 2. Walkthrough Spotlight and Tooltip Card */}
      {isOpen && currentStep && (
        <div className="editor-tour-container" aria-live="polite">
          <TourSpotlight spotlight={spotlight} onBackdropClick={skipTour} />

          <TourTooltipCard
            step={currentStep}
            stepIndex={currentStepIndex}
            totalSteps={totalSteps}
            position={position}
            cardRef={cardRef}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTour}
            onFinish={finishTour}
          />
        </div>
      )}
    </>,
    document.body
  );
}
