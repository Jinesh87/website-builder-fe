import { useCallback, useEffect, useState, type RefObject } from "react";
import type { SpotlightRect, TooltipPlacement, TooltipPosition, TourStep } from "./types.ts";

const VIEWPORT_MARGIN = 16;
const TOOLTIP_GAP = 14;
const DEFAULT_TOOLTIP_WIDTH = 360;
const DEFAULT_TOOLTIP_HEIGHT = 200;

export function useTourPosition(
  step: TourStep | null,
  tooltipRef: RefObject<HTMLDivElement | null>,
) {
  const [spotlight, setSpotlight] = useState<SpotlightRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    radius: 12,
    isVisible: false,
  });

  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    placement: "bottom",
    isFallbackCenter: true,
  });

  const updateCoordinates = useCallback(() => {
    if (!step) {
      setSpotlight((prev) => ({ ...prev, isVisible: false }));
      return;
    }

    const isMobile = window.innerWidth < 768;
    const targetElement = document.querySelector(step.targetSelector);

    // If target element is not found, fallback to centered card without crashing
    if (!targetElement) {
      setSpotlight({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        width: 0,
        height: 0,
        radius: 12,
        isVisible: false,
      });

      const tooltipWidth = tooltipRef.current?.offsetWidth || DEFAULT_TOOLTIP_WIDTH;
      const tooltipHeight = tooltipRef.current?.offsetHeight || DEFAULT_TOOLTIP_HEIGHT;

      setPosition({
        top: Math.max(VIEWPORT_MARGIN, (window.innerHeight - tooltipHeight) / 2),
        left: Math.max(VIEWPORT_MARGIN, (window.innerWidth - tooltipWidth) / 2),
        placement: "center",
        isFallbackCenter: true,
      });
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const padding = step.padding ?? 8;
    const radius = step.radius ?? 12;

    // Calculate spotlight cutout dimensions with bounding padding
    const spotX = Math.max(0, rect.left - padding);
    const spotY = Math.max(0, rect.top - padding);
    const spotWidth = Math.min(window.innerWidth - spotX, rect.width + padding * 2);
    const spotHeight = Math.min(window.innerHeight - spotY, rect.height + padding * 2);

    setSpotlight({
      x: spotX,
      y: spotY,
      width: spotWidth,
      height: spotHeight,
      radius,
      isVisible: true,
    });

    const tooltipWidth = tooltipRef.current?.offsetWidth || DEFAULT_TOOLTIP_WIDTH;
    const tooltipHeight = tooltipRef.current?.offsetHeight || DEFAULT_TOOLTIP_HEIGHT;

    let desiredPlacement: TooltipPlacement = (isMobile && step.mobilePlacement) ? step.mobilePlacement : step.placement;

    // Boundary checks & flip logic
    if (desiredPlacement === "bottom") {
      const bottomFits = spotY + spotHeight + TOOLTIP_GAP + tooltipHeight <= window.innerHeight - VIEWPORT_MARGIN;
      const topFits = spotY - TOOLTIP_GAP - tooltipHeight >= VIEWPORT_MARGIN;
      if (!bottomFits && topFits) {
        desiredPlacement = "top";
      }
    } else if (desiredPlacement === "top") {
      const topFits = spotY - TOOLTIP_GAP - tooltipHeight >= VIEWPORT_MARGIN;
      const bottomFits = spotY + spotHeight + TOOLTIP_GAP + tooltipHeight <= window.innerHeight - VIEWPORT_MARGIN;
      if (!topFits && bottomFits) {
        desiredPlacement = "bottom";
      }
    } else if (desiredPlacement === "left") {
      const leftFits = spotX - TOOLTIP_GAP - tooltipWidth >= VIEWPORT_MARGIN;
      const rightFits = spotX + spotWidth + TOOLTIP_GAP + tooltipWidth <= window.innerWidth - VIEWPORT_MARGIN;
      if (!leftFits) {
        desiredPlacement = rightFits ? "right" : "bottom";
      }
    } else if (desiredPlacement === "right") {
      const rightFits = spotX + spotWidth + TOOLTIP_GAP + tooltipWidth <= window.innerWidth - VIEWPORT_MARGIN;
      const leftFits = spotX - TOOLTIP_GAP - tooltipWidth >= VIEWPORT_MARGIN;
      if (!rightFits) {
        desiredPlacement = leftFits ? "left" : "bottom";
      }
    }

    let top = 0;
    let left = 0;

    switch (desiredPlacement) {
      case "top":
        top = spotY - TOOLTIP_GAP - tooltipHeight;
        left = spotX + spotWidth / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = spotY + spotHeight + TOOLTIP_GAP;
        left = spotX + spotWidth / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = spotY + spotHeight / 2 - tooltipHeight / 2;
        left = spotX - TOOLTIP_GAP - tooltipWidth;
        break;
      case "right":
        top = spotY + spotHeight / 2 - tooltipHeight / 2;
        left = spotX + spotWidth + TOOLTIP_GAP;
        break;
      case "center":
      default:
        top = (window.innerHeight - tooltipHeight) / 2;
        left = (window.innerWidth - tooltipWidth) / 2;
        break;
    }

    // Clamp coordinates within the viewport safely
    const clampedLeft = Math.max(
      VIEWPORT_MARGIN,
      Math.min(window.innerWidth - tooltipWidth - VIEWPORT_MARGIN, left)
    );
    const clampedTop = Math.max(
      VIEWPORT_MARGIN,
      Math.min(window.innerHeight - tooltipHeight - VIEWPORT_MARGIN, top)
    );

    setPosition({
      top: clampedTop,
      left: clampedLeft,
      placement: desiredPlacement,
      isFallbackCenter: false,
    });
  }, [step, tooltipRef]);

  useEffect(() => {
    // Initial run and requestAnimationFrame update
    updateCoordinates();
    const rafId = requestAnimationFrame(updateCoordinates);

    window.addEventListener("resize", updateCoordinates, { passive: true });
    window.addEventListener("scroll", updateCoordinates, { passive: true, capture: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateCoordinates();
      });
      resizeObserver.observe(document.body);
      if (step) {
        const targetElement = document.querySelector(step.targetSelector);
        if (targetElement) {
          resizeObserver.observe(targetElement);
        }
      }
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateCoordinates);
      window.removeEventListener("scroll", updateCoordinates, true);
      resizeObserver?.disconnect();
    };
  }, [updateCoordinates, step]);

  return { spotlight, position, recalculate: updateCoordinates };
}
